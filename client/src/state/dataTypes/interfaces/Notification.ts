import {
  NotificationCategory,
  NotificationStatus,
  NotificationType,
} from "../enums";
import { ApiResponse } from "./apiResponse";
import { User } from "./User";

export interface Notification {
  id: string;
  userId: string;
  user: User;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  category: NotificationCategory;
  createdAt: Date;
  readAt?: Date;
  read: boolean;
  link?: string;
  scheduledAt?: Date;
  isRecurring: boolean;
  recurrenceInterval?: string;
  expiryDate?: Date;
}

export type NotificationsResponse = ApiResponse<{
  notifications: Notification[];
}>;
