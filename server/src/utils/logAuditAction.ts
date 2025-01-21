// utils/auditLogger.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AuditAction } from "@prisma/client"; // Ensure you have exported AuditAction enum from Prisma
import { NextFunction, Request, Response } from "express";
import { AuthRequest, sendResponse, STATUS } from "../interfaces";
import prisma from "./prisma";
import { ACCESS_TOKEN_SECRET } from "./config";

export const logRequestWithEntityId = (action: AuditAction, entity: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const ipAddress = req.ip;
    const requestPath = req.originalUrl;
    const requestMethod = req.method;

    // Extract token from authorization header
    const authHeader =
      req.headers.authorization || (req.headers as any).Authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      console.log("No token found, logging IP address only.");
      // return res.status(401).json({ message: "Unauthorized" });

      sendResponse(res, 401, STATUS.ERROR, "Unauthorized");
      return;
    }

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
      const userInfo = decoded?.UserInfo;

      if (!userInfo || !userInfo.userId || !userInfo.role) {
        console.log("Invalid token payload, logging IP address only.");
        sendResponse(res, 403, STATUS.ERROR, "Forbidden");
        return;
      }

      // Retrieve user ID and role from the decoded token
      const userId = userInfo.userId;
      req.user = userInfo; // Optionally attach to req.user if you want to use it elsewhere

      // Log the audit entry
      await prisma.auditLog.create({
        data: {
          action,
          userId,
          entity,
          details: `Accessed ${requestPath} via ${requestMethod}`,
          ipAddress,
        },
      });

      next();
    } catch (error) {
      console.error("Error verifying token:", error);
      // res.status(403).json({ message: "Forbidden" });

      sendResponse(res, 403, STATUS.ERROR, "Forbidden");
      return;
    }
  };
};
