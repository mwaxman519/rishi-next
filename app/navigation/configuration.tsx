/**
 * Navigation Configuration
 * This file defines the navigation structure for different user roles
 *
 * WARNING: This file is kept for reference only. All exports have been disabled.
 * The actual navigation is now defined in shared/navigation-structure.tsx
 *
 * IMPORTANT: All exports in this file are commented out and replaced with
 * local variables prefixed with underscore (_) to avoid duplicates.
 */
import React from "react";
import { NavItem, NAV_ITEM_TYPES } from "@shared/navigation-constants";
import {
  superAdminNavigation,
  internalAdminNavigation,
  fieldManagerNavigation,
  brandAgentNavigation,
  clientUserNavigation,
} from "@shared/navigation-structure";
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
} from "lucide-react";

// Super Admin Navigation - export disabled to avoid conflicts with shared/navigation-structure.tsx
// export const superAdminNavigation: NavItem[] = [
const _superAdminNavigation: NavItem[] = [
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
        label: "Bookings",
        href: "/bookings",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Calendar",
        href: "/calendar",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Events",
        href: "/events",
        icon: <Clock className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Reports",
        href: "/reports",
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
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Onboarding",
        href: "/staff/onboarding",
        icon: <UserPlus className="h-5 w-5" />,
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
        href: "/clients/organizations",
        icon: <Network className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Contacts",
        href: "/clients/contacts",
        icon: <Users className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Analytics",
        href: "/clients/analytics",
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
        href: "/inventory/kits",
        icon: <Layers className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Items",
        href: "/inventory/items",
        icon: <Package className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Stock",
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
        label: "Dashboard",
        href: "/analytics",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Reports",
        href: "/analytics/reports",
        icon: <FileText className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Raw Data",
        href: "/analytics/data",
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
        label: "Courses",
        href: "/learning/courses",
        icon: <BookOpenCheck className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Certifications",
        href: "/learning/certifications",
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
        href: "/admin/roles",
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
        label: "Integrations",
        href: "/admin/integrations",
        icon: <Server className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "System Status",
        href: "/admin/status",
        icon: <AlertCircle className="h-5 w-5" />,
      },
    ],
  },
];

// Internal Admin Navigation - export disabled to avoid conflicts
// export const internalAdminNavigation: NavItem[] = [
const _internalAdminNavigation: NavItem[] = [
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
        href: "/calendar",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Events",
        href: "/events",
        icon: <Clock className="h-5 w-5" />,
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
        label: "Organizations",
        href: "/clients/organizations",
        icon: <Network className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Contacts",
        href: "/clients/contacts",
        icon: <Users className="h-5 w-5" />,
      },
    ],
  },
];

// Field Manager Navigation - export disabled to avoid conflicts
// export const fieldManagerNavigation: NavItem[] = [
const _fieldManagerNavigation: NavItem[] = [
  // Dashboard
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },

  // Events
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Events",
    icon: <Calendar className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Calendar",
        href: "/calendar",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Bookings",
        href: "/bookings",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Event Management",
        href: "/events",
        icon: <Clock className="h-5 w-5" />,
      },
    ],
  },

  // Staff
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: "Brand Agents",
    icon: <Users className="h-5 w-5" />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Team",
        href: "/staff/agents",
        icon: <BadgeCheck className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Schedule",
        href: "/staff/schedule",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Performance",
        href: "/staff/performance",
        icon: <BarChart className="h-5 w-5" />,
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
    ],
  },
];

// Brand Agent Navigation - export disabled to avoid conflicts
// export const brandAgentNavigation: NavItem[] = [
const _brandAgentNavigation: NavItem[] = [
  // Dashboard
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },

  // Schedule
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "My Schedule",
    href: "/schedule",
    icon: <Calendar className="h-5 w-5" />,
  },

  // Events
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Events",
    href: "/events",
    icon: <Clock className="h-5 w-5" />,
  },

  // Locations
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Locations",
    href: "/locations",
    icon: <MapPin className="h-5 w-5" />,
  },

  // Tasks
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Tasks",
    href: "/tasks",
    icon: <CheckSquare className="h-5 w-5" />,
  },
];

// Client User Navigation - export disabled to avoid conflicts
// export const clientUserNavigation: NavItem[] = [
const _clientUserNavigation: NavItem[] = [
  // Dashboard
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },

  // Bookings
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
        label: "Create Booking",
        href: "/bookings/new",
        icon: <FileText className="h-5 w-5" />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: "Calendar",
        href: "/calendar",
        icon: <Calendar className="h-5 w-5" />,
      },
    ],
  },

  // Events
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Events",
    href: "/events",
    icon: <Clock className="h-5 w-5" />,
  },

  // Locations
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Locations",
    href: "/locations",
    icon: <MapPin className="h-5 w-5" />,
  },

  // Analytics
  {
    type: NAV_ITEM_TYPES.LINK,
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart className="h-5 w-5" />,
  },
];
