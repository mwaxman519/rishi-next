import { NavItem, NAV_ITEM_TYPES } from "@/shared/navigation-constants";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  CheckSquare,
  MapPin,
  FileText,
  Settings,
  Users,
  BarChart,
} from "lucide-react";

/**
 * Desktop navigation items for Field Managers
 */
export const FIELD_MANAGER_NAV: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Team Schedule",
    path: "/team-schedule",
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "My Availability",
    path: "/availability",
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
    label: "Agents",
    path: "/agents",
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Locations",
    path: "/locations",
    icon: <MapPin size={20} />,
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
