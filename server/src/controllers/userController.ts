import { Response } from "express";
import bcrypt from "bcrypt";
import qrCode from "qrcode";
import speakeasy from "speakeasy";

import sharp from "sharp";
import { AuthRequest, sendResponse, STATUS } from "../interfaces";

// const prisma = new PrismaClient();
import {
  NotificationCategory,
  NotificationStatus,
  NotificationType,
  SeverityLevel,
  UserRole,
} from "@prisma/client";
import {
  formatBackupCodeForDisplay,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} from "../utils/backupCodes";
import { decryptString, encryptString } from "../utils/encryption";
import prisma from "../utils/prisma";

import { resendVerificationToken } from "../service/email/verification/resendVerificationToken";
import { NODE_ENV } from "../utils/config";
import { extractErrorDetails, logError } from "../utils/errorLogService";
import {
  deleteFile,
  getExtensionFromMimetype,
  getObjectSignedUrl,
  uploadAvatar,
} from "../utils/s3";
import { sanitizeInput } from "../utils/sanitizeInput";

// Define a type for the response data
type ProfileData = {
  admin?: any; // Replace 'any' with actual Admin type
  moderator?: any;
  employee?: any; // Replace 'any' with actual Employee type
  employer?: any; // Replace 'any' with actual Employer type
};

