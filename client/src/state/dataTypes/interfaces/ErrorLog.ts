import { SeverityLevel } from "../enums";
import { User } from "./User";

export interface ErrorLog {
  id: string;
  errorCode: string;
  message: string;
  stackTrace?: string;
  userId?: string;
  user?: User;
  createdAt: Date;
  severity: SeverityLevel;
}
