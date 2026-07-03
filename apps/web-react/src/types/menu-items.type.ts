import {SystemAction, SystemFeatures} from ".";

export type SideMenuItem = {
  url?: string;
  key: string;
  icon?: React.ReactNode;
  children: Array<SideMenuItem>;
  text: string | React.ReactNode;
  module?: SystemFeatures | null;
  action?: Array<SystemAction> | null;
  isVisible?: (userInfo?: unknown) => boolean; // Function to check if menu item should be visible
};