export const fetchUserProfile = async (
  userId: string,
  role: UserRole
): Promise<ProfileData | null> => {
  let profile: ProfileData | null = null;

  const addAvatarUrl = async (user: any) => {
    if (user?.avatarName) {
      const avatarUrl = await getObjectSignedUrl({
        key: user.avatarName,
        expiresIn: 3600,
      });
      return { ...user, avatarUrl };
    }
    return user;
  };

  switch (role) {
    case UserRole.ADMIN:
      profile = {
        admin: await prisma.admin
          .findUnique({
            where: { userId },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  title: true,
                  avatarName: true,
                  notes: true,
                  isEmailVerified: true,
                  addresses: true,
                  twoFactorEnabled: true,
                  backupCodesEnabled: true,
                },
              },
            },
          })
          .then(async (admin) => {
            if (admin?.user) {
              admin.user = await addAvatarUrl(admin.user);
            }
            return admin;
          }),
      };
      break;

    case UserRole.MODERATOR:
      profile = {
        moderator: await prisma.moderator
          .findUnique({
            where: { userId },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  title: true,
                  avatarName: true,
                  notes: true,
                  isEmailVerified: true,
                  addresses: true,
                  twoFactorEnabled: true,
                  backupCodesEnabled: true,
                },
              },
            },
          })
          .then(async (moderator) => {
            if (moderator?.user) {
              moderator.user = await addAvatarUrl(moderator.user);
            }
            return moderator;
          }),
      };
      break;

    case UserRole.EMPLOYEE:
      profile = {
        employee: await prisma.employee
          .findFirst({
            where: {
              userId,
              user: {
                isDeleted: false,
              },
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  title: true,
                  avatarName: true,
                  notes: true,
                  isEmailVerified: true,
                  addresses: true,
                  twoFactorEnabled: true,
                  backupCodesEnabled: true,
                },
              },
            },
          })
          .then(async (employee) => {
            if (employee?.user) {
              employee.user = await addAvatarUrl(employee.user);
            }
            return employee;
          }),
      };
      break;

    default:
      profile = null;
  }

  return profile;
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (!userId) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }
  if (!role) {
    sendResponse(
      res,
      401,
      STATUS.ERROR,
      "Unauthorized access. Role is missing."
    );
    return;
  }

  try {
    const profile = await fetchUserProfile(userId, role);

    if (!profile) {
      sendResponse(res, 404, STATUS.ERROR, "Profile not found");
      return;
    }

    // Determine which profile to send based on role
    if (profile.admin) {
      sendResponse(res, 200, STATUS.SUCCESS, "Fetched user profile", {
        admin: profile.admin,
      });
      return;
    }
    if (profile.moderator) {
      sendResponse(res, 200, STATUS.SUCCESS, "Fetched user profile", {
        moderator: profile.moderator,
      });
      return;
    } else if (profile.employee) {
      sendResponse(res, 200, STATUS.SUCCESS, "Fetched user profile", {
        employee: profile.employee,
      });
      return;
    } else if (profile.employer) {
      sendResponse(res, 200, STATUS.SUCCESS, "Fetched user profile", {
        employer: profile.employer,
      });
      return;
    } else {
      sendResponse(res, 404, STATUS.ERROR, "Profile not found");
      return;
    }
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_USER_PROFILE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error fetching user profile:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  const { firstName, lastName, notes, addresses } = req.body;

  if (!userId || !role) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }

  const allowedRoles: UserRole[] = [
    UserRole.ADMIN,
    UserRole.MODERATOR,
    UserRole.EMPLOYEE,
  ];
  if (!allowedRoles.includes(role)) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    if (!existingUser || existingUser.isDeleted) {
      sendResponse(res, 404, STATUS.ERROR, "User not found or deleted.");
      return;
    }

    // Role-specific check
    if (role === UserRole.EMPLOYEE && addresses.length > 1) {
      sendResponse(
        res,
        400,
        STATUS.ERROR,
        "EMPLOYEE can have only one address."
      );
      return;
    }

    // Process addresses
    // We'll separate addresses into existing (with id) and new (without id)
    const existingAddresses = existingUser.addresses;
    const updateAddresses: any[] = [];
    const createAddresses: any[] = [];

    for (const addr of addresses) {
      if (addr.id) {
        // Check if this address belongs to the user
        const found = existingAddresses.find((a) => a.id === addr.id);
        if (found) {
          // Update existing address
          updateAddresses.push({
            where: { id: addr.id },
            data: {
              address1: addr.address1,
              address2: addr.address2,
              city: addr.city,
              region: addr.region,
              zipCode: addr.zipCode,
              countryId: addr.countryId,
            },
          });
        } else {
          // Address ID does not belong to user or doesn't exist, skip or handle error
          // Here we skip. If you want error, return error here.
          console.warn(`Skipping address ${addr.id}, not found for user.`);
        }
      } else {
        // No id means new address
        createAddresses.push({
          address1: addr.address1,
          address2: addr.address2,
          city: addr.city,
          region: addr.region,
          zipCode: addr.zipCode,
          countryId: addr.countryId,
          userId: userId,
        });
      }
    }

    // Prepare update data
    const addressOperations: any = {};
    if (createAddresses.length > 0) {
      addressOperations.create = createAddresses;
    }

    // We must handle updates differently: we cannot do all updates in one go via nested write if they differ by id
    // Prisma does not allow multiple update operations in a single nested write. We must run them separately or use a transaction.
    await prisma.$transaction(async (tx) => {
      // Update user first
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          notes,
          // create new addresses if any
          addresses: addressOperations,
        },
      });

      // Update existing addresses one by one
      for (const upd of updateAddresses) {
        await tx.address.update(upd);
      }
    });

    const profile = await fetchUserProfile(userId, role);

    sendResponse(res, 200, STATUS.SUCCESS, "Successfully updated profile", {
      userProfile: profile,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "UPDATE_PROFILE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error updating profile:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};

// Both Employer and Employee have the same notifications. May be different notifications required
export const getNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  try {
    // Fetch the employer associated with the userId

    if (!userId) {
      sendResponse(res, 404, STATUS.ERROR, "User not found.");
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        status: true,
        createdAt: true,
        readAt: true,
        read: true,
        link: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Process data to fit the chart format

    // console.log("Notifications: ", JSON.stringify(notifications, null, 2));
    if (!notifications) {
      sendResponse(res, 400, STATUS.ERROR, "Failed to fetch notifications.");
      return;
    }

    sendResponse(
      res,
      200,
      STATUS.SUCCESS,
      "Sucessfully fetched notifications.",
      { notifications }
    );
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_NOTIFICATIONS",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { notificationId } = req.params;
  const { notificationStatus } = req.body;

  if (!userId) {
    sendResponse(res, 404, STATUS.ERROR, "User not found.");
    return;
  }

  try {
    // Check if the notification exists and belongs to the user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      sendResponse(res, 404, STATUS.ERROR, "Notification not found.");
      return;
    }

    // Update the notification's status
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: notificationStatus,
        readAt:
          notificationStatus === NotificationStatus.READ ? new Date() : null,
      },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Notification status updated.", {
      notification: updatedNotification,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "UPDATE_STATUS",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error updating notification status:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};

/*
  PREFERENCES
*/
export const getUserPreferences = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  try {
    // Validate user existence
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isDeleted) {
      sendResponse(res, 404, STATUS.ERROR, "User not found.");
      return;
    }

    // Fetch reviews received by the user
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Sucessfully fetched preferences.", {
      preferences,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_USER_PREFERENCES",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    sendResponse(res, 400, STATUS.ERROR, "Failed to fetch preferences.");
    return;
  }
};
export const updateUserPreferences = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user?.userId;
  const preferences = req.body;

  try {
    // Validate user existence
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isDeleted) {
      sendResponse(res, 404, STATUS.ERROR, "User not found.");
      return;
    }

    // Fetch reviews received by the user
    const updatedPreferences = await prisma.userPreference.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences,
      },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Sucessfully updated preferences.", {
      updatedPreferences,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "UPDATE_USER_PREFERENCES",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    sendResponse(res, 400, STATUS.ERROR, "Failed to update preferences.");
    return;
  }
};
export const updateUserPassword = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { newPassword } = req.body;

  try {
    // Validate user existence

    if (!newPassword || newPassword.trim().length < 6) {
      sendResponse(
        res,
        400,
        "error",
        "Password must be at least 6 characters long."
      );
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isDeleted) {
      sendResponse(res, 404, STATUS.ERROR, "User not found.");
      return;
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(sanitizeInput(newPassword), 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Sucessfully updated preferences.", {
      updatePassword: true,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "UPDATE_USER_PASSWORD",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    sendResponse(res, 400, STATUS.ERROR, "Failed to update password.");
    return;
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const { firstName, lastName, title, notes } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isDeleted) {
      sendResponse(res, 404, STATUS.ERROR, "User not found.");
      return;
    }

    // Sanitize inputs using the utility functions
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedNotes = notes ? sanitizeInput(notes) : null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        title: sanitizedTitle,
        notes: sanitizedNotes,
      },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Successfully updated user info.", {
      user: updatedUser,
    });
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "UPDATE_USER_INFO",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    sendResponse(res, 500, STATUS.ERROR, "Failed to update user.");
  }
};

