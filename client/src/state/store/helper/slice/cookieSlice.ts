import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../redux";

interface CookieState {
  consent: "undecided" | "accepted" | "declined";
}

const initialState: CookieState = {
  consent: "undecided", // Default value
};

const cookieSlice = createSlice({
  name: "cookie",
  initialState,
  reducers: {
    setConsent(state, action: PayloadAction<CookieState["consent"]>) {
      state.consent = action.payload;
    },
  },
});

export const { setConsent } = cookieSlice.actions;
export default cookieSlice.reducer;

export const selectedConsent = (state: RootState) => state.cookie.consent;
