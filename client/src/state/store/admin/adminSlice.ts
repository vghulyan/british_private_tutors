import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux";
import { Admin } from "@/state/dataTypes/interfaces/Admin";

// export interface AdminState {
//   // adminProfile: Admin | null;
// }

// const initialState: AdminState = {
//   // adminProfile: null,
// };

const adminSlice = createSlice({
  name: "admin",
  initialState: {},
  reducers: {
    // ADMIN PROFILE
    // setAdminProfile: (state, action: PayloadAction<Admin>) => {
    //   state.adminProfile = action.payload;
    // },
    // setClearAdminProfile: (state) => {
    //   state.adminProfile = null;
    // },
  },
});

export const {
  /*setAdminProfile, setClearAdminProfile*/
} = adminSlice.actions;

export default adminSlice.reducer;

// export const selectedAdminProfile = (state: RootState) =>
//   state.admin.adminProfile;
