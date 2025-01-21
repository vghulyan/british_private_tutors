import { UserRole } from "@prisma/client";
import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest, sendResponse, STATUS } from "../interfaces";
import { ACCESS_TOKEN_SECRET } from "./config";

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader =
      req.headers.authorization || (req.headers as any).Authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      sendResponse(res, 401, STATUS.ERROR, "Unauthorized");
      return;
    }

    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
      const userInfo = decoded?.UserInfo;

      if (!userInfo || !userInfo.userId || !userInfo.role) {
        sendResponse(res, 403, STATUS.ERROR, "Forbidden");
        return;
      }

      const userRole = userInfo.role;

      if (!allowedRoles.includes(userRole)) {
        sendResponse(res, 403, STATUS.ERROR, "Forbidden");
        return;
      }

      req.user = userInfo;
      next();
    } catch (err) {
      sendResponse(res, 403, STATUS.ERROR, "Forbidden");
      return;
    }
  };
}
