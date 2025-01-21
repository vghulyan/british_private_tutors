import { User } from "./User";

export interface PasswordReset {
  id: string;
  userId: string;
  user: User;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
