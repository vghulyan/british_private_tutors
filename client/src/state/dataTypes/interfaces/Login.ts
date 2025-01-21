import { ApiResponse } from "./apiResponse";

export interface LoginRequest {
  userCredentials: {
    userName: string;
    password: string;
  };
  csrfToken: string;
  token?: string; // 2FA token or backup code
}

export type LoginApiResponse = ApiResponse<{
  accessToken: string;
  isEmailVerified: boolean;
  role: string;
  userId: string;
  csrfToken: string;
  requires2FA?: boolean;
}>;
