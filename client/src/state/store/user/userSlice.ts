import {
  Admin,
  Employee,
  Moderator,
  UserProfileResponse,
} from "@/state/dataTypes/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux";

export interface UserState {
  requires2FA: boolean;

  userProfile: UserProfileResponse | null;
  adminProfile: Admin | null;
  moderatorProfile: Moderator | null;
  employeeProfile: Employee | null;
}

const initialState: UserState = {
  requires2FA: false,
  userProfile: null,
  adminProfile: null,
  moderatorProfile: null,
  employeeProfile: null,
};

const employerSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setRequires2FA: (state, action: PayloadAction<boolean>) => {
      state.requires2FA = action.payload;
    },
    clearRequires2FA: (state) => {
      state.requires2FA = false;
    },

    setAdminProfile: (state, action: PayloadAction<Admin>) => {
      state.adminProfile = action.payload;
    },
    setClearAdminProfile: (state) => {
      state.adminProfile = null;
    },

    setModeratorProfile: (state, action: PayloadAction<Moderator>) => {
      state.moderatorProfile = action.payload;
    },
    setClearModeratorProfile: (state) => {
      state.moderatorProfile = null;
    },

    setEmployeeProfile: (state, action: PayloadAction<Employee>) => {
      state.employeeProfile = action.payload;
    },
    setClearEmployeeProfile: (state) => {
      state.employeeProfile = null;
    },
  },
});

export const {
  setRequires2FA,
  clearRequires2FA,
  setAdminProfile,
  setClearAdminProfile,
  setModeratorProfile,
  setClearModeratorProfile,

  setEmployeeProfile,
  setClearEmployeeProfile,
} = employerSlice.actions;

export default employerSlice.reducer;

export const selectedRequires2FA = (state: RootState): boolean | false =>
  state.user.requires2FA;

export const selectedAdminProfile = (state: RootState) =>
  state.user.adminProfile;

export const selectedModeratorProfile = (state: RootState) =>
  state.user.moderatorProfile;

export const selectedEmployeeProfile = (state: RootState) =>
  state.user.employeeProfile;
