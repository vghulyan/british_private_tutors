import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";

import {
  AuditAction,
  NotificationCategory,
  NotificationType,
  PhoneType,
  Prisma,
  SeverityLevel,
  User,
  UserRole,
} from "@prisma/client";
import { Request, Response } from "express";
import {
  AuthRequest,
  LoginRequestBody,
  sendResponse,
  STATUS,
} from "../interfaces";
import { parseDuration } from "../utils/parseDuration";

import parsePhoneNumberFromString from "libphonenumber-js";
import {
  ACCESS_TOKEN_EXPIRES,
  ACCESS_TOKEN_SECRET,
  NODE_ENV,
  REFRESH_TOKEN_EXPIRES,
  REFRESH_TOKEN_SECRET,
} from "../utils/config";
import prisma from "../utils/prisma";

import { sendEmailByTemplateLogic } from "../service/email";
import { sendVerificationEmail } from "../service/email/verification/sendVerificationEmail";
import {
  EXPECTED_BACKUP_CODE_LENGTH,
  EXPECTED_TOTP_LENGTH,
  verifyBackupCode,
} from "../utils/backupCodes";
import { decryptString } from "../utils/encryption";
import { sanitizeAll } from "../utils/sanitizeInput";

import { subHours } from "date-fns";
import { extractErrorDetails, logError } from "../utils/errorLogService";

export async function hasRecentlyRequestedReset(
  userId: string,
  maxRequests: number = 3,
  withinHours: number = 24
): Promise<boolean> {
  // Calculate the timeframe cutoff
  const cutoff = subHours(new Date(), withinHours);

  const requestsCount = await prisma.passwordResetRequest.count({
    where: {
      userId,
      createdAt: {
        gte: cutoff, // greater or equal to `cutoff`
      },
    },
  });

  return requestsCount >= maxRequests;
}

export function generateJWTToken(userId: string): string {
  const payload = { userId };
  return jwt.sign(payload, ACCESS_TOKEN_EXPIRES!, { expiresIn: "15m" });
}

export function verifyToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_EXPIRES!) as {
    userId: string;
  };
  return decoded;
}

