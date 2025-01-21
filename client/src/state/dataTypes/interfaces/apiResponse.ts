import { STATUS } from "../enums";

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
  status: typeof STATUS.SUCCESS | typeof STATUS.ERROR; // Use STATUS enum values
}

export interface CsrfTokenResponse {
  csrfToken: string;
}

export interface ApiError {
  code: string; // Custom error code from your API
  message: string; // Error message from your API
  status: number; // Status code like 400, 401, 500, etc.
}

export interface RejectedError {
  error?: {
    status?: number;
    data?: any;
  };
  originalStatus?: number;
  state?: any;
}
