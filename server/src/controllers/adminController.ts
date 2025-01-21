import QRCode from "qrcode";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { AuthRequest, sendResponse, STATUS } from "../interfaces";

import {
  NotificationCategory,
  NotificationType,
  SeverityLevel,
  UserRole,
} from "@prisma/client";
import prisma from "../utils/prisma";

import { extractErrorDetails, logError } from "../utils/errorLogService";

export const getAdminProfile = async (
  req: AuthRequest, // AuthRequest contains user info from JWT
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId; // Extract userId from the authenticated request
    const role = req.user?.role;

    if (!userId) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
      return;
    }
    if (role !== UserRole.ADMIN) {
      sendResponse(res, 403, STATUS.ERROR, "Forbidden");
      return;
    }
    // Fetch the employee associated with the authenticated user and ensure the user is not deleted
    const adminProfile = await prisma.admin.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isEmailVerified: true,
            addresses: true, // Include the addresses via the user relation
            twoFactorEnabled: true,
            backupCodesEnabled: true,
          },
        },
      },
    });

    if (!adminProfile) {
      sendResponse(res, 404, STATUS.ERROR, "Admin not found.");
      return;
    }
    // console.log("admin>>>: ", JSON.stringify(adminProfile, null, 2));

    // If employee is found, return the profile
    sendResponse(res, 200, STATUS.SUCCESS, "Admin profile found.", {
      adminProfile,
    });
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_ADMIN_PROFILE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });

    // ToDo: Log Error, ring alarm
    if (error instanceof Error) {
      console.error("Error fetching admin profile:", {
        message: error.message,
        stack: error.stack,
      });
      sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
      return;
    } else {
      console.error("Unknown error occurred");
      sendResponse(res, 500, STATUS.ERROR, "Unknown error occurred.");
      return;
    }
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId; // Extract userId from the authenticated request
  const role = req.user?.role;
  const employeeId = req.params.id; // Extract employeeId from request parameters

  if (!userId) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }
  if (role !== UserRole.ADMIN) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }
  if (!employeeId) {
    sendResponse(res, 401, STATUS.ERROR, "Employee id is empty.");
    return;
  }

  try {
    // Fetch the employee profile by ID, ensuring the user is not deleted
    const employeeProfile = await prisma.employee.findUnique({
      where: {
        id: employeeId,
        isDeleted: false, // Ensure the employee is not deleted
        user: {
          isDeleted: false, // Ensure the associated user is not deleted
        },
      },
      include: {},
    });

    if (!employeeProfile) {
      sendResponse(
        res,
        404,
        STATUS.ERROR,
        "Employee not found or user is deleted."
      );
      return;
    }

    // Send the employee profile in the response
    sendResponse(
      res,
      200,
      STATUS.SUCCESS,
      "Employee profile retrieved successfully.",
      {
        employeeProfile,
      }
    );
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_EMPLOYEE_BY_ID",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error fetching employee profile:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error");
    return;
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { role } = req.user!;

  if (role !== UserRole.ADMIN || !userId) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }
  console.log("get all users............ ", role, userId);
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false, role: { not: UserRole.ADMIN } },
      select: {
        id: true,
        avatarName: true,
        createdAt: true,
        deletedAt: true,
        email: true,
        firstName: true,
        isDeleted: true,
        isEmailVerified: true,
        lastName: true,
        notes: true,
        role: true,
        title: true,
        twoFactorEnabled: true,
        backupCodesEnabled: true,
        updatedAt: true,
      },
    });
    sendResponse(res, 200, STATUS.SUCCESS, "Users fetched successfully.", {
      users,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_ALL_USERS",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error fetching users:", error);
    sendResponse(res, 500, STATUS.ERROR, "Failed to fetch users.");
    return;
  }
};

