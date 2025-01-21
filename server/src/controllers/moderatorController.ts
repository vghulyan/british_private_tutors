import { Response } from "express";
import { AuthRequest, sendResponse, STATUS } from "../interfaces";

import { SeverityLevel, UserRole } from "@prisma/client";
import prisma from "../utils/prisma";
import { extractErrorDetails, logError } from "../utils/errorLogService";

export const getModeratorProfile = async (
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
    if (role !== UserRole.MODERATOR && role !== UserRole.ADMIN) {
      sendResponse(res, 403, STATUS.ERROR, "Forbidden");
      return;
    }
    // Fetch the employee associated with the authenticated user and ensure the user is not deleted
    const moderatorProfile = await prisma.moderator.findUnique({
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

    if (!moderatorProfile) {
      sendResponse(res, 404, STATUS.ERROR, "Moderator not found.");
      return;
    }
    console.log("moderator>>>: ", JSON.stringify(moderatorProfile, null, 2));

    // If employee is found, return the profile
    sendResponse(res, 200, STATUS.SUCCESS, "Moderator profile found.", {
      moderatorProfile,
    });
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "GET_MODERATOR_PROFILE",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    // ToDo: Log Error, ring alarm
    if (error instanceof Error) {
      console.error("Error fetching moderator profile:", {
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

export const getAllUsersModerator = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { role } = req.user!;
  if (role !== UserRole.MODERATOR || !userId) {
    sendResponse(res, 403, STATUS.ERROR, "Forbidden");
    return;
  }

  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false, role: { not: UserRole.MODERATOR } },
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
      errorCode: "GET_ALL_USERS_MODERATOR",
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
