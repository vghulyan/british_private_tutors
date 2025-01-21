import { EmployeeStatus, Gender } from "../enums";
import { User } from "./User";

export interface Employee {
  id: string;
  userId: string;
  user: User;
  dob: Date;
  gender: Gender;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}