export const softDeleteUser = async (req: AuthRequest, res: Response) => {
  const adminId = req.user?.userId; // The admin making the request
  const adminRole = req.user?.role; // The admin's role
  const { id: targetUserId } = req.params; // The ID of the user to delete

  // Ensure the current user is an admin
  if (adminRole !== UserRole.ADMIN || !adminId) {
    console.log("Unauthorized role attempting deletion: ", adminRole);
    sendResponse(
      res,
      403,
      STATUS.ERROR,
      "Forbidden: Only admins can delete users."
    );
    return;
  }

  // Validate that targetUserId is provided
  if (!targetUserId) {
    sendResponse(res, 400, STATUS.ERROR, "Bad Request: User ID is required.");
    return;
  }

  try {
    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    // Check if the user exists
    if (!targetUser) {
      sendResponse(res, 404, STATUS.ERROR, "User not found.");
      return;
    }

    // Prevent deletion of another admin user
    if (targetUser.role === UserRole.ADMIN) {
      sendResponse(res, 403, STATUS.ERROR, "Cannot delete an admin user.");
      return;
    }

    console.log("Performing soft delete for user: ", targetUserId);

    // Perform soft delete
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    console.log("Soft-deleted user: ", updatedUser);

    // Fetch updated list of users excluding admins and deleted users
    const users = await prisma.user.findMany({
      where: { isDeleted: false, role: { not: UserRole.ADMIN } },
      select: {
        id: true,
        avatarName: true,
        createdAt: true,
        deletedAt: true,
        email: true,
        firstName: true,
        isDeleted: true,
        isEmailVerified: true,
        lastName: true,
        notes: true,
        role: true,
        title: true,
        twoFactorEnabled: true,
        backupCodesEnabled: true,
        updatedAt: true,
      },
    });
    console.log("Updated user list: ", users);

    sendResponse(res, 200, STATUS.SUCCESS, "User deleted successfully.", {
      users,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "SOFT_DELETE_USER",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error deleting user:", error);
    sendResponse(
      res,
      500,
      STATUS.ERROR,
      "An error occurred while deleting the user."
    );
    return;
  }
};

// ---------- REGISTERING MODERATOR -----------
export const adminRegisterNewUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const adminRole = req.user?.role;

  // Authorization checks
  if (!userId) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }
  if (adminRole !== UserRole.ADMIN) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }

  const { email, password, firstName, lastName, title, role } = req.body;

  if (!role || !email || !password || !firstName || !lastName) {
    sendResponse(
      res,
      400,
      STATUS.ERROR,
      "All required fields must be provided."
    );
    return;
  }

  try {
    // Check if the email is already in use
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      sendResponse(
        res,
        409,
        STATUS.ERROR,
        "A user with this email already exists."
      );
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        title: title || null, // Optional title handling
        role,
        ...(role === UserRole.MODERATOR && { moderator: { create: {} } }), // Only create moderator entry if role is MODERATOR
      },
    });

    const adminUser = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });
    if (adminUser) {
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          title: `A new user registration :: ${newUser.id}`,
          message: `${role} - ${title} ${firstName} ${lastName}`,
          type: NotificationType.REGISTRATION,
          category: NotificationCategory.USER_ACTION,
        },
      });
    }

    // Respond with success
    sendResponse(
      res,
      201,
      STATUS.SUCCESS,
      "A new user registered successfully.",
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        },
      }
    );
    return;
  } catch (error: any) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "ADMIN_REGISTER_NEW_USER",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error registering new user:", error);

    if (error.code === "P2002") {
      // Handle Prisma unique constraint violation error
      sendResponse(
        res,
        409,
        STATUS.ERROR,
        "A user with this email already exists."
      );
      return;
    } else {
      sendResponse(res, 500, STATUS.ERROR, "Failed to register new user.");
      return;
    }
  }
};

// ==================== ERROR LOGS =====================
export const getErrorLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const adminRole = req.user?.role;

  // Authorization checks
  if (!userId) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.");
    return;
  }
  if (adminRole !== UserRole.ADMIN) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }

  const { severity, startDate, endDate } = req.query;

  try {
    const where: Record<string, any> = {};
    if (severity) where.severity = severity;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Fetch error logs
    const errorLogs = await prisma.errorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    sendResponse(
      res,
      200,
      STATUS.SUCCESS,
      "Successfully fetched the error logs.",
      { errorLogs }
    );
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_ERROR_LOGS",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });

    sendResponse(res, 500, STATUS.ERROR, "Failed to fetch error logs.");
    return;
  }
};

