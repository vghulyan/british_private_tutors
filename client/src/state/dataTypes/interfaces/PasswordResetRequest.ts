import { User } from "./User";

export interface PasswordResetRequest {
  id: string;
  userId: string;
  user: User;
  createdAt: Date;
  token?: string;
  ipAddress?: string;
}
