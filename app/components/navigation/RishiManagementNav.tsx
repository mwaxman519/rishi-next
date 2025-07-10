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
  CreditCard,
  Building,
  Database,
  Shield,
  CalendarPlus,
  CalendarClock,
} from "lucide-react";

/**
 * Desktop navigation items for Rishi Management (Internal Admins)
 */
export const RISHI_MANAGEMENT_NAV: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Organizations",
    path: "/admin/organizations",
    icon: <Building size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Organization Directory",
        path: "/admin/organizations",
        icon: <Building size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Organization Settings",
        path: "/admin/organizations/settings",
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "User Directory",
        path: "/admin/users",
        icon: <Users size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Create User",
        path: "/admin/users/create",
        icon: <Users size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Schedule",
    path: "/team-schedule",
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Bookings",
    path: "/bookings",
    icon: <CalendarClock size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "All Bookings",
        path: "/bookings",
        icon: <Calendar size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Create Booking",
        path: "/bookings/new",
        icon: <CalendarPlus size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Approval Queue",
        path: "/bookings/approval-queue",
        icon: <CheckSquare size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Locations",
    path: "/admin/locations",
    icon: <MapPin size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Location Management",
        path: "/admin/locations",
        icon: <MapPin size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Approval Queue",
        path: "/admin/locations/approval-queue",
        icon: <CheckSquare size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: <BarChart size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Billing",
    path: "/admin/billing",
    icon: <CreditCard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Documentation",
    path: "/docs",
    icon: <FileText size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
  {
    label: "System",
    path: "/admin/system",
    icon: <Database size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
    children: [
      {
        label: "Settings",
        path: "/admin/system/settings",
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      {
        label: "RBAC",
        path: "/admin/system/rbac",
        icon: <Shield size={20} />,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
    ],
  },
];

/**
 * Secondary navigation items for Rishi Management (top bar items)
 */
export const RISHI_MANAGEMENT_SECONDARY_NAV: NavItem[] = [
  {
    label: "Documentation",
    path: "/docs",
    icon: <FileText size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
  {
    label: "System Settings",
    path: "/admin/system/settings",
    icon: <Settings size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
];
