import { ThemeType } from "../enums";
import { User } from "./User";

export interface UserPreference {
  id: string;
  userId: string;
  user: User;
  receiveNewsletters: boolean;
  receiveReminders: boolean;
  theme: ThemeType;
  notificationSettings?: Record<string, unknown>;
}
