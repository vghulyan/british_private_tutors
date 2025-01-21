import { User } from "./User";

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  role: string;
  user: User;
  expiresAt: Date;
  createdAt: Date;
}
