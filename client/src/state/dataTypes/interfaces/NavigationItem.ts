import { MenuItem } from "./MenuItem";

// Define the interface for each menu group/section
export interface NavigationItem {
  heading: string;
  icon?: React.ReactNode;
  items: MenuItem[];
}
