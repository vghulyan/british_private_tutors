import { User } from "./User";

export interface BackupCode {
  id: string;
  codeHash: string;
  user: User;
  userId: string;
  used: boolean;
  usedAt?: Date;
  createdAt: Date;
}
