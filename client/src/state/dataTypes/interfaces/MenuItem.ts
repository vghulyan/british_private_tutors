import { UserRole } from "../enums";

export interface MenuItem {
  title: string;
  link: string;
  description: string;
  icon: React.ReactNode; // Using React.ReactNode for icons
  componentPath: string; // Path to the component under /app/UI/components
  roles: UserRole[];
}

export interface MenuGroup {
  heading: string;
  icon?: React.ReactNode;
  items: MenuItem[];
}

export interface MegaMenuProps {
  menuData: MenuGroup[];
  userRole: UserRole;
  align?: "left" | "right" | "center";
}
