import { PhoneType } from "../enums";
import { User } from "./User";

export interface PhoneNumber {
  id: string;
  userId: string;
  user: User;
  fullNumber: string;
  type: PhoneType;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  verificationCode?: number;
  createdAt: Date;
  updatedAt: Date;
}
