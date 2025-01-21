import { Employee } from "@/state/dataTypes/interfaces/Employee";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux";

// export interface EmployeeState {
//   employeeProfile: Employee | null;
// }

// const initialState: EmployeeState = {
//   employeeProfile: null,
// };

const employeeSlice = createSlice({
  name: "employee",
  initialState: {},
  reducers: {
    // EMPLOYEE PROFILE
    // setEmployeeProfile: (state, action: PayloadAction<Employee>) => {
    //   state.employeeProfile = action.payload;
    // },
    // setClearEmployeeProfile: (state) => {
    //   state.employeeProfile = null;
    // },
  },
});

export const {
  /*setEmployeeProfile, setClearEmployeeProfile*/
} = employeeSlice.actions;

export default employeeSlice.reducer;

// export const selectedEmployeeProfile = (state: RootState) =>
//   state.employee.employeeProfile;