// ==================== AVATAR ====================
export const uploadAvatarController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const file = req.file;

    if (!userId || !role) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
      return;
    }

    if (!file || !file.buffer) {
      sendResponse(res, 400, STATUS.ERROR, "No file uploaded.");
      return;
    }

    const isImage = file.mimetype.startsWith("image/");
    let processedBuffer = file.buffer;
    let extension = getExtensionFromMimetype(file.mimetype);

    if (isImage) {
      processedBuffer = await sharp(file.buffer)
        .resize(200, 200) // Small avatar size
        .jpeg({ quality: 80 })
        .toBuffer();
      extension = "jpg";
    }

    // Upload to S3 using the utility
    const s3Key = await uploadAvatar({
      fileBuffer: processedBuffer,
      mimetype: isImage ? "image/jpeg" : file.mimetype,
      userId,
    });

    // If there's a previous avatar, delete it
    const previousAvatar = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarName: true },
    });

    if (previousAvatar?.avatarName && previousAvatar.avatarName !== s3Key) {
      await deleteFile({ fileName: previousAvatar.avatarName });
    }

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        avatarName: s3Key,
      },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Avatar uploaded successfully.", {
      fileName: s3Key,
    });
    return;
  } catch (error: any) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "UPLOAD_AVATAR",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error uploading avatar:", error);
    sendResponse(res, 500, STATUS.ERROR, "Failed to upload avatar.");
    return;
  }
};
export const getAvatarController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarName: true },
    });

    if (!user?.avatarName) {
      sendResponse(res, 200, STATUS.SUCCESS, "Avatar not found.", {
        url: null,
      });
      return;
    }

    const url = await getObjectSignedUrl({
      key: user.avatarName,
      expiresIn: 3600,
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Avatar retrieved successfully.", {
      url,
    });
    return;
  } catch (error: any) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_AVATAR",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error retrieving avatar:", error);
    sendResponse(res, 500, STATUS.ERROR, "Failed to get avatar.");
    return;
  }
};
export const deleteAvatarController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarName: true },
    });

    if (!user?.avatarName) {
      sendResponse(res, 404, STATUS.ERROR, "No avatar to delete.");
      return;
    }

    await deleteFile({ fileName: user.avatarName });
    await prisma.user.update({
      where: { id: userId },
      data: {
        avatarName: null,
      },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Avatar deleted successfully.");
    return;
  } catch (error: any) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "DELETE_AVATAR",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error deleting avatar:", error);
    sendResponse(res, 500, STATUS.ERROR, "Failed to delete avatar.");
    return;
  }
};

