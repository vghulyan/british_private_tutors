import { ApiResponse } from "./apiResponse";
import { User } from "./User";

export interface Admin {
  id: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminResponse = ApiResponse<{ adminProfile: Admin }>;
