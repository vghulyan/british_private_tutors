import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux";
import { Moderator } from "@/state/dataTypes/interfaces/Moderator";

// export interface ModeratorState {
//   moderatorProfile: Moderator | null;
// }

// const initialState: ModeratorState = {
//   moderatorProfile: null,
// };

const moderatorSlice = createSlice({
  name: "moderator",
  initialState: {},
  reducers: {
    // MODERATOR PROFILE
    // setModeratorProfile: (state, action: PayloadAction<Moderator>) => {
    //   state.moderatorProfile = action.payload;
    // },
    // setClearModeratorProfile: (state) => {
    //   state.moderatorProfile = null;
    // },
  },
});

export const {
  /*setModeratorProfile, setClearModeratorProfile*/
} = moderatorSlice.actions;

export default moderatorSlice.reducer;

// export const selectedModeratorProfile = (state: RootState) =>
//   state.moderator.moderatorProfile;