/*
  SETUP 2 FA
  ------------- 2FA ---------------
*/
export const setup2FA = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }

  try {
    const secret = speakeasy.generateSecret();
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      sendResponse(res, 404, STATUS.ERROR, "User not found.");
      return;
    }
    const secretToken = secret.base32;
    const encryptedSecret = encryptString(secretToken);

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: encryptedSecret }, // Correctly store encryptedSecret
    });

    // Generate customized URL for QR code
    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `${user.firstName} ${user.lastName}`,
      issuer: process.env.FRONTEND_BASE_URL || "www.project.com",
      encoding: "base32",
    });
    const qrImageUrl = await qrCode.toDataURL(url);

    // Optionally, avoid sending the plain secret back to the client
    sendResponse(res, 200, STATUS.SUCCESS, "Generated QR Code successfully.", {
      // secret: secret.base32, // Remove if not necessary
      qrCode: qrImageUrl,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "SETUP_2F",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error setting up 2FA:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal Server Error.");
  }
};
export const verify2FA = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { token } = req.body;

  if (!userId) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }
  if (!token) {
    sendResponse(res, 400, STATUS.ERROR, "Token is required.");
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user || !user.twoFactorSecret) {
      sendResponse(res, 404, STATUS.ERROR, "2FA not initiated.");
      return;
    }

    // Decrypt the twoFactorSecret
    const decryptedSecret = decryptString(user.twoFactorSecret);

    // Verify the TOTP token using the decrypted secret
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret, // Use decryptedSecret
      encoding: "base32",
      token,
      window: 1, // Allows a 30-second window before and after
    });

    if (verified) {
      // Enable 2FA for the user
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });

      sendResponse(res, 200, STATUS.SUCCESS, "2FA enabled successfully.");
    } else {
      sendResponse(res, 400, STATUS.ERROR, "Invalid token. Please try again.");
    }
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "VERIFY_2FA",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error verifying 2FA:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal Server Error.");
  }
};
export const reset2FA = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    console.log("reset 2fa: ", user);
    if (!user || !user.twoFactorSecret) {
      sendResponse(res, 404, STATUS.ERROR, "2FA not initiated.");
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: "" },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "2FA reset successful.");
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "RESET_2FA",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error deleting document:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal Server Error.");
  }
};

