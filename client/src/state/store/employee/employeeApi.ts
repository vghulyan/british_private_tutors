"use client";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQueryWithReauth";

export const employeeApi = createApi({
  reducerPath: "employeeApi", // Unique reducer path
  baseQuery: baseQueryWithReauth,
  tagTypes: ["UserProfile"],
  keepUnusedDataFor: 0, // no caching, always refetch when needed
  endpoints: (builder) => ({}),
});

export const {
  // useGetEmployeeProfileQuery,
} = employeeApi;
