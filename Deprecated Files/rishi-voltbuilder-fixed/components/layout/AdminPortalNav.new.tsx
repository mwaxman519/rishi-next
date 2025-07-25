"use client";

import { NavItem, NAV_ITEM_TYPES } from "@shared/navigation-constants";
import { USER_ROLES } from "@shared/rbac-roles";
import {
  Settings,
  Shield,
  Database,
  Building,
  Users,
  Package,
  MapPin,
  CreditCard,
  LayoutDashboard,
  Calendar,
  Clock,
  BarChart,
  CheckSquare,
  Briefcase,
  FileText,
  Server,
  Cog,
  KeySquare,
  Globe,
  AlertCircle,
  Command,
  Lock,
  Bell,
  HardDrive,
  UsersRound,
  UserCog,
  BadgeCheck,
  UserPlus,
  Network,
  LineChart,
  PieChart,
  Table,
} from "lucide-react";

/**
 * IMPORTANT: We've removed the separate PLATFORM_ADMIN_NAV array and consolidated
 * all system administration features into the SUPER_ADMIN_NAV structure below.
 * This prevents duplication in the navigation menu.
 */

/**
 * Navigation items for Super Admin role - Admin Portal
 */
export const SUPER_ADMIN_NAV: NavItem[] = [
  {
    label: "Platform Administration",
    path: "/admin/platform",
    icon: <Server size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Access Control",
        path: "/admin/rbac",
        icon: <Lock size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Feature Management",
        path: "/admin/features",
        icon: <Command size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "System Settings",
        path: "/admin/settings",
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Organization Permissions",
        path: "/admin/organization-permissions",
        icon: <Shield size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Organization Management",
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
      {
        label: "Branding",
        path: "/admin/organizations/branding",
        icon: <Globe size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "User Management",
    path: "/admin/users",
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "User Directory",
        path: "/admin/users",
        icon: <UsersRound size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Add New User",
        path: "/admin/users/create",
        icon: <UserPlus size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Role Assignments",
        path: "/admin/users/permissions",
        icon: <Lock size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Testing",
    path: "/admin/test-data",
    icon: <Database size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Test Data",
        path: "/admin/test-data",
        icon: <Database size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Test Organizations",
        path: "/admin/test-organizations",
        icon: <Building size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Test Users",
        path: "/admin/test-users",
        icon: <Users size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Location Management",
    path: "/admin/locations",
    icon: <MapPin size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Location Directory",
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
      {
        label: "Location Analytics",
        path: "/admin/locations/analytics",
        icon: <BarChart size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
];

/**
 * Navigation items for Internal Admin role
 */
export const INTERNAL_ADMIN_NAV: NavItem[] = [
  {
    label: "Organization Management",
    path: "/admin/organizations",
    icon: <Building size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Client Directory",
        path: "/admin/organizations",
        icon: <Building size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Client Settings",
        path: "/admin/organizations/settings",
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Staff Management",
    path: "/admin/users",
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Staff Directory",
        path: "/admin/users",
        icon: <UsersRound size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Add New Staff",
        path: "/admin/users/create",
        icon: <UserPlus size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Location Management",
    path: "/admin/locations",
    icon: <MapPin size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Location Directory",
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
];

/**
 * Navigation items for Field Manager role
 */
export const FIELD_MANAGER_NAV: NavItem[] = [
  {
    label: "Field Operations",
    path: "/admin/field-operations",
    icon: <Briefcase size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Team Dashboard",
        path: "/admin/field-operations/dashboard",
        icon: <LayoutDashboard size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Assignment Calendar",
        path: "/admin/field-operations/calendar",
        icon: <Calendar size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Location Management",
    path: "/admin/locations",
    icon: <MapPin size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Location Directory",
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
    label: "Team Management",
    path: "/admin/users",
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Agent Directory",
        path: "/admin/users",
        icon: <UsersRound size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Performance Reports",
        path: "/admin/users/performance",
        icon: <BarChart size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
];

/**
 * Function to get role-specific admin navigation
 */
export function getAdminNavForRole(role: string): NavItem[] {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return SUPER_ADMIN_NAV;
    case USER_ROLES.INTERNAL_ADMIN:
      return INTERNAL_ADMIN_NAV;
    case USER_ROLES.INTERNAL_FIELD_MANAGER:
      return FIELD_MANAGER_NAV;
    default:
      return [];
  }
}

/**
 * Function to get Platform Administration navigation
 * This returns the Platform Administration section of SUPER_ADMIN_NAV to avoid duplication
 */
export function getPlatformAdminNav(): NavItem[] {
  // Return just the Platform Administration section from the SUPER_ADMIN_NAV to avoid duplication
  return SUPER_ADMIN_NAV.filter(
    (item) => item.label === "Platform Administration",
  );
}
