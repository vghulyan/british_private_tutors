import { createApi } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import {
  LoginApiResponse,
  LoginRequest,
} from "../../dataTypes/interfaces/Login";
import { CsrfTokenResponse } from "../../dataTypes/interfaces/apiResponse";
import { baseQueryWithReauth } from "../baseQueryWithReauth";
import { logOut, setCredentials } from "./authSlice";

import { UserRole } from "../../dataTypes/enums";
import {
  setClearAdminProfile,
  setClearEmployeeProfile,
  setClearModeratorProfile,
  setRequires2FA,
} from "../user/userSlice";
import { isValidRole } from "@/utils/TypeGuards";
import {
  RegistrationArgs,
  ResetForgotResponse,
  ResetPasswordRequest,
} from "@/state/dataTypes/interfaces";
import { extractErrorMessage } from "@/utils/extractErrorMessage";
import { clearMenuItems } from "../global";

export const authApi = createApi({
  reducerPath: "authApi", // Unique reducer path
  baseQuery: baseQueryWithReauth,
  tagTypes: ["UserProfile", "CsrfToken", "RegisterUser"],
  keepUnusedDataFor: 0, // no caching, always refetch when needed
  endpoints: (builder) => ({
    login: builder.mutation<
      // ApiResponse<LoginSuccessResponse>,
      LoginApiResponse,
      // LoginMutationArgs
      LoginRequest
    >({
      query: ({ userCredentials, csrfToken }) => ({
        url: "/auth/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: userCredentials,
        credentials: "include" as RequestCredentials, // Explicitly type as 'include'
      }),
      invalidatesTags: ["UserProfile", "CsrfToken"],

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { result } = data || null;

          if (result.requires2FA) {
            // Logic for when `requires2FA` is true

            dispatch(setRequires2FA(result.requires2FA));
            // Add your specific 2FA handling logic here
          } else if (result.role) {
            // Check if user role is valid
            if (isValidRole(result.role as UserRole)) {
              // Dispatch credentials for authenticated user
              dispatch(
                setCredentials({
                  isAuthenticated: true,
                  accessToken: result.accessToken,
                  role: result.role as UserRole,
                  userId: result.userId,
                  csrfToken: result.csrfToken,
                  isEmailVerified: result.isEmailVerified,
                })
              );
            } else {
              // Handle invalid role

              toast.error(`An invalid role: ${result.role}`);
            }
          } else {
            toast.error(`Unexpected error occures. Please contact us`);
          }
        } catch (error: any) {
          // const message =
          //   error?.error?.data?.message || "An unexpected error occurred";
          // toast.error(message);
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    logout: builder.mutation<void, string>({
      query: (csrfToken) => ({
        url: "/auth/logout",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      }),

      invalidatesTags: [
        { type: "UserProfile", id: "CURRENT" },
        { type: "CsrfToken", id: "CURRENT" },
      ],

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logOut());
          dispatch(setClearAdminProfile());
          dispatch(setClearModeratorProfile());
          dispatch(setClearEmployeeProfile());
          dispatch(clearMenuItems());
        } catch (error) {
          toast.error("Session expires. Please log back.");
          dispatch(setClearAdminProfile());
          dispatch(setClearModeratorProfile());
          dispatch(setClearEmployeeProfile());
          dispatch(clearMenuItems());

          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    registerUser: builder.mutation<
      // ApiResponse<LoginSuccessResponse>,
      LoginApiResponse,
      RegistrationArgs
    >({
      query: ({ registrationData, csrfToken }) => {
        return {
          url: "/auth/register", // Update the URL to the registration endpoint
          method: "POST",
          body: registrationData,
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
        };
      },
      invalidatesTags: [
        { type: "UserProfile", id: "CURRENT" },
        { type: "RegisterUser", id: "CURRENT" },
      ],

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { result } = data || null;

          // Check if user role is valid
          if (isValidRole(result.role as UserRole)) {
            // Dispatch credentials for authenticated user
            dispatch(
              setCredentials({
                isAuthenticated: true,
                accessToken: result.accessToken,
                role: result.role as UserRole,
                userId: result.userId,
                csrfToken: result.csrfToken,
                isEmailVerified: result.isEmailVerified,
              })
            );
          } else {
            // Handle invalid role

            toast.error(`An invalid role: ${result.role}`);
          }

          toast.success(
            "Registration successful! We’ve sent a verification email. Please check your inbox."
          );
        } catch (error: any) {
          // const message =
          //   error?.error?.data?.message || "An unexpected error occurred";
          // toast.error(message);

          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    fetchCsrfToken: builder.query<CsrfTokenResponse, void>({
      query: () => "/csrf-token",
      providesTags: ["CsrfToken"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    forgotPassword: builder.mutation<ResetForgotResponse, string>({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),

      invalidatesTags: [
        { type: "CsrfToken", id: "CURRENT" },
        { type: "UserProfile", id: "CURRENT" },
      ],

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Extract `data` from the resolved query
          toast.success(data.message);
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
    resetPassword: builder.mutation<ResetForgotResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "CsrfToken", id: "CURRENT" },
        { type: "UserProfile", id: "CURRENT" },
      ],

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Extract `data` from the resolved query
          toast.success(data.message);
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterUserMutation,
  useFetchCsrfTokenQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
