import { ApiResponse } from "./apiResponse";
import { User } from "./User";

export interface Moderator {
  id: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export type ModeratorResponse = ApiResponse<{ moderatorProfile: Moderator }>;

export interface ModeratorUser {
  email: string;
  firstName: string;
  lastName: string;
  role: "MODERATOR";
  password: string;
  title?: string | undefined;
}
export type ModeratorUsersResponse = ApiResponse<{
  moderators: ModeratorUser;
}>;
export type ModeratorUserResponse = ApiResponse<{
  moderatorRegistrationProfile: ModeratorUser[];
}>;
