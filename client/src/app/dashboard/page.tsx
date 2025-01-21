"use client";
import React from "react";
import DashboardContent from "./DashboardContent";
import SkipNavigation from "../UI/components/SkipNavigation/SkipNavigation";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isValidRole } from "@/utils/TypeGuards";
import LoadingMessage from "../UI/components/LoadingMessage/LoadingMessage";

const DashboardPage = () => {
  const router = useRouter();
  const { profile, isLoading, isError } = useProfile();
  const { role } = useAuth();

  useEffect(() => {
    if (isError || !role) {
      router.push("/");
    }
  }, [router, isError, role]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <h3 className="text-lg font-semibold text-gray-900">Please log back.</h3>
    );
  }

  if (!profile) {
    return <LoadingMessage label="No profile data available" />;
  }

  return (
    <div className="flex flex-col w-full">
      <SkipNavigation />
      {role && isValidRole(role) ? (
        <>
          <DashboardContent />
        </>
      ) : (
        <h1>Not authenticated</h1>
      )}
    </div>
  );
};

export default DashboardPage;
