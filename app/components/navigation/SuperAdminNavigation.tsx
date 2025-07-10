"use client";

import { NavItem, NAV_ITEM_TYPES } from "@/shared/navigation-constants";
import {
  Settings,
  Shield,
  Database,
  Building,
  Users,
  MapPin,
  Calendar,
  LayoutDashboard,
  BarChart,
  Server,
  Cog,
  Lock,
  AlertCircle,
  Command,
  Network,
  LineChart,
  FileText,
  HardDrive,
  UserCog,
  Clock,
  UsersRound,
} from "lucide-react";

/**
 * Super Admin Navigation Structure
 * Organized following information architecture best practices
 */
export const SUPER_ADMIN_NAVIGATION: NavItem[] = [
  {
    id: "organizations",
    label: "Organizations",
    path: "/admin/organizations",
    href: "/admin/organizations",
    icon: <Building size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: "org-list",
        label: "Organization List",
        path: "/admin/organizations",
        href: "/admin/organizations",
        icon: <Building size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "org-settings",
        label: "Organization Settings",
        path: "/admin/organizations/settings",
        href: "/admin/organizations/settings",
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "org-analytics",
        label: "Analytics",
        path: "/admin/organizations/analytics",
        href: "/admin/organizations/analytics",
        icon: <BarChart size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    id: "users-access",
    label: "Users & Access",
    path: "/admin/users",
    href: "/admin/users",
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: "users",
        label: "Users",
        path: "/admin/users",
        href: "/admin/users",
        icon: <Users size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "roles",
        label: "Roles",
        path: "/admin/roles",
        href: "/admin/roles",
        icon: <UserCog size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "access-control",
        label: "Access Control",
        path: "/admin/rbac",
        href: "/admin/rbac",
        icon: <Lock size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "org-permissions",
        label: "Organization Permissions",
        path: "/admin/organization-permissions",
        href: "/admin/organization-permissions",
        icon: <Shield size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    path: "/admin/operations",
    href: "/admin/operations",
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: "events",
        label: "Events",
        path: "/admin/events",
        href: "/admin/events",
        icon: <Calendar size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "locations",
        label: "Locations",
        path: "/admin/locations",
        href: "/admin/locations",
        icon: <MapPin size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "bookings",
        label: "Bookings",
        path: "/admin/bookings",
        href: "/admin/bookings",
        icon: <Clock size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "staff",
        label: "Staff",
        path: "/admin/staff",
        href: "/admin/staff",
        icon: <UsersRound size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    id: "system",
    label: "System",
    path: "/admin/system",
    href: "/admin/system",
    icon: <Server size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: "platform-settings",
        label: "Platform Settings",
        path: "/admin/settings",
        href: "/admin/settings",
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "features",
        label: "Features",
        path: "/admin/features",
        href: "/admin/features",
        icon: <Command size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "database",
        label: "Database",
        path: "/admin/database",
        href: "/admin/database",
        icon: <Database size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "api",
        label: "API",
        path: "/admin/api",
        href: "/admin/api",
        icon: <Network size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    id: "monitoring",
    label: "Monitoring",
    path: "/admin/monitoring",
    href: "/admin/monitoring",
    icon: <BarChart size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: "system-status",
        label: "System Status",
        path: "/admin/system-status",
        href: "/admin/system-status",
        icon: <AlertCircle size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "security",
        label: "Security",
        path: "/admin/security",
        href: "/admin/security",
        icon: <Shield size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "performance",
        label: "Performance",
        path: "/admin/performance",
        href: "/admin/performance",
        icon: <LineChart size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "audit",
        label: "Audit",
        path: "/admin/audit",
        href: "/admin/audit",
        icon: <FileText size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    path: "/admin/tools",
    href: "/admin/tools",
    icon: <Cog size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: "test-data",
        label: "Test Data",
        path: "/admin/test-data",
        href: "/admin/test-data",
        icon: <Database size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "debug-console",
        label: "Debug Console",
        path: "/admin/debug",
        href: "/admin/debug",
        icon: <Command size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: "infrastructure",
        label: "Infrastructure",
        path: "/admin/infrastructure",
        href: "/admin/infrastructure",
        icon: <HardDrive size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
];

/**
 * Function to check if a navigation item is active
 * Uses precise matching to prevent multiple highlights
 */
export function isNavItemActive(pathname: string, itemPath: string): boolean {
  // Exact match
  if (pathname === itemPath) return true;

  // For non-root paths, only match if pathname starts with itemPath followed by '/'
  // This prevents '/admin/users' from highlighting when on '/admin/user-settings'
  if (itemPath !== "/" && pathname.startsWith(itemPath + "/")) {
    return true;
  }

  return false;
}

/**
 * Get Super Admin navigation structure
 */
export function getSuperAdminNavigation(): NavItem[] {
  return SUPER_ADMIN_NAVIGATION;
}
