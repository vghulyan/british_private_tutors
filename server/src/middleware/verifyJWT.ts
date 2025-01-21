import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { ACCESS_TOKEN_SECRET } from "../utils/config";
import {
  CustomRequest,
  DecodedToken,
  sendResponse,
  STATUS,
} from "../interfaces";

// Type Guard for DecodedToken
export const isDecodedToken = (decoded: any): decoded is DecodedToken => {
  return (
    typeof decoded === "object" &&
    decoded !== null &&
    "UserInfo" in decoded &&
    typeof decoded.UserInfo.userId === "string" &&
    typeof decoded.UserInfo.userName === "string" &&
    typeof decoded.UserInfo.role === "string"
  );
};

export const verifyJWT = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader =
    req.headers.authorization || (req.headers as any).Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    sendResponse(res, 401, STATUS.ERROR, "Unauthorized");
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    ACCESS_TOKEN_SECRET,
    (
      err: jwt.VerifyErrors | null,
      decoded: jwt.JwtPayload | string | undefined
    ) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          // If the token is expired, let the client know so they can refresh
          sendResponse(res, 401, STATUS.ERROR, "Access token expired");
          return;
        }
        console.error("JWT Verification Error: ", err);
        sendResponse(res, 403, STATUS.ERROR, "Forbidden");
        return;
      }

      if (isDecodedToken(decoded)) {
        req.user = (decoded as JwtPayload).UserInfo;
        next();
      } else {
        sendResponse(res, 403, STATUS.ERROR, "Invalid token payload");
        return;
      }
    }
  );
};
