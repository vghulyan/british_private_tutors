import { Request, Response } from "express";
import { UserRole } from "@prisma/client";

export interface LoginRequestBody {
  userName: string;
  password: string;
  token?: string;
}

export const STATUS = {
  ERROR: "error",
  SUCCESS: "success",
  WARNING: "warning",
};

export interface AuthRequest extends Request {
  user?: { userId: string; role: UserRole };
}

export interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  result: T | null;
}

export const sendResponse = <T>(
  res: Response,
  code: number,
  status: string,
  message: string,
  result: T | null = null
): Response<ApiResponse<T>> => {
  const response: ApiResponse<T> = {
    code,
    status,
    message,
    result,
  };
  return res.status(code).json(response);
};

export interface UserInfo {
  userId: string;
  userName: string;
  role: UserRole;
}

export interface CustomRequest extends Request {
  user?: UserInfo; // Change from DecodedToken to UserInfo
  // role?: string;
}

export interface DecodedToken {
  UserInfo: UserInfo; // Utilize the UserInfo interface
}
