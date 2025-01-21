import { UserRole } from "../enums";
import { Address } from "./Address";
import { Admin } from "./Admin";
import { ApiResponse } from "./apiResponse";
import { BackupCode } from "./BackupCode";
import { Employee } from "./Employee";
import { ErrorLog } from "./ErrorLog";
import { Moderator } from "./Moderator";
import { Notification } from "./Notification";
import { PasswordReset } from "./PasswordReset";
import { PasswordResetRequest } from "./PasswordResetRequest";
import { PhoneNumber } from "./PhoneNumber";
import { RefreshToken } from "./RefreshToken";
import { UserPreference } from "./UserPreference";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title: string;
  notes?: string;
  role: UserRole;
  addresses: Address[];
  employees: Employee[];
  admin?: Admin;
  moderator?: Moderator;
  refreshTokens: RefreshToken[];
  isEmailVerified: boolean;
  avatarName?: string;
  createdAt: Date;
  updatedAt: Date;
  phoneNumbers: PhoneNumber[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodesEnabled: boolean;
  backupCodes: BackupCode[];
  isDeleted: boolean;
  deletedAt?: Date;
  errorLogs: ErrorLog[];
  notifications: Notification[];
  userPreferences: UserPreference[];
}

export type ResetForgotResponse = ApiResponse<{ message: string }>;
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

export type UsersResponse = ApiResponse<{ users: User[] }>;

type UserProfileResult = {
  admin?: Admin;
  moderator?: Moderator;
  employee?: Employee;
};
export type UserProfileResponse = ApiResponse<UserProfileResult>;
