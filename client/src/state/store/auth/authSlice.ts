import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux";
import { UserRole } from "@/state/dataTypes/enums";

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  role: UserRole | null;
  userId: string | null;
  csrfToken: string;
  isEmailVerified: boolean;

  // profile?: NannyProfile | ParentProfile | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  role: null,
  userId: null,
  csrfToken: "",
  isEmailVerified: false,
  // profile: null,
};

interface CredentialsPayload {
  isAuthenticated: boolean;
  accessToken: string;
  role: UserRole;
  userId: string;
  csrfToken: string;
  isEmailVerified: boolean;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;
      state.userId = action.payload.userId;
      state.csrfToken = action.payload.csrfToken || "";
      state.isEmailVerified = action.payload.isEmailVerified;
    },
    setCsrfToken: (state, action: PayloadAction<string>) => {
      state.csrfToken = action.payload;
    },
    logOut: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.role = null;
      state.userId = null;
      state.csrfToken = "";
      state.isEmailVerified = false;

      // state.profile = null;
    },
  },
});

export const { setCredentials, setCsrfToken, logOut } = authSlice.actions;

export default authSlice.reducer;

// const isAuthenticatedUser = useAppSelector(selectIsAuthenticatedUser);
export const selectAuth = (state: RootState): AuthState => state.auth;

// const isAuthenticated = useAppSelector(selectIsAuthenticated);
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;

// const role = useAppSelector(selectUserRole);
export const selectUserRole = (state: RootState): UserRole | null =>
  state.auth.role;

// const userId = useAppSelector(selectUserId);
export const selectUserId = (state: RootState): string | null =>
  state.auth.userId;

export const selectCsrfToken = (state: RootState): string | null =>
  state.auth.csrfToken;