// ------------- BACKUP CODES -----------------
export const generateBackupCodesHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
      return;
    }

    // Generate plain backup codes (e.g., 5 unique codes)
    const backupCodes = generateBackupCodes(5);

    // Hash backup codes
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => hashBackupCode(code))
    );

    // Start a transaction to revoke existing codes and create new ones atomically
    await prisma.$transaction(async (prisma) => {
      // Delete existing backup codes for the user
      await prisma.backupCode.deleteMany({
        where: { userId },
      });

      // Create new backup codes
      const backupCodeRecords = hashedBackupCodes.map((hash) => ({
        codeHash: hash,
        userId,
      }));

      await prisma.backupCode.createMany({
        data: backupCodeRecords,
      });

      // Enable 2FA if not already enabled
      await prisma.user.update({
        where: { id: userId },
        data: { backupCodesEnabled: true },
      });
    });

    // Format backup codes for display (e.g., add spaces every 4 characters)
    const formattedBackupCodes = backupCodes.map(formatBackupCodeForDisplay);

    // Return the formatted plain backup codes to the user (to be shown only once)
    sendResponse(
      res,
      200,
      STATUS.SUCCESS,
      "Backup codes generated successfully. Please store them securely.",
      { backupCodes: formattedBackupCodes }
    );
  } catch (error: any) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GENERATE_BACKUP_CODES",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error generating backup codes:", error);

    sendResponse(res, 500, STATUS.ERROR, "Failed to generate backup codes.");
  }
};

export const verifyBackupCodeHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { code } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
      return;
    }

    if (!code) {
      sendResponse(res, 400, STATUS.ERROR, "Backup code is required.");
      return;
    }

    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!foundUser) {
      sendResponse(res, 404, STATUS.ERROR, "User not found.");
      return;
    }

    // Find the backup code associated with the user that is not used
    const backupCodeRecord = await prisma.backupCode.findFirst({
      where: {
        userId,
        used: false,
      },
    });

    if (!backupCodeRecord) {
      sendResponse(
        res,
        400,
        STATUS.ERROR,
        "No available backup codes. Please generate new backup codes."
      );
      return;
    }

    // Verify the provided code against the stored hash
    const isValid = await verifyBackupCode(code, backupCodeRecord.codeHash);

    if (!isValid) {
      sendResponse(res, 400, STATUS.ERROR, "Invalid backup code.");
      return;
    }

    // Mark the backup code as used
    const backupCodes = await prisma.backupCode.update({
      where: { id: backupCodeRecord.id },
      data: { used: true, usedAt: new Date() }, // Assuming you have a 'usedAt' field
    });

    // Issue JWT tokens
    //const { accessToken, refreshToken } = generateTokens(foundUser); // Adjust payload as needed

    // Optionally, set tokens in HTTP-only cookies
    // res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    // res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    // Return the access token to the client
    sendResponse(
      res,
      200,
      STATUS.SUCCESS,
      "Backup code verified successfully.",
      { backupCodes }
    );
  } catch (error: any) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "VERIFY_BACKUP_CODE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error verifying backup code:", error);
    sendResponse(res, 500, STATUS.ERROR, "Failed to verify backup code.");
  }
};

export const revokeBackupCodesHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
      return;
    }

    // Generate new backup codes (e.g., 5 unique codes)
    const newBackupCodes = generateBackupCodes(5);

    // Hash new backup codes
    const hashedNewBackupCodes = await Promise.all(
      newBackupCodes.map((code) => hashBackupCode(code))
    );

    // Start a transaction to revoke existing codes and create new ones atomically
    await prisma.$transaction(async (prisma) => {
      // Delete all existing backup codes for the user
      await prisma.backupCode.deleteMany({
        where: { userId },
      });

      // Create new backup codes
      const backupCodeRecords = hashedNewBackupCodes.map((hash) => ({
        codeHash: hash,
        userId,
      }));

      await prisma.backupCode.createMany({
        data: backupCodeRecords,
      });
    });

    // Format new backup codes for display
    const formattedNewBackupCodes = newBackupCodes.map(
      formatBackupCodeForDisplay
    );

    // Return the new formatted backup codes to the user (to be shown only once)
    sendResponse(
      res,
      200,
      STATUS.SUCCESS,
      "Backup codes revoked and new codes generated successfully. Please store them securely.",
      { backupCodes: formattedNewBackupCodes }
    );
  } catch (error: any) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "REVOKE_BACKUP_CODES",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error revoking backup codes:", error);

    sendResponse(res, 500, STATUS.ERROR, "Failed to revoke backup codes.");
    return;
  }
};

