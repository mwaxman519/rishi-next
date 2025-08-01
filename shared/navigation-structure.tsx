/**
 * Unified Navigation Structure accessor
 * This file provides a centralized way to access navigation structures
 */
import React from "react";
import { NavItem, NAV_ITEM_TYPES } from "./navigation-constants";
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
  Home,
  User,
  Layers,
  GraduationCap,
  ClipboardList,
  BookOpenCheck,
  Receipt,
  DollarSign,
  TrendingUp,
  Archive,
} from "lucide-react";

// Create and export the navigation arrays so they can be imported by other modules
export const superAdminNavigation: NavItem[] = [];
export const internalAdminNavigation: NavItem[] = [];
export const fieldManagerNavigation: NavItem[] = [];
export const brandAgentNavigation: NavItem[] = [];
export const clientUserNavigation: NavItem[] = [];

/**
 * Function to get navigation structure based on user role
 */
export function getNavigationForRole(role: string): NavItem[] {
  switch (role) {
    case "super_admin":
      return superAdminNavigation;
    case "internal_admin":
      return internalAdminNavigation;
    case "internal_field_manager":
      return fieldManagerNavigation;
    case "brand_agent":
      return brandAgentNavigation;
    case "client_user":
    case "client_manager":
      return clientUserNavigation;
    default:
      return fieldManagerNavigation; // Default to field manager view
  }
}

/**
 * Function to get Platform Administration navigation section
 */
export function getPlatformAdminNav(): NavItem[] {
  return superAdminNavigation.filter(
    (item) => item.label === "Platform Administration",
  );
}

// ===============================================
// Super Admin Navigation Structure
// ===============================================
superAdminNavigation.push(
  // Dashboard Section
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },

  // Booking Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Booking Management",
    icon: <BookOpenCheck className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "All Bookings",
        href: "/bookings",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Calendar View",
        href: "/bookings/calendar",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "By Region",
        href: "/bookings/regions",
        icon: <MapPin className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Staff Assignments",
        href: "/bookings/assignments",
        icon: <Users className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Reports",
        href: "/bookings/reports",
        icon: <BarChart className="h-5 w-5" />,
      },
    ],
  },

  // Staff Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Staff Management",
    icon: <Users className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Managers",
        href: "/staff/managers",
        icon: <UserCog className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Brand Agents",
        href: "/staff/agents",
        icon: <BadgeCheck className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Schedule",
        href: "/staff/schedule",
        icon: <Calendar className="h-5 w-5" />,
      },
    ],
  },

  // Location Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Location Management",
    icon: <MapPin className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Locations Map",
        href: "/locations",
        icon: <Globe className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Directory",
        href: "/locations/directory",
        icon: <Building className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Admin",
        href: "/admin/locations",
        icon: <Cog className="h-5 w-5" />,
      },
    ],
  },

  // Client Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Client Management",
    icon: <Briefcase className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Organizations",
        href: "/admin/organizations",
        icon: <Network className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Contacts",
        href: "/contacts",
        icon: <Users className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Analytics",
        href: "/analytics",
        icon: <LineChart className="h-5 w-5" />,
      },
    ],
  },

  // Inventory Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Inventory",
    icon: <Package className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Kit Templates",
        href: "/inventory/templates",
        icon: <Layers className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Kit Instances",
        href: "/inventory/kit-instances",
        icon: <Package className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Stock Management",
        href: "/inventory/stock",
        icon: <HardDrive className="h-5 w-5" />,
      },
    ],
  },

  // Analytics Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Analytics",
    icon: <PieChart className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Overview",
        href: "/analytics",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Reports",
        href: "/reports",
        icon: <FileText className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Admin Analytics",
        href: "/admin/analytics",
        icon: <Table className="h-5 w-5" />,
      },
    ],
  },

  // Learning Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Learning",
    icon: <GraduationCap className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Training",
        href: "/training",
        icon: <BookOpenCheck className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Certifications",
        href: "/training",
        icon: <CheckSquare className="h-5 w-5" />,
      },
    ],
  },

  // Platform Administration
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Platform Administration",
    icon: <Shield className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Users",
        href: "/admin/users",
        icon: <UsersRound className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Roles",
        href: "/admin/rbac",
        icon: <KeySquare className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Settings",
        href: "/admin/settings",
        icon: <Settings className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "System Status",
        href: "/admin/system-settings",
        icon: <AlertCircle className="h-5 w-5" />,
      },
    ],
  },
);

// ===============================================
// Internal Admin Navigation Structure
// ===============================================
internalAdminNavigation.push(
  // Dashboard
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },

  // Booking Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Booking Management",
    icon: <BookOpenCheck className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Bookings",
        href: "/bookings",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Calendar",
        href: "/bookings/calendar",
        icon: <Calendar className="h-5 w-5" />,
      },
    ],
  },

  // Staff management
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Staff Management",
    icon: <Users className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Field Managers",
        href: "/staff/managers",
        icon: <UserCog className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Brand Agents",
        href: "/staff/agents",
        icon: <BadgeCheck className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Schedule",
        href: "/staff/schedule",
        icon: <Calendar className="h-5 w-5" />,
      },
    ],
  },

  // Locations
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Locations",
    icon: <MapPin className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Map",
        href: "/locations",
        icon: <Globe className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Directory",
        href: "/locations/directory",
        icon: <Building className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Admin",
        href: "/admin/locations",
        icon: <Cog className="h-5 w-5" />,
      },
    ],
  },

  // Client Management
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Clients",
    icon: <Briefcase className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Contacts",
        href: "/clients/contacts",
        icon: <Users className="h-5 w-5" />,
      },
    ],
  },

  // Inventory
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Inventory",
    icon: <Package className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Kit Templates",
        href: "/inventory/templates",
        icon: <Layers className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Kit Instances",
        href: "/inventory/kit-instances",
        icon: <Package className="h-5 w-5" />,
      },
    ],
  },

  // Analytics
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Analytics",
    href: "/analytics",
    icon: <PieChart className="h-5 w-5" />,
  },
);