// Interface for the expected request body
export function generateTokens(user: User) {
  const accessToken = jwt.sign(
    {
      UserInfo: {
        userName: user.email,
        role: user.role,
        userId: user.id,
      },
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    {
      UserInfo: {
        userName: user.email,
        role: user.role,
        userId: user.id,
      },
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );

  return { accessToken, refreshToken };
}

// @desc Login
// @route POST /api/auth/login
// @access Public
export const login = async (req: Request, res: Response): Promise<void> => {
  const { userName, password, token } = req.body as LoginRequestBody;

  if (!userName || !password) {
    sendResponse(res, 400, STATUS.ERROR, "Wrong or missing data");
    return;
  }
  try {
    const foundUser = await prisma.user.findUnique({
      where: { email: userName },
    });

    if (!foundUser || foundUser.isDeleted) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized");
      return;
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized");
      return;
    }

    // -------------------------------- 2FA | Backup Codes ------------------
    // Check if 2FA is enabled
    if (foundUser.twoFactorEnabled) {
      if (!token) {
        // 2FA token not provided
        sendResponse(res, 206, STATUS.WARNING, "2FA required", {
          requires2FA: true,
        });
        return;
      }

      let decryptedSecret: string;
      try {
        decryptedSecret = decryptString(foundUser.twoFactorSecret!);
      } catch (decryptError) {
        const { message, stackTrace } = extractErrorDetails(decryptError);
        await logError({
          errorCode: "LOGIN_DECRYPT_ERROR",
          message,
          stackTrace,
          userId: foundUser?.id || null,
          severity: SeverityLevel.ERROR,
        });
        console.error("Error decrypting 2FA secret:", decryptError);
        sendResponse(res, 500, STATUS.ERROR, "Internal Server Error.");
        return;
      }

      // Normalize the input token: remove spaces and convert to uppercase
      const strippedToken = token.replace(/\s+/g, "").toUpperCase();

      // **Validate the length of the backup code or TOTP token**

      if (
        strippedToken.length !== EXPECTED_TOTP_LENGTH &&
        strippedToken.length !== EXPECTED_BACKUP_CODE_LENGTH
      ) {
        sendResponse(
          res,
          400,
          STATUS.ERROR,
          `Token must be exactly ${EXPECTED_TOTP_LENGTH} characters (TOTP) or ${EXPECTED_BACKUP_CODE_LENGTH} characters (Backup Code).`
        );
        return;
      }

      // First, try verifying the TOTP token
      if (strippedToken.length === EXPECTED_TOTP_LENGTH) {
        const verifiedTOTP = speakeasy.totp.verify({
          secret: decryptedSecret,
          encoding: "base32",
          token: strippedToken,
          window: 1, // Allows a 30-second window before and after
        });

        if (!verifiedTOTP) {
          sendResponse(res, 401, STATUS.ERROR, "Invalid 2FA token.");
          return;
        }
      } else if (strippedToken.length === EXPECTED_BACKUP_CODE_LENGTH) {
        // If TOTP verification fails or if it's a backup code
        const backupCodes = await prisma.backupCode.findMany({
          where: {
            userId: foundUser.id,
            used: false,
          },
        });

        let backupCodeValid = false;
        let matchedBackupCodeId: string | null = null;

        for (const backupCode of backupCodes) {
          const isValid = await verifyBackupCode(
            strippedToken,
            backupCode.codeHash
          );
          if (isValid) {
            backupCodeValid = true;
            matchedBackupCodeId = backupCode.id;
            break;
          }
        }

        if (!backupCodeValid) {
          sendResponse(
            res,
            401,
            STATUS.ERROR,
            "Invalid or already used backup code."
          );
          return;
        }

        // Mark the backup code as used
        if (matchedBackupCodeId) {
          await prisma.backupCode.update({
            where: { id: matchedBackupCodeId },
            data: { used: true, usedAt: new Date() },
          });
        }
      }
    }

    const { accessToken, refreshToken } = generateTokens(foundUser);

    const userExist = await prisma.refreshToken.deleteMany({
      where: { userId: foundUser.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: foundUser.id,
        role: foundUser.role,
        expiresAt: new Date(Date.now() + parseDuration(REFRESH_TOKEN_EXPIRES)),
      },
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: parseDuration(REFRESH_TOKEN_EXPIRES),
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Login successful", {
      accessToken,
      isEmailVerified: foundUser.isEmailVerified,
      role: foundUser.role,
      userId: foundUser.id,
      csrfToken: req.csrfToken(),
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "LOGIN_DECRYPT_ERROR",
      message,
      stackTrace,
      userId: userName || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Login error:", error);
    sendResponse(res, 500, STATUS.ERROR, "An error occurred during login");
    return;
  }
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
// ToDo:
// Keep track of refresh token usage to detect unuaual patterns
// Monitor for patterns that might indicate brute-force attacks.
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized");
    return;
  }

  const refreshToken = cookies.jwt;

  // Find the refresh token in the database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload;
    if (!decoded.UserInfo || !decoded.UserInfo.userName) {
      sendResponse(res, 403, STATUS.ERROR, "Forbidden");
      return;
    }

    const foundUser = await prisma.user.findUnique({
      where: { email: decoded.UserInfo.userName },
    });

    if (!foundUser) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized");
      return;
    }

    // Generate a new refresh token
    let newRefreshToken: string;
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
      newRefreshToken = jwt.sign(
        {
          UserInfo: {
            userName: foundUser.email,
            role: foundUser.role,
            userId: foundUser.id,
          },
        },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES }
      );

      try {
        // Use a transaction to delete the old refresh token and create a new one atomically
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          // Delete the old refresh token
          await tx.refreshToken.deleteMany({
            where: { token: refreshToken },
          });

          // Create the new refresh token in the database
          await tx.refreshToken.create({
            data: {
              token: newRefreshToken!,
              userId: foundUser.id,
              role: foundUser.role,
              expiresAt: new Date(
                Date.now() + parseDuration(REFRESH_TOKEN_EXPIRES)
              ),
            },
          });
        });

        break; // Break out of the retry loop if creation was successful
      } catch (error) {
        const { message, stackTrace } = extractErrorDetails(error);
        await logError({
          errorCode: "DECODED_REFRESH_TOKEN",
          message,
          stackTrace,
          userId: decoded?.userId || null,
          severity: SeverityLevel.ERROR,
        });
        if ((error as Prisma.PrismaClientKnownRequestError).code !== "P2002") {
          throw error; // If the error is not unique constraint, rethrow it
        }
        if (i === maxRetries - 1) {
          throw new Error(
            "Unable to create a unique refresh token after several attempts"
          );
        }
      }
    }

    // Generate a new access token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          userName: foundUser.email,
          role: foundUser.role,
          userId: foundUser.id,
        },
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    // Set the new refresh token as an HTTP-only cookie
    res.cookie("jwt", newRefreshToken!, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: parseDuration(REFRESH_TOKEN_EXPIRES),
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Token refreshed successfully.", {
      accessToken,
      isEmailVerified: foundUser.isEmailVerified,
      role: foundUser.role,
      userId: foundUser.id,
      csrfToken: req.csrfToken(),
    });
    return;
  } catch (error) {
    // Delete refresh token in case of a real error
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    res.status(403).json({ message: "Forbidden" });
    return;
  }
};

