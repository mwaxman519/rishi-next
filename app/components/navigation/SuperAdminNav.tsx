import { NavItem, NAV_ITEM_TYPES } from "@shared/navigation-constants";

// Super Admin Navigation - Defined explicitly to guarantee consistency
export const SUPER_ADMIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  // "My Availability" has been moved to the Brand Agents section only
  {
    label: "Documentation",
    path: "/docs",
    icon: "FileText",
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: "Rishi Management",
    path: "/client-management",
    icon: "Briefcase",
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Dashboard & Overview",
        path: "/client-management",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Staff Management",
        path: "/client-management/staff",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Client Management",
        path: "/client-management/accounts",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Kit Management",
        path: "/client-management/kits",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Location Management",
        path: "/client-management/locations",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Bookings Management",
        path: "/bookings",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "User Management",
        path: "/client-management/users",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Billing",
        path: "/client-management/billing",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Client Users",
    path: "/clients",
    icon: "Building2",
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Dashboard & Overview",
        path: "/clients",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Staff Visibility",
        path: "/staff",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Client Profile",
        path: "/profile",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      { label: "Kit Management", path: "/kits", type: NAV_ITEM_TYPES.PRIMARY },
      {
        label: "Event Management",
        path: "/events",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Location Management",
        path: "/locations",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      { label: "Resources", path: "/resources", type: NAV_ITEM_TYPES.PRIMARY },
    ],
  },
  {
    label: "Brand Agents",
    path: "/agent-dashboard",
    icon: "UserCheck",
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Personal Dashboard",
        path: "/agent-dashboard",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "My Availability",
        path: "/availability",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Profile Management",
        path: "/profile",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      { label: "Events", path: "/events", type: NAV_ITEM_TYPES.PRIMARY },
      { label: "Requests", path: "/requests", type: NAV_ITEM_TYPES.PRIMARY },
      {
        label: "Team Calendar",
        path: "/team-calendar",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      { label: "Resources", path: "/resources", type: NAV_ITEM_TYPES.PRIMARY },
    ],
  },
  // Platform Administration Section
  {
    label: "Organizations",
    path: "/admin/organizations",
    icon: "Building2",
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Organization List",
        path: "/admin/organizations",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Organization Settings",
        path: "/admin/organizations/settings",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Cross-Org Analytics",
        path: "/admin/organizations/analytics",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Users & Access",
    path: "/admin/users",
    icon: "Users",
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "User Management",
        path: "/admin/users",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Access Control",
        path: "/admin/access-control",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "User Analytics",
        path: "/admin/users/analytics",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Operations",
    path: "/admin/operations",
    icon: "Briefcase",
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Events Management",
        path: "/admin/events",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Location Approval",
        path: "/admin/locations/approval-queue",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Bookings Management",
        path: "/bookings",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Create Booking",
        path: "/bookings/new",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Staff Management",
        path: "/admin/staff",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "System",
    path: "/admin/system",
    icon: "Settings",
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Platform Settings",
        path: "/admin/system/settings",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Feature Management",
        path: "/admin/features",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Database Tools",
        path: "/admin/system/database",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "API Management",
        path: "/admin/system/api",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Monitoring",
    path: "/admin/monitoring",
    icon: "Activity",
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "System Status",
        path: "/admin/system-status",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Security Monitoring",
        path: "/admin/security",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Performance Analytics",
        path: "/admin/monitoring/performance",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Audit Logs",
        path: "/admin/monitoring/audit",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: "Tools",
    path: "/admin/tools",
    icon: "Wrench",
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: "Test Data",
        path: "/admin/test-data",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Debug Console",
        path: "/admin/tools/debug",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Infrastructure Demo",
        path: "/infrastructure",
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
];

export const SUPER_ADMIN_SECONDARY_NAV: NavItem[] = [
  {
    label: "User Menu",
    path: "#",
    type: NAV_ITEM_TYPES.SECONDARY,
    children: [
      { label: "Profile", path: "/profile", type: NAV_ITEM_TYPES.SECONDARY },
      {
        label: "Preferences",
        path: "/profile/preferences",
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      { label: "Help", path: "/help", type: NAV_ITEM_TYPES.SECONDARY },
      {
        label: "Logout",
        path: "/api/auth/logout",
        type: NAV_ITEM_TYPES.SECONDARY,
      },
    ],
  },
  {
    label: "Quick Actions",
    path: "#",
    type: NAV_ITEM_TYPES.SECONDARY,
    children: [
      {
        label: "Notifications",
        path: "/notifications",
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      { label: "Messages", path: "/messages", type: NAV_ITEM_TYPES.SECONDARY },
      { label: "Search", path: "/search", type: NAV_ITEM_TYPES.SECONDARY },
      {
        label: "Global Settings",
        path: "/super-admin/settings",
        type: NAV_ITEM_TYPES.SECONDARY,
      },
    ],
  },
  {
    label: "Mode Switcher",
    path: "#",
    type: NAV_ITEM_TYPES.SECONDARY,
    children: [
      {
        label: "View as Rishi Management",
        path: "/switch-view/rishi",
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      {
        label: "View as Client User",
        path: "/switch-view/client",
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      {
        label: "View as Brand Agent",
        path: "/switch-view/agent",
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      {
        label: "Super Admin View",
        path: "/switch-view/super",
        type: NAV_ITEM_TYPES.SECONDARY,
      },
    ],
  },
];
