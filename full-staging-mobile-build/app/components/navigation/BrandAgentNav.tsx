import { NavItem, NAV_ITEM_TYPES } from "@shared/navigation-constants";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Clock,
  CheckSquare,
  MapPin,
  FileText,
  Settings,
  ChevronRight,
  MessageSquare,
  User,
} from "lucide-react";

/**
 * Desktop navigation items for Brand Agents
 */
export const BRAND_AGENT_NAV: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "My Availability",
    path: "/availability",
    icon: <Clock size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Events",
    path: "/events",
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Requests",
    path: "/requests",
    icon: <CheckSquare size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Locations",
    path: "/locations",
    icon: <MapPin size={20} />,
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
 * Mobile navigation items for Brand Agents
 */
export const BRAND_AGENT_MOBILE_NAV: NavItem[] = [
  {
    label: "Home",
    path: "/",
    icon: <Home size={20} />,
    type: NAV_ITEM_TYPES.MOBILE,
  },
  {
    label: "Events",
    path: "/events",
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.MOBILE,
  },
  {
    label: "Availability",
    path: "/availability",
    icon: <Clock size={20} />,
    type: NAV_ITEM_TYPES.MOBILE,
  },
  {
    label: "Requests",
    path: "/requests",
    icon: <CheckSquare size={20} />,
    type: NAV_ITEM_TYPES.MOBILE,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: <User size={20} />,
    type: NAV_ITEM_TYPES.MOBILE,
  },
];

/**
 * Secondary navigation items for Brand Agents (top bar items)
 */
export const BRAND_AGENT_SECONDARY_NAV: NavItem[] = [
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
