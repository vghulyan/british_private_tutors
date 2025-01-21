import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  // tagTypes: ["CsrfToken", "UserProfile", "SubscriptionPlan"],
  endpoints: () => ({}), // Initially empty, endpoints will be injected
});
