import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux";
import { UserRole } from "@/state/dataTypes/enums";

interface GeneralInfo {
  title?: "Mr" | "Ms";
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  region: string;
  city: string;
  zipCode: string;
  country: string;
  dialingCode: string;
  mobile: string;
}

export interface RegistrationState {
  currentStep: number; // Starts at 1 for role selection
  role: UserRole.EMPLOYEE | null;
  email: string;
  password: string;
  generalInfo: GeneralInfo;
}

const initialState: RegistrationState = {
  currentStep: 1,
  role: null,
  email: "",
  password: "",
  generalInfo: {
    // No default title
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    region: "",
    city: "",
    zipCode: "",
    country: "",
    dialingCode: "",
    mobile: "",
  },
};

const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<RegistrationState["role"]>) {
      state.role = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },
    setGeneralInfo(state, action: PayloadAction<GeneralInfo>) {
      state.generalInfo = action.payload;
    },
    setCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    resetRegistration(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setRole,
  setEmail,
  setPassword,
  setGeneralInfo,
  setCurrentStep,
  resetRegistration,
} = registrationSlice.actions;

export default registrationSlice.reducer;

export const selectRegistration = (state: RootState): RegistrationState =>
  state.registration;

export const selectCurrentStep = (state: RootState): number =>
  state.registration.currentStep;

export const selectRole = (state: RootState): string | null =>
  state.registration.role;

export const selectEmail = (state: RootState): string =>
  state.registration.email;

export const selectPassword = (state: RootState): string =>
  state.registration.password;

export const selectGeneralInfo = (state: RootState): GeneralInfo =>
  state.registration.generalInfo;
