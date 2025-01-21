"use client";

import type { Metadata } from "next";
import React, { ReactNode } from "react";
import CookieConsent from "../components/CookieConsent/CookieConsent";
import StoreProvider from "@/state/store/redux";
import Navbar from "../components/Navbar/Navbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className={`flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
      {/* {isAuthenticated && <Sidebar />} */}

      <main className="flex flex-col w-full h-full  bg-gray-50">
        <Navbar />
        {children}
      </main>

      <CookieConsent />
    </div>
  );
};

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PROJECT_NAME,
  description: process.env.NEXT_PUBLIC_PROJECT_NAME,
};

export const DashboardWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};
