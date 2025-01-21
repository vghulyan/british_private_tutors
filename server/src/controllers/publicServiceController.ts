import QRCode from "qrcode";

import { Request, Response } from "express";
import { FRONTEND_BASE_URL } from "../utils/config";
import { verifyToken } from "./authController";

import prisma from "../utils/prisma";
import { extractErrorDetails, logError } from "../utils/errorLogService";
import { SeverityLevel } from "@prisma/client";

// ----------------- EMAIL VERIFICATION -----------------
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.redirect(`${FRONTEND_BASE_URL}/verification?status=error`);
  }

  try {
    const { userId } = verifyToken(token);
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });

    // Redirect user to success status in your front-end
    return res.redirect(`${FRONTEND_BASE_URL}/verification?status=success`);
  } catch (error) {
    const { message, stackTrace } = extractErrorDetails(error);
    await logError({
      errorCode: "VERIFY_EMAIL",
      message,
      stackTrace,
      userId: null,
      severity: SeverityLevel.ERROR,
    });
    console.error("Error verifying email:", error);
    return res.redirect(`${FRONTEND_BASE_URL}/verification?status=error`);
  }
};
