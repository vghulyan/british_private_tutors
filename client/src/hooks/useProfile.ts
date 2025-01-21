"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/state/dataTypes/enums";
import { useAppSelector } from "@/state/store/redux";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Admin, Employee, Moderator } from "@/state/dataTypes/interfaces";
import { useGetUserProfileQuery } from "@/state/store/user/userApi";
import {
  selectedAdminProfile,
  selectedEmployeeProfile,
  selectedModeratorProfile,
} from "@/state/store/user/userSlice";

export interface Profile {
  profile: Admin | Employee | Moderator | null;
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export const useProfile = (): Profile => {
  const router = useRouter();
  const { role, isAuthenticated, userId } = useAuth();
  const adminProfile = useAppSelector(selectedAdminProfile);
  const moderatorProfile = useAppSelector(selectedModeratorProfile);
  const employeeProfile = useAppSelector(selectedEmployeeProfile);

  const { isSuccess, isLoading, isError, error } = useGetUserProfileQuery(
    undefined,
    {
      skip: !role || !isAuthenticated || !userId,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (isError) {
      router.push("/"); // Navigate to the home page
    }
  }, [isError, router]);

  const getErrorMessage = (error: unknown): string | null => {
    if (error && typeof error === "object" && "data" in error) {
      const err = error as FetchBaseQueryError;
      return (err.data as { message?: string })?.message || "Unknown error.";
    }
    return null;
  };

  const errorMessage = isError ? getErrorMessage(error) : null;

  if (!isAuthenticated || !userId) {
    return {
      profile: null,
      isSuccess: false,
      isLoading: false,
      isError: true,
      errorMessage,
    };
  }

  let userProfile: Admin | Employee | null = null;

  if (role === UserRole.ADMIN && adminProfile) {
    userProfile = adminProfile;
  } else if (role === UserRole.MODERATOR && moderatorProfile) {
    userProfile = moderatorProfile;
  } else if (role === UserRole.EMPLOYEE && employeeProfile) {
    userProfile = employeeProfile;
  }

  return {
    profile: userProfile,
    isSuccess,
    isLoading,
    isError,
    errorMessage,
  };
};