// @desc Logout
// @route POST /api/auth/logout
// @access Public
export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    sendResponse(res, 400, STATUS.ERROR, "No content");
    return;
  }

  const refreshToken = cookies.jwt;

  try {
    // Delete the refresh token from the database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    // Clear the refresh token cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: NODE_ENV === "production",
    });

    // await prisma.auditLog.create({
    //   data: {
    //     action: AuditAction.LOGOUT,
    //     userId: userId,
    //     entity: "User",
    //     entityId: userId || "",
    //     details: `Successful login for`,
    //     ipAddress: req.ip,
    //   },
    // });
    console.log("user ", userId, " - has logged out.......");
    sendResponse(res, 200, STATUS.SUCCESS, "Successfully logged out.");
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "LOGOUT",
      message,
      stackTrace,
      userId: userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Logout error:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  // Sanitize the entire request body
  const sanitizedBody = sanitizeAll(req.body);

  const { email, password, generalInfo, role } = sanitizedBody;

  if (!email || !password || !generalInfo || !role) {
    sendResponse(
      res,
      400,
      STATUS.ERROR,
      "All required fields must be provided"
    );
    return;
  }

  const {
    firstName,
    lastName,
    address1,
    city,
    region,
    zipCode,
    country,
    fullNumber,
    title,
    address2,
    dob,
    gender,
  } = generalInfo;

  if (
    !firstName ||
    !lastName ||
    !title ||
    !address1 ||
    !city ||
    !region ||
    !zipCode ||
    !country ||
    !fullNumber
  ) {
    sendResponse(
      res,
      400,
      STATUS.ERROR,
      "All general info fields must be provided"
    );
    return;
  }

  // Role check
  if (role === UserRole.ADMIN) {
    // If you only allow one admin or no direct admin registration:
    await prisma.auditLog.create({
      data: {
        action: AuditAction.LOGIN,
        userId: "RogueAdminId",
        entity: "User",
        details: `Someone tried to register as an admin`,
        ipAddress: req.ip,
      },
    });
    sendResponse(res, 409, STATUS.ERROR, "An admin already exists.");
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendResponse(res, 409, STATUS.ERROR, "User registered");
      return;
    }

    // Validate phone number
    const phoneNumber = parsePhoneNumberFromString(fullNumber);
    if (!phoneNumber || !phoneNumber.isValid()) {
      sendResponse(res, 400, STATUS.ERROR, "Invalid phone number format.");
      return;
    }

    const existingPhoneNumber = await prisma.phoneNumber.findUnique({
      where: { fullNumber },
    });
    if (existingPhoneNumber) {
      sendResponse(res, 409, STATUS.ERROR, "Phone number already in use.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Run all DB operations in a single transaction
    let newUserId: string;
    await prisma.$transaction(async (tx) => {
      // Create User
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          title,
          role,
        },
      });
      newUserId = newUser.id;

      // Create Address
      await tx.address.create({
        data: {
          address1,
          address2: address2 || null,
          city,
          region,
          zipCode,
          countryId: country, // Ensure 'country' is the ID, not the name
          userId: newUserId,
        },
      });

      // Create Phone Number
      await tx.phoneNumber.create({
        data: {
          userId: newUserId,
          fullNumber,
          type: PhoneType.MOBILE,
          isPrimary: true,
          isVerified: false,
        },
      });

      // Create Employer or Employee profile based on role
      if (role === UserRole.EMPLOYEE) {
        if (!dob || !gender) {
          throw new Error("DOB and gender are required for Employee.");
        }
        await tx.employee.create({
          data: {
            userId: newUserId,
            dob: new Date(dob),
            gender,
          },
        });
      }

      // Audit log for registration
      await tx.auditLog.create({
        data: {
          action: AuditAction.LOGIN,
          userId: newUserId,
          entity: "User",
          details: `User registered`,
          ipAddress: req.ip,
        },
      });

      // If admin exists, notify admin
      const adminUser = await tx.user.findFirst({
        where: { role: UserRole.ADMIN },
      });
      if (adminUser) {
        await tx.notification.create({
          data: {
            userId: adminUser.id,
            title: `A new registration :: ${newUserId}`,
            message: `${role} - ${title} ${firstName} ${lastName}
            Mob: ${fullNumber} - City: ${city}  ${new Date()}`,
            type: NotificationType.REGISTRATION,
            category: NotificationCategory.USER_ACTION,
          },
        });
      }
    });

    // After transaction succeeds, generate tokens
    const user = await prisma.user.findUnique({ where: { id: newUserId! } });
    if (!user) {
      sendResponse(res, 500, STATUS.ERROR, "User not found after creation");
      return;
    }
    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: parseDuration(REFRESH_TOKEN_EXPIRES),
    });

    // -------------------- Send verification email outside the transaction
    try {
      // const token = generateVerificationToken(user.id);
      // const verificationLink = `${API_BASE_URL}/api/public-services/verify-email?token=${encodeURIComponent(
      //   token
      // )}`;
      // await sendEmailByTemplateLogic({
      //   from: process.env.NO_REPLY_EMAIL_USER!,
      //   recipientEmail: email,
      //   templateName: "verification_email",
      //   placeholders: {
      //     name: firstName,
      //     verificationLink,
      //     "Your Company": process.env.PROJECT_NAME || "Ginger Nanny",
      //   },
      // });
      await sendVerificationEmail({
        userId: user.id,
        email,
        firstName,
      });

      // Audit log for email verification sent
      await prisma.auditLog.create({
        data: {
          action: AuditAction.LOGIN,
          userId: user.id,
          entity: "User",
          details: `Sent an email verification link`,
          ipAddress: req.ip,
        },
      });
    } catch (error) {
      const { message, stackTrace } = extractErrorDetails(error);
      await logError({
        errorCode: "REGISTER_SEND_EMAIL",
        message,
        stackTrace,
        userId: user.id || null,
        severity: SeverityLevel.ERROR,
      });
      console.log("Error sending verification email:", error);
      // The user is created already, just return a message about email failure
      sendResponse(
        res,
        500,
        STATUS.ERROR,
        "User registered but failed to send verification email. Please contact support."
      );
      return;
    }

    sendResponse(res, 200, STATUS.SUCCESS, "Registration successful", {
      accessToken,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      userId: user.id,
      csrfToken: req.csrfToken(),
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "REGISTER",
      message,
      stackTrace,
      userId: email || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error during registration:", error);
    sendResponse(
      res,
      500,
      STATUS.ERROR,
      "An error occurred during registration"
    );
    return;
  }
};

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  console.log("forgot password => ", email);

  // 1) Always respond with a generic success message
  const genericResponse = () =>
    sendResponse(
      res,
      200,
      STATUS.SUCCESS,
      "If your account exists, you will receive an email shortly."
    );

  try {
    if (!email) {
      genericResponse();
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    // Return same generic response if no user
    if (!user) {
      genericResponse();
      return;
    }

    // ---------- NEW RATE LIMIT LOGIC ----------
    // If user has reached the limit (2 requests in last 24 hours)
    // ToDo: store in db
    const maxRequestsAllowed = 3;
    const timeframeHours = 24;
    if (
      await hasRecentlyRequestedReset(
        user.id,
        maxRequestsAllowed,
        timeframeHours
      )
    ) {
      // Return a 429 or a generic 200.
      // It's often recommended to return an error code in your logs,
      // but you can decide how to message the user for security reasons.
      sendResponse(
        res,
        429,
        STATUS.ERROR,
        "You have reached the limit for password resets. Please wait before trying again."
      );
      return;
    }

    // 2) Generate a token
    const token = generateJWTToken(user.id);

    // 3) Upsert into passwordReset
    const expiresAt = new Date(Date.now() + 15 * 60_000); // 15 min
    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      create: { userId: user.id, token, expiresAt },
      update: {
        token,
        expiresAt,
        createdAt: new Date(),
      },
    });

    // 4) Log the request
    // Insert a row in `PasswordResetRequest` to keep track of usage
    await prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        ipAddress: req.ip, // optionally store IP
        token: token, // optionally store token reference
      },
    });

    // 5) Send email with link
    const resetLink = `${
      process.env.FRONTEND_BASE_URL
    }/auth/reset-password?token=${encodeURIComponent(token)}`;
    await sendEmailByTemplateLogic({
      from: process.env.NO_REPLY_EMAIL_USER!,
      recipientEmail: email,
      templateName: "password_reset",
      placeholders: {
        name: user.firstName ?? "",
        verificationLink: resetLink,
        "Your Company": process.env.PROJECT_NAME || "Project",
      },
    });

    // 6) Return generic response
    genericResponse();
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "FORGOT_PASSWORD",
      message,
      stackTrace,
      userId: email || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error in forgotPassword:", error);
    // Return generic message, no matter what
    genericResponse();
    return;
  }
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    // 1) Verify token
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, ACCESS_TOKEN_EXPIRES) as { userId: string };
    } catch (error) {
      const { message, stackTrace } = extractErrorDetails(error);
      await logError({
        errorCode: "RESET_PASSWORD_DECODE",
        message,
        stackTrace,
        userId: null,
        severity: SeverityLevel.ERROR,
      });
      // Token is invalid or expired
      sendResponse(res, 400, STATUS.ERROR, "Invalid or expired token.");
      return;
    }

    // 2) Look up the user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      sendResponse(res, 404, STATUS.ERROR, "User not found.");
      return;
    }

    // (Optional) If you’re storing reset token in DB, check DB. Example:
    const foundReset = await prisma.passwordReset.findUnique({
      where: { userId: user.id },
    });
    if (
      !foundReset ||
      foundReset.token !== token ||
      foundReset.expiresAt < new Date()
    ) {
      sendResponse(res, 400, STATUS.ERROR, "Invalid or expired token.");
      return;
    }

    // 3) Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4) Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // (Optional) Remove the passwordReset row or clear user’s reset token:
    await prisma.passwordReset.delete({ where: { userId: user.id } });

    // 5) Respond success
    sendResponse(res, 200, STATUS.SUCCESS, "Password reset successfully.");
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "RESET_PASSWORD",
      message,
      stackTrace,
      userId: null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error in resetPassword:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};
