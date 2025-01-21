import { ApiResponse } from "./apiResponse";

export interface GeneralInfo {
  title?: "Mr" | "Ms";
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  region: string;
  city: string;
  zipCode: string;
  country: string;
  mobile: string;
}

export interface RegistrationState {
  role: "EMPLOYER" | "EMPLOYEE" | null; // Can also be extended to "COMPANY", "PARTNER", etc.
  email: string;
  password: string;
  generalInfo: GeneralInfo;
}

export interface RegistrationArgs {
  registrationData: RegistrationState;
  csrfToken: string;
}

export type RegisterResponse = ApiResponse<{
  register: string;
}>;
