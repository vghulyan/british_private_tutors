"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQueryWithReauth";

import { UserRole } from "@/state/dataTypes/enums";
import {
  Employee,
  GenerateBackupCodesResponse,
  Moderator,
  UserProfileResponse,
} from "@/state/dataTypes/interfaces";
import { toast } from "react-toastify";

import { Admin } from "@/state/dataTypes/interfaces/Admin";
import { ApiResponse } from "@/state/dataTypes/interfaces/apiResponse";

import { logOut } from "../auth/authSlice";
import { RootState } from "../redux";
import {
  setAdminProfile,
  setClearAdminProfile,
  setClearEmployeeProfile,
  setClearModeratorProfile,
  setEmployeeProfile,
  setModeratorProfile,
} from "./userSlice";
import { TwoFactorSetupResponse } from "@/state/dataTypes/interfaces/TwoFactorSetupResponse";
import { extractErrorMessage } from "@/utils/extractErrorMessage";
import { clearMenuItems } from "../global";
// import { setClearUserProfile, setUserProfile } from "./userSlice";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["UserProfile", "2FA"],
  keepUnusedDataFor: 0, // no caching, always refetch when needed
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfileResponse, void>({
      query: () => ({
        url: "/user/user-profile/get-user-profile",
        method: "GET",
      }),
      providesTags: [{ type: "UserProfile", id: "CURRENT" }],
      transformResponse: (response: ApiResponse<any>): UserProfileResponse => {
        // response.result may contain {admin}, {employee}, or {employer}
        return response.result;
        // This returns an object that possibly has {admin}, {employee}, or {employer}
      },
      // transformResponse: (response: UserProfileResponse) => response,
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        const { auth } = getState() as RootState;
        try {
          const { data } = await queryFulfilled;

          if (auth.role === UserRole.ADMIN && data && "admin" in data) {
            const profile = data.admin as Admin;
            dispatch(setAdminProfile(profile));
          }

          if (auth.role === UserRole.MODERATOR && data && "moderator" in data) {
            const profile = data.moderator as Moderator;
            dispatch(setModeratorProfile(profile));
          }

          if (auth.role === UserRole.EMPLOYEE && data && "employee" in data) {
            const profile = data.employee as Employee;
            dispatch(setEmployeeProfile(profile));
          }
          //dispatch(setUserProfile(data)); // store admin/employee/employer in state if needed
        } catch (error: unknown) {
          //   dispatch(setClearUserProfile());
          dispatch(logOut());
          dispatch(setClearAdminProfile());
          dispatch(setClearModeratorProfile());
          dispatch(setClearEmployeeProfile());
          dispatch(clearMenuItems());
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
          // Ensure Router is only used client-side
          // if (typeof window !== "undefined") {
          //   Router.push("/auth/login");
          // }
        }
      },
    }),
    updatePassword: builder.mutation<boolean, { newPassword: string }>({
      query: ({ newPassword }) => ({
        url: "/user/user-profile/update-user-password",
        method: "POST",
        body: { newPassword },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const data = await queryFulfilled;
          toast.success("Successfully updated password");
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
    updateUser: builder.mutation<
      any,
      { firstName: string; lastName: string; title: string; notes?: string }
    >({
      query: (userData) => ({
        url: "/user/user-profile/update-user-info",
        method: "POST",
        body: userData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const data = await queryFulfilled;
          toast.success("Successfully updated user info");
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    // ---------------- 2FA ---------------
    setupTwoFactor: builder.mutation<TwoFactorSetupResponse, void>({
      query: () => ({
        url: "/user/user-profile/2fa/setup",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "2FA", id: "CURRENT" },
        { type: "UserProfile", id: "CURRENT" },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;
          toast.success("Successfully setup 2FA. Please scan the QR code");
        } catch (error: any) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
    verifyTwoFactor: builder.mutation<void, { token: string }>({
      query: (token) => ({
        url: "/user/user-profile/2fa/verify",
        method: "POST",
        body: token,
      }),
      invalidatesTags: [
        { type: "2FA", id: "CURRENT" },
        { type: "UserProfile", id: "CURRENT" },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;
          toast.success("Successfully verified 2FA");
        } catch (error: any) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
    reset2FA: builder.mutation<void, void>({
      query: () => ({
        url: "/user/user-profile/2fa/reset",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "2FA", id: "CURRENT" },
        { type: "UserProfile", id: "CURRENT" },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;
          toast.success("Successfully reset 2FA");
        } catch (error: any) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    // ----------------------- BACKUP ---------------
    generateBackupCodes: builder.mutation<GenerateBackupCodesResponse, void>({
      query: () => ({
        url: "/user/user-profile/backup/generate-backup",
        method: "POST",
      }),
      invalidatesTags: [{ type: "UserProfile", id: "CURRENT" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Safely destructure the response
          toast.success("Successfully generated backup codes");
          // Optional: Dispatch an action if you want to store the backup codes in your Redux store
          // dispatch(setBackupCodes(data));
        } catch (error: any) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
    verifyBackupCode: builder.mutation<{ token: string }, { code: string }>({
      query: (body) => ({
        url: "/user/user-profile/backup/verify-backup",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "UserProfile", id: "CURRENT" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Successfully verified backup codes");
        } catch (error: any) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
    revokeBackupCodes: builder.mutation<GenerateBackupCodesResponse, void>({
      query: () => ({
        url: "/user/user-profile/backup/revoke-backup",
        method: "POST",
      }),
      invalidatesTags: [{ type: "UserProfile", id: "CURRENT" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Successfully revoked backup codes");
        } catch (error: any) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    resendVerification: builder.mutation<void, void>({
      query: () => ({
        url: `/user/user-profile/backup/resend-verification`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "UserProfile", id: "CURRENT" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Successfully resend verification");
        } catch (error: any) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    deleteAccount: builder.mutation<void, void>({
      query: () => ({
        url: "/shared/delete-account",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "UserProfile", id: "CURRENT" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("You account has been deleted successfully");

          dispatch(setClearModeratorProfile());
          dispatch(setClearEmployeeProfile());
          dispatch(setClearAdminProfile());
          dispatch(logOut());
          dispatch(clearMenuItems());
        } catch (error: any) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
          toast.error("Failed to delete your account");
        }
      },
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdatePasswordMutation,
  useUpdateUserMutation,
  // ------------ 2FA ------------
  useSetupTwoFactorMutation,
  useVerifyTwoFactorMutation,
  useReset2FAMutation,

  useGenerateBackupCodesMutation,
  useVerifyBackupCodeMutation,
  useRevokeBackupCodesMutation,

  // ------------------ EMAIL VERIFICATION ---------------
  useResendVerificationMutation,
  // ---------------- DELETE ACCOUNT ----------
  useDeleteAccountMutation,
} = userApi;
