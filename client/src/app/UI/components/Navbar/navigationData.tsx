import { UserRole } from "@/state/dataTypes/enums";
import { NavigationItem } from "@/state/dataTypes/interfaces";
import {
  DatabaseBackup,
  Eye,
  Factory,
  Mail,
  Settings,
  User,
} from "lucide-react";
import React from "react";

// Define the interface for individual menu items

// Create the menu data array following the defined types
export const getNavigationItems: NavigationItem[] = [
  {
    heading: "Dashboard",
    icon: <span>🔔</span>,
    items: [
      {
        title: "Dashboard",
        link: "/dashboard/dashboard",
        description: "Dashboard page.",
        icon: <span>🔔</span>,
        componentPath: "MegaMenu/Dashboard/Dashboard",
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
      },
    ],
  },
  {
    heading: "Admin Services",
    items: [
      {
        title: "Users",
        link: "/services/users",
        description: "Existing & New Users",
        icon: <span>🔗</span>,
        componentPath: "MegaMenu/Services/Users",
        roles: [UserRole.ADMIN],
      },
      {
        title: "Email",
        link: "/services/emails",
        description: "Email Services & Templates",
        icon: <Mail />,
        componentPath: "MegaMenu/Services/Email",
        roles: [UserRole.ADMIN],
      },
      {
        title: "Social Media",
        link: "/services/socialMedia",
        description: "Social Media",
        icon: <Mail />,
        componentPath: "MegaMenu/Services/SocialMedia",
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    heading: "Settings",
    icon: <Settings />,
    items: [
      {
        title: "Update User Info",
        link: "/settings/user",
        description: "Update User Info page.",
        icon: <User className="bg-slate-200 rounded" />,
        componentPath: "MegaMenu/Settings/User",
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
      },
      {
        title: "Update Password",
        link: "/settings/UpdatePassword",
        description: "Update your password.",
        icon: <Eye className="bg-red-200 rounded" />,
        componentPath: "MegaMenu/Settings/UpdatePassword",
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
      },
      {
        title: "Update 2FA",
        link: "/settings/TwoFA",
        description: "Update your 2FA.",
        icon: <Factory className="bg-yellow-200 rounded" />,
        componentPath: "MegaMenu/Settings/TwoFA",
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
      },
      {
        title: "Backup Codes",
        link: "/settings/BackupCodes",
        description: "Update your Backup Codes.",
        icon: <DatabaseBackup className="bg-cyan-200 rounded" />,
        componentPath: "MegaMenu/Settings/BackupCodes",
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
      },
      {
        title: "User Settings",
        link: "/settings/UserSettings",
        description: "Update your settings.",
        icon: <Settings className="bg-gray-200 rounded" />,
        componentPath: "MegaMenu/Settings/UserSettings",
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
      },
    ],
  },
];