// ===============================================
// Field Manager Navigation Structure (Territory-Focused Management)
// ===============================================
fieldManagerNavigation.push(
  // Dashboard
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },

  // Team Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Team Management",
    icon: <Users className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "My Brand Agents",
        href: "/brand-agents",
        icon: <Users className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Team Schedule",
        href: "/schedule",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Team Availability",
        href: "/availability",
        icon: <Clock className="h-5 w-5" />,
      },
    ],
  },

  // Territory Operations Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Territory Operations",
    icon: <MapPin className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Territory Bookings",
        href: "/bookings",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Assigned Locations",
        href: "/locations",
        icon: <MapPin className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Territory Tasks",
        href: "/tasks",
        icon: <CheckSquare className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Territory Reports",
        href: "/reports",
        icon: <FileText className="h-5 w-5" />,
      },
    ],
  },

  // Inventory Management
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Inventory",
    icon: <Package className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Kit Templates",
        href: "/inventory/templates",
        icon: <Layers className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Kit Instances",
        href: "/inventory/kit-instances",
        icon: <Package className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Stock Management",
        href: "/inventory/stock",
        icon: <Archive className="h-5 w-5" />,
      },
    ],
  },
);

// ===============================================
// Brand Agent Navigation Structure (Limited Access)
// ===============================================
brandAgentNavigation.push(
  // Dashboard
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },

  // My Schedule
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "My Schedule",
    href: "/schedule",
    icon: <Calendar className="h-5 w-5" />,
  },

  // My Availability
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "My Availability",
    href: "/availability",
    icon: <Clock className="h-5 w-5" />,
  },

  // My Bookings
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "My Bookings",
    href: "/bookings",
    icon: <Calendar className="h-5 w-5" />,
  },

  // My Tasks
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "My Tasks",
    href: "/tasks",
    icon: <CheckSquare className="h-5 w-5" />,
  },

  // Event Data Entry
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Event Data",
    href: "/event-data",
    icon: <FileText className="h-5 w-5" />,
  },

  // Training Materials
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Training",
    href: "/training",
    icon: <GraduationCap className="h-5 w-5" />,
  },
);

// ===============================================
// Client User Navigation Structure (Full Organizational Access)
// ===============================================
clientUserNavigation.push(
  // Dashboard
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },

  // Booking Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Booking Management",
    icon: <Calendar className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Bookings",
        href: "/bookings",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Calendar",
        href: "/bookings/calendar",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Schedule",
        href: "/schedule",
        icon: <Clock className="h-5 w-5" />,
      },
    ],
  },

  // Location Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Location Management",
    icon: <MapPin className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Locations Map",
        href: "/locations",
        icon: <Globe className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Directory",
        href: "/locations/directory",
        icon: <Building className="h-5 w-5" />,
      },
    ],
  },

  // Staff Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Staff Management",
    icon: <Users className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Staff Directory",
        href: "/staff",
        icon: <Users className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Availability",
        href: "/availability",
        icon: <Clock className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Performance",
        href: "/staff/performance",
        icon: <TrendingUp className="h-5 w-5" />,
      },
    ],
  },

  // Inventory Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Inventory",
    icon: <Package className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Kit Templates",
        href: "/inventory/templates",
        icon: <Layers className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Kit Instances",
        href: "/inventory/kit-instances",
        icon: <Package className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Stock Management",
        href: "/inventory/stock",
        icon: <Archive className="h-5 w-5" />,
      },
    ],
  },

  // Analytics & Reports Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Analytics & Reports",
    icon: <PieChart className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Overview",
        href: "/analytics",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Reports",
        href: "/reports",
        icon: <FileText className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Performance Metrics",
        href: "/analytics/performance",
        icon: <TrendingUp className="h-5 w-5" />,
      },
    ],
  },

  // Training & Development Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Training & Development",
    icon: <GraduationCap className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Training Materials",
        href: "/training",
        icon: <BookOpenCheck className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Certifications",
        href: "/training/certifications",
        icon: <CheckSquare className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Progress Tracking",
        href: "/training/progress",
        icon: <TrendingUp className="h-5 w-5" />,
      },
    ],
  },

  // Organization Settings
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Organization Settings",
    icon: <Cog className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Organization Profile",
        href: "/organization/profile",
        icon: <Building className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "User Management",
        href: "/organization/users",
        icon: <Users className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Preferences",
        href: "/organization/preferences",
        icon: <Settings className="h-5 w-5" />,
      },
    ],
  },
);