export const createEmailTemplate = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { role } = req.user!;
  if (role !== UserRole.ADMIN || !userId) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }

  const { name, subject, htmlContent, textContent } = req.body;

  try {
    const template = await prisma.emailTemplate.create({
      data: { name, subject, htmlContent, textContent },
    });

    sendResponse(res, 201, STATUS.SUCCESS, "Template created.", { template });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "CREATE_EMAIL_TEMPLATE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error creating template:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};

// ------------ UPDATE EMAIL TEMPLATE ------------
export const updateEmailTemplate = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { role } = req.user!;
  if (role !== UserRole.ADMIN || !userId) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }

  const { id } = req.params;
  const { name, subject, htmlContent, textContent } = req.body;
  try {
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: { name, subject, htmlContent, textContent },
    });
    sendResponse(res, 200, STATUS.SUCCESS, "Template updated.", template);
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "UPDATE_EMAIL_TEMPLATE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error updating template:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};
// ------------ GET EMAIL TEMPLATE ------------
export const getEmailTemplates = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { role } = req.user!;
  if (role !== UserRole.ADMIN || !userId) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }

  try {
    const templates = await prisma.emailTemplate.findMany();

    sendResponse(res, 200, STATUS.SUCCESS, "Templates fetched.", { templates });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_EMAIL_TEMPLATES",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error fetching templates:", error);
    sendResponse(res, 500, STATUS.ERROR, "Internal server error.");
    return;
  }
};

// ----------- QR -----------
// --------------------------
// --------------------------
export const generateQrCode = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId; // The admin making the request
  const role = req.user?.role; // The admin's role

  // Ensure the current user is an admin
  if (role !== UserRole.ADMIN || !userId) {
    console.log("Unauthorized role attempting generating qr code: ");
    sendResponse(
      res,
      403,
      STATUS.ERROR,
      "Forbidden: Only admins can generate qr code."
    );
    return;
  }

  const { name, url } = req.body;

  try {
    const qrCodeImage = await QRCode.toDataURL(url);

    const result = await prisma.qrCode.create({
      data: {
        name,
        url,
        qrCodeImage,
      },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Sucesfully generated qr code", {
      qrcode: result,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GENERATE_QR_CODE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    sendResponse(res, 500, STATUS.ERROR, "Failed to generate qr code");
    return;
  }
};

// Get All QR Codes
export const getAllQrCodes = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId; // The admin making the request
  const role = req.user?.role; // The admin's role

  // Ensure the current user is an admin
  if (role !== UserRole.ADMIN || !userId) {
    console.log("Unauthorized role attempting generating qr code: ");
    sendResponse(
      res,
      403,
      STATUS.ERROR,
      "Forbidden: Only admins can generate qr code."
    );
    return;
  }

  try {
    const result = await prisma.qrCode.findMany({
      include: {
        scans: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Sucesfully fetching qr codes", {
      qrcodes: result,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_ALL_QR_CODES",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    sendResponse(res, 500, STATUS.ERROR, "Error fetching QR codes");
    return;
  }
};

// Delete QR Code
export const deleteQrCode = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId; // The admin making the request
  const role = req.user?.role; // The admin's role

  // Ensure the current user is an admin
  if (role !== UserRole.ADMIN || !userId) {
    console.log("Unauthorized role attempting generating qr code: ");
    sendResponse(
      res,
      403,
      STATUS.ERROR,
      "Forbidden: Only admins can generate qr code."
    );
    return;
  }

  const { id } = req.params;

  try {
    await prisma.qrCode.delete({
      where: { id },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "QR Code deleted successfully");
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "DELETE_QR_CODE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    sendResponse(res, 500, STATUS.ERROR, "Error deleting QR code");
    return;
  }
};

// Track QR Code Scan
export const trackScan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ipAddress = req.ip;
  const userAgent = req.headers["user-agent"];

  try {
    const qrCode = await prisma.qrCode.findUnique({
      where: { id },
      include: { scans: true },
    });

    if (!qrCode) {
      sendResponse(res, 404, STATUS.ERROR, "QR Code not found");
      return;
    }

    // Log the scan in the QrCodeScan table
    await prisma.qrCodeScan.create({
      data: {
        qrCodeId: id,
        ipAddress,
        userAgent,
      },
    });

    sendResponse(res, 200, STATUS.SUCCESS, "Sucesfully tracking .", {
      url: qrCode.url,
    });
    return;
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "TRACK_SCAN",
      message,
      stackTrace,
      userId: req.ip || null,
      severity: SeverityLevel.ERROR,
    });
    sendResponse(res, 500, STATUS.ERROR, "Error tracking QR code scan.");
    return;
  }
};
