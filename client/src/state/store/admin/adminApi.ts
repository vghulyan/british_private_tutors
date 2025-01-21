"use client";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQueryWithReauth";

import { logOut } from "../auth/authSlice";

import { toast } from "react-toastify";

import {
  EmailTemplate,
  EmailTemplateResponse,
  EmailTemplatesResponse,
  ModeratorUser,
  ModeratorUsersResponse,
  QrCodeResponse,
  QrCodeScanResponse,
  QrCodesResponse,
  RejectedError,
  User,
  UsersResponse,
} from "@/state/dataTypes/interfaces";
import { Admin, AdminResponse } from "@/state/dataTypes/interfaces/Admin";
import { extractErrorMessage } from "@/utils/extractErrorMessage";
import { setAdminProfile } from "../user/userSlice";
import { clearMenuItems } from "../global";

export const adminApi = createApi({
  reducerPath: "adminApi", // Unique reducer path
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminProfile", "Users", "EmailTemplate", "QrCode"],
  keepUnusedDataFor: 0, // no caching, always refetch when needed
  endpoints: (builder) => ({
    getAdminProfile: builder.query<Admin, void>({
      query: () => ({
        url: "/admin/get-admin-profile",
        method: "GET",
      }),

      providesTags: (result) => [{ type: "AdminProfile", id: "CURRENT" }],
      transformResponse: (response: AdminResponse) =>
        response.result.adminProfile,
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAdminProfile(data));
        } catch (error: unknown) {
          // First, we cast the error to RejectedError for proper type checking
          const rejectedError = error as RejectedError;

          const statusCode =
            rejectedError?.error?.status || rejectedError?.originalStatus;
          const errorState = rejectedError?.state;

          // Log the extracted state (you can also use this for other purposes)

          if (statusCode === 400 || statusCode === 404) {
            // const router = useRouter();

            try {
              // Log out the user
              dispatch(logOut());
              dispatch(clearMenuItems());

              toast.error(
                "An unexpected error occurred. Logging out. Please log back in. If persist, please notify us."
              );
            } catch (error) {
              const errMsg = extractErrorMessage(error);
              toast.error(errMsg);
            }
          }
        }
      },
    }),

    getAllUsers: builder.query<User[], void>({
      query: () => ({
        url: "/admin/get-all-users",
        method: "GET",
      }),

      providesTags: () => [{ type: "Users", id: "LIST" }],
      transformResponse: (response: UsersResponse) => response.result.users,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
        } catch (error: unknown) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
    softDeleteUser: builder.mutation<User, string>({
      query: (id) => ({
        url: `/admin/soft-delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
      async onQueryStarted(contractId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Sucesfully delete user");
          }
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
    adminRegisterNewUser: builder.mutation<
      ModeratorUsersResponse,
      ModeratorUser
    >({
      query: (userData) => ({
        url: "/admin/admin-register-new-user",
        method: "POST",
        body: userData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const data = await queryFulfilled;
        } catch (error) {
          toast.error("Failed to fetch CSRF token.");
        }
      },
    }),

    // ------------------ TEMPLATES ------------------
    createEmailTemplate: builder.mutation<
      EmailTemplateResponse,
      Partial<EmailTemplate>
    >({
      query: (template) => ({
        url: "/admin/create-email-template",
        method: "POST",
        body: template,
      }),
      invalidatesTags: ["EmailTemplate"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success("Email template created successfully");
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
    updateEmailTemplate: builder.mutation<
      EmailTemplateResponse,
      Partial<EmailTemplate>
    >({
      query: ({ id, ...rest }) => ({
        url: `/admin/update-email-template/${id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: ["EmailTemplate"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
    getEmailTemplates: builder.query<EmailTemplatesResponse, void>({
      query: () => "/admin/get-email-templates",
      providesTags: ["EmailTemplate"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    // ----------------- QR CODE -----------------
    generateQrCode: builder.mutation<
      QrCodeResponse,
      { name: string; url: string }
    >({
      query: (data) => ({
        url: `/admin/qrcode/generate-qr-code`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "QrCode", id: "CURRENT" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success("Successfully generated qr code");
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    getAllQrCodes: builder.query<QrCodesResponse, void>({
      query: () => ({
        url: "/admin/qrcode/get-all-qr-codes",
        method: "GET",
      }),
      providesTags: (result) => [{ type: "QrCode", id: "CURRENT" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    deleteQrCode: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/qrcode/delete-qr-code/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "QrCode", id: "CURRENT" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Successfully deleted qr code");
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),

    trackScan: builder.query<QrCodeScanResponse, void>({
      query: (id) => ({
        url: `/admin/qrcode/track-scan/${id}`,
        method: "GET",
      }),
      providesTags: (result) => [{ type: "QrCode", id: "CURRENT" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
        } catch (error) {
          const errMsg = extractErrorMessage(error);
          toast.error(errMsg);
        }
      },
    }),
  }),
});

export const {
  useGetAdminProfileQuery,
  useGetAllUsersQuery,
  useSoftDeleteUserMutation,
  useAdminRegisterNewUserMutation, // Admin

  // --------- EMAIL TEMPLATES
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useGetEmailTemplatesQuery,

  // ---------- QR CODES -----------
  useGenerateQrCodeMutation,
  useGetAllQrCodesQuery,
  useDeleteQrCodeMutation,
  useTrackScanQuery,
} = adminApi;
