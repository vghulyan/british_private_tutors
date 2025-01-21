"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useAppSelector } from "@/state/store/redux";

import LoadingMessage from "../UI/components/LoadingMessage/LoadingMessage";
import { currentMenuItem } from "@/state/store/global";

// Map component paths to dynamic imports
export const componentMap: {
  [key: string]: React.LazyExoticComponent<React.ComponentType<any>>;
} = {
  "MegaMenu/Dashboard/Dashboard": React.lazy(
    () => import("../UI/components/MegaMenu/Dashboard/Dashboard")
  ),
  // "MegaMenu/Features/Analytics": React.lazy(
  //   () => import("../UI/components/MegaMenu/Dashboard/Analytics")
  // ),

  // ********************** ADMIN *************************
  "MegaMenu/Services/Users": React.lazy(
    () => import("../UI/components/MegaMenu/Services/Users")
  ),
  "MegaMenu/Services/Email": React.lazy(
    () => import("../UI/components/MegaMenu/Services/Email")
  ),
  "MegaMenu/Services/SocialMedia": React.lazy(
    () => import("../UI/components/MegaMenu/Services/SocialMedia")
  ),

  // ********************** ADMIN *************************
  // Add more mappings for other component paths...
  // ================ SETTINGS ===============
  "MegaMenu/Settings/User": React.lazy(
    () => import("../UI/components/MegaMenu/Settings/User")
  ),
  "MegaMenu/Settings/UpdatePassword": React.lazy(
    () => import("../UI/components/MegaMenu/Settings/UpdatePassword")
  ),
  "MegaMenu/Settings/TwoFA": React.lazy(
    () => import("../UI/components/MegaMenu/Settings/TwoFA")
  ),
  "MegaMenu/Settings/BackupCodes": React.lazy(
    () => import("../UI/components/MegaMenu/Settings/BackupCodes")
  ),
  "MegaMenu/Settings/UserSettings": React.lazy(
    () => import("../UI/components/MegaMenu/Settings/UserSettings")
  ),
};

const DashboardContent = () => {
  const menuItem = useAppSelector(currentMenuItem);

  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (menuItem?.componentPath && componentMap[menuItem.componentPath]) {
      setComponent(() => componentMap[menuItem.componentPath]);
    } else {
      setComponent(null);
    }
  }, [menuItem]);

  if (!menuItem || !Component) {
    return <div>Select a menu item to view content.</div>;
  }

  return (
    <Suspense fallback={<LoadingMessage label="Loading component..." />}>
      <Component />
    </Suspense>
  );
};

export default DashboardContent;