// ----------------- EMAIL VERIFICATION -----------------
export const resendVerification = async (req: AuthRequest, res: Response) => {
  try {
    console.log("resent verification............... ");
    const userId = req.user?.userId;
    console.log("user id: ", userId);
    if (!userId) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
      return;
    }

    try {
      const result = await resendVerificationToken(userId); // Reuse the new reusable function
      console.log("result: ", result);
      sendResponse(res, 200, STATUS.SUCCESS, result.message);
      return;
    } catch (error) {
      const { message, stackTrace } = extractErrorDetails(error);
      await logError({
        errorCode: "RESEND_VERIFICATION_TOKEN",
        message,
        stackTrace,
        userId: req.user?.userId || null,
        severity: SeverityLevel.ERROR,
      });
      // Narrow down the type of `error` and check for `message` property
      if (error instanceof Error) {
        if (error.message === "User not found.") {
          sendResponse(res, 404, STATUS.ERROR, error.message);
          return;
        }

        if (error.message === "Email is already verified.") {
          sendResponse(res, 400, STATUS.ERROR, error.message);
          return;
        }

        // Log unexpected errors
        sendResponse(
          res,
          500,
          STATUS.ERROR,
          "Failed to resend verification email."
        );
        return;
      }

      // Handle non-standard error types
      console.error("Non-standard error type encountered:", error);
      sendResponse(
        res,
        500,
        STATUS.ERROR,
        "An unexpected error occurred during resending verification email."
      );
      return;
    }
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "RESEND_VERIFICATION",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error in resendVerification function:", error);
    sendResponse(
      res,
      500,
      STATUS.ERROR,
      "An unexpected error occurred during resending verification email."
    );
    return;
  }
};

// ----------------- DELETE ACCOUNT -----------------
/*
UPDATE public."User"
SET "isDeleted" = false
WHERE email = 'employee3@example.com' AND "isDeleted" = true;
*/
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;

  const cookies = req.cookies;
  if (!cookies?.jwt) {
    sendResponse(res, 400, STATUS.ERROR, "No content");
    return;
  }
  const refreshToken = cookies.jwt;

  if (!userId || !role) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }

  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.EMPLOYEE];
  if (!allowedRoles.includes(role)) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }

  // Optional: if you want user to provide a reason, read it from req.body
  // const { deleteReason } = req.body || {};

  try {
    // Step 1: Fetch the user details to check the role
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true,
        role: true,
        isDeleted: true,
      },
    });

    // Step 2: Check if the user exists and is not already deleted
    if (!userToDelete) {
      sendResponse(res, 404, STATUS.ERROR, "User not found.");
      return;
    }

    if (userToDelete.isDeleted) {
      sendResponse(
        res,
        409,
        STATUS.ERROR,
        "This user has already been deleted."
      );
      return;
    }

    // Step 3: Ensure the user is not an ADMIN
    if (userToDelete.role === UserRole.ADMIN) {
      sendResponse(res, 403, STATUS.ERROR, "Cannot delete an ADMIN user.");
      return;
    }
    if (userToDelete.role === UserRole.MODERATOR) {
      sendResponse(res, 403, STATUS.ERROR, "Cannot delete a MODERATOR user.");
      return;
    }

    // Step 4: Perform the deletion
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        // Add `deleteReason` if required
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true,
        role: true,
      },
    });

    const adminUser = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    await prisma.notification.create({
      data: {
        userId: adminUser!.id, // Admin user's ID
        title: `User Account Deleted: ${updatedUser.id}`,
        message: `${updatedUser.role} - ${updatedUser.title} ${updatedUser.firstName} ${updatedUser.lastName} has deleted their account.`,
        type: NotificationType.DELETE_ACCOUNT,
        category: NotificationCategory.USER_ACTION,
      },
    });

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

    console.log("user deleted: ", JSON.stringify(updatedUser, null, 2));
    sendResponse(res, 200, STATUS.SUCCESS, "Account deleted successfully.");
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "DELETE_ACCOUNT",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error deleting account:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};
