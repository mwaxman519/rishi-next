import { NavItem, NAV_ITEM_TYPES } from "@/shared/navigation-constants";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  CheckSquare,
  MapPin,
  FileText,
  Settings,
  BarChart,
  Briefcase,
  CreditCard,
} from "lucide-react";

/**
 * Desktop navigation items for Client Users
 */
export const CLIENT_USER_NAV: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Schedule",
    path: "/schedule",
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Events",
    path: "/events",
    icon: <Clock size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Requests",
    path: "/requests",
    icon: <CheckSquare size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Products",
    path: "/products",
    icon: <Briefcase size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Locations",
    path: "/locations",
    icon: <MapPin size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Billing",
    path: "/billing",
    icon: <CreditCard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: <BarChart size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Documentation",
    path: "/docs",
    icon: <FileText size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
  {
    label: "Settings",
    path: "/profile/settings",
    icon: <Settings size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
];

/**
 * Secondary navigation items for Client Users (top bar items)
 */
export const CLIENT_USER_SECONDARY_NAV: NavItem[] = [
  {
    label: "Documentation",
    path: "/docs",
    icon: <FileText size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
  {
    label: "Profile Settings",
    path: "/profile/settings",
    icon: <Settings size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
];
