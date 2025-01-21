import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import {
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "./auth/authSlice";
import { RootState } from "./redux";
import { UserRole } from "../dataTypes/enums";

import { LoginApiResponse } from "../dataTypes/interfaces";
import {
  setClearAdminProfile,
  setClearEmployeeProfile,
  setClearModeratorProfile,
} from "./user/userSlice";
import { clearMenuItems } from "./global";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    const csrfToken = state.auth.csrfToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      if (csrfToken) {
        headers.set("X-CSRF-Token", csrfToken);
      }
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const state = api.getState() as RootState;
  const isAuthenticated = !!state.auth.accessToken; // Check if user is authenticated

  if (
    result?.error &&
    (result.error.status === 401 || result.error.status === 403) &&
    isAuthenticated // Only try to refresh if authenticated
  ) {
    console.log("Token expired or forbidden, attempting to refresh");

    let retryCount = 0;
    const maxRetries = 3;

    const refreshToken = async () => {
      const csrfToken = state.auth.csrfToken;
      if (!csrfToken) {
        // If no csrfToken, cannot safely call refresh endpoint
        return { error: { status: 403, data: "No CSRF token" } };
      }

      return await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          credentials: "include",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        },
        api,
        extraOptions
      );
    };
    while (retryCount < maxRetries) {
      const refreshResult = await refreshToken();

      if (refreshResult?.data) {
        const data = refreshResult.data as LoginApiResponse;
        const { result: resultData } = data;
        api.dispatch(
          setCredentials({
            isAuthenticated: true,
            accessToken: resultData.accessToken,
            role: resultData.role as UserRole,
            userId: resultData.userId,
            csrfToken: resultData.csrfToken,
            isEmailVerified: resultData.isEmailVerified,
          })
        );

        result = await baseQuery(args, api, extraOptions);
        break;
      } else {
        retryCount++;
        console.log(`Refresh attempt ${retryCount}/${maxRetries} failed`);

        if (retryCount >= maxRetries) {
          console.log("base query logout after failed refresh");
          api.dispatch(logOut());
          api.dispatch(setClearAdminProfile());
          api.dispatch(setClearModeratorProfile());
          api.dispatch(setClearEmployeeProfile());
          api.dispatch(clearMenuItems());
          break;
        }
      }
    }
  }

  return result;
};

export { baseQueryWithReauth };
