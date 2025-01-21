"use client";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQueryWithReauth";

export const moderatorApi = createApi({
  reducerPath: "moderatorApi", // Unique reducer path
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ModeratorProfile", "Users"],
  keepUnusedDataFor: 0, // no caching, always refetch when needed
  endpoints: (builder) => ({}),
});

export const {
  /* getters */
} = moderatorApi;
