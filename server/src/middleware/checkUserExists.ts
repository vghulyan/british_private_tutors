import { Response, NextFunction } from "express";
import { PrismaClient, SeverityLevel } from "@prisma/client";
import { CustomRequest, sendResponse, STATUS } from "../interfaces";
import prisma from "../utils/prisma";
import { extractErrorDetails, logError } from "../utils/errorLogService";

// const prisma = new PrismaClient();

export const checkUserExists = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.userId; // Extract userId from the JWT (set by verifyJWT)

  if (!userId) {
    console.log("No user ID:");
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized access.", null);
    return;
  }

  try {
    // Check if the user exists in the database
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      console.log("User not found");
      sendResponse(res, 404, STATUS.ERROR, "User not found.", null);
      return;
    }

    // If the user exists, proceed to the next middleware/controller
    next();
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "CHECK_USER_EXISTS",
      message,
      stackTrace,
      userId: req.user?.userId || null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error checking user existence:", error);
    sendResponse(res, 500, STATUS.ERROR, "Server error.", null);
  }
};
