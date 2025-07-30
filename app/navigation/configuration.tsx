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
import React from &quot;react&quot;;
import { NavItem, NAV_ITEM_TYPES } from &quot;@shared/navigation-constants&quot;;
import {
  superAdminNavigation,
  internalAdminNavigation,
  fieldManagerNavigation,
  brandAgentNavigation,
  clientUserNavigation,
} from &quot;@shared/navigation-structure&quot;;
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
} from &quot;lucide-react&quot;;

// Super Admin Navigation - export disabled to avoid conflicts with shared/navigation-structure.tsx
// export const superAdminNavigation: NavItem[] = [
const _superAdminNavigation: NavItem[] = [
  // Dashboard Section
  {
    type: NAV_ITEM_TYPES.LINK,
    label: &quot;Dashboard&quot;,
    href: &quot;/&quot;,
    icon: <LayoutDashboard className=&quot;h-5 w-5&quot; />,
  },

  // Booking Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Booking Management&quot;,
    icon: <BookOpenCheck className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Bookings&quot;,
        href: &quot;/bookings&quot;,
        icon: <ClipboardList className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Calendar&quot;,
        href: &quot;/calendar&quot;,
        icon: <Calendar className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Events&quot;,
        href: &quot;/events&quot;,
        icon: <Clock className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Reports&quot;,
        href: &quot;/reports&quot;,
        icon: <BarChart className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Staff Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Staff Management&quot;,
    icon: <Users className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Managers&quot;,
        href: &quot;/staff/managers&quot;,
        icon: <UserCog className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Brand Agents&quot;,
        href: &quot;/staff/agents&quot;,
        icon: <BadgeCheck className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Schedule&quot;,
        href: &quot;/staff/schedule&quot;,
        icon: <Calendar className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Onboarding&quot;,
        href: &quot;/staff/onboarding&quot;,
        icon: <UserPlus className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Location Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Location Management&quot;,
    icon: <MapPin className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Locations Map&quot;,
        href: &quot;/locations&quot;,
        icon: <Globe className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Directory&quot;,
        href: &quot;/locations/directory&quot;,
        icon: <Building className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Admin&quot;,
        href: &quot;/admin/locations&quot;,
        icon: <Cog className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Client Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Client Management&quot;,
    icon: <Briefcase className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Organizations&quot;,
        href: &quot;/clients/organizations&quot;,
        icon: <Network className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Contacts&quot;,
        href: &quot;/clients/contacts&quot;,
        icon: <Users className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Analytics&quot;,
        href: &quot;/clients/analytics&quot;,
        icon: <LineChart className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Inventory Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Inventory&quot;,
    icon: <Package className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Kit Templates&quot;,
        href: &quot;/inventory/kits&quot;,
        icon: <Layers className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Items&quot;,
        href: &quot;/inventory/items&quot;,
        icon: <Package className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Stock&quot;,
        href: &quot;/inventory/stock&quot;,
        icon: <HardDrive className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Analytics Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Analytics&quot;,
    icon: <PieChart className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Dashboard&quot;,
        href: &quot;/analytics&quot;,
        icon: <LayoutDashboard className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Reports&quot;,
        href: &quot;/analytics/reports&quot;,
        icon: <FileText className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Raw Data&quot;,
        href: &quot;/analytics/data&quot;,
        icon: <Table className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Learning Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Learning&quot;,
    icon: <GraduationCap className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Courses&quot;,
        href: &quot;/learning/courses&quot;,
        icon: <BookOpenCheck className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Certifications&quot;,
        href: &quot;/learning/certifications&quot;,
        icon: <CheckSquare className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Platform Administration
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Platform Administration&quot;,
    icon: <Shield className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Users&quot;,
        href: &quot;/admin/users&quot;,
        icon: <UsersRound className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Roles&quot;,
        href: &quot;/admin/roles&quot;,
        icon: <KeySquare className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Settings&quot;,
        href: &quot;/admin/settings&quot;,
        icon: <Settings className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Integrations&quot;,
        href: &quot;/admin/integrations&quot;,
        icon: <Server className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;System Status&quot;,
        href: &quot;/admin/status&quot;,
        icon: <AlertCircle className=&quot;h-5 w-5&quot; />,
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
    label: &quot;Dashboard&quot;,
    href: &quot;/&quot;,
    icon: <LayoutDashboard className=&quot;h-5 w-5&quot; />,
  },

  // Booking Management Section
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Booking Management&quot;,
    icon: <BookOpenCheck className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Bookings&quot;,
        href: &quot;/bookings&quot;,
        icon: <ClipboardList className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Calendar&quot;,
        href: &quot;/calendar&quot;,
        icon: <Calendar className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Events&quot;,
        href: &quot;/events&quot;,
        icon: <Clock className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Staff management
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Staff Management&quot;,
    icon: <Users className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Field Managers&quot;,
        href: &quot;/staff/managers&quot;,
        icon: <UserCog className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Brand Agents&quot;,
        href: &quot;/staff/agents&quot;,
        icon: <BadgeCheck className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Schedule&quot;,
        href: &quot;/staff/schedule&quot;,
        icon: <Calendar className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Locations
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Locations&quot;,
    icon: <MapPin className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Map&quot;,
        href: &quot;/locations&quot;,
        icon: <Globe className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Directory&quot;,
        href: &quot;/locations/directory&quot;,
        icon: <Building className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Admin&quot;,
        href: &quot;/admin/locations&quot;,
        icon: <Cog className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Client Management
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Clients&quot;,
    icon: <Briefcase className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Organizations&quot;,
        href: &quot;/clients/organizations&quot;,
        icon: <Network className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Contacts&quot;,
        href: &quot;/clients/contacts&quot;,
        icon: <Users className=&quot;h-5 w-5&quot; />,
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
    label: &quot;Dashboard&quot;,
    href: &quot;/&quot;,
    icon: <LayoutDashboard className=&quot;h-5 w-5&quot; />,
  },

  // Events
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Events&quot;,
    icon: <Calendar className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Calendar&quot;,
        href: &quot;/calendar&quot;,
        icon: <Calendar className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Bookings&quot;,
        href: &quot;/bookings&quot;,
        icon: <ClipboardList className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Event Management&quot;,
        href: &quot;/events&quot;,
        icon: <Clock className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Staff
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Brand Agents&quot;,
    icon: <Users className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Team&quot;,
        href: &quot;/staff/agents&quot;,
        icon: <BadgeCheck className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Schedule&quot;,
        href: &quot;/staff/schedule&quot;,
        icon: <Calendar className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Performance&quot;,
        href: &quot;/staff/performance&quot;,
        icon: <BarChart className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Locations
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Locations&quot;,
    icon: <MapPin className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Map&quot;,
        href: &quot;/locations&quot;,
        icon: <Globe className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Directory&quot;,
        href: &quot;/locations/directory&quot;,
        icon: <Building className=&quot;h-5 w-5&quot; />,
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
    label: &quot;Dashboard&quot;,
    href: &quot;/&quot;,
    icon: <LayoutDashboard className=&quot;h-5 w-5&quot; />,
  },

  // Schedule
  {
    type: NAV_ITEM_TYPES.LINK,
    label: &quot;My Schedule&quot;,
    href: &quot;/schedule&quot;,
    icon: <Calendar className=&quot;h-5 w-5&quot; />,
  },

  // Events
  {
    type: NAV_ITEM_TYPES.LINK,
    label: &quot;Events&quot;,
    href: &quot;/events&quot;,
    icon: <Clock className=&quot;h-5 w-5&quot; />,
  },

  // Locations
  {
    type: NAV_ITEM_TYPES.LINK,
    label: &quot;Locations&quot;,
    href: &quot;/locations&quot;,
    icon: <MapPin className=&quot;h-5 w-5&quot; />,
  },

  // Tasks
  {
    type: NAV_ITEM_TYPES.LINK,
    label: &quot;Tasks&quot;,
    href: &quot;/tasks&quot;,
    icon: <CheckSquare className=&quot;h-5 w-5&quot; />,
  },
];

// Client User Navigation - export disabled to avoid conflicts
// export const clientUserNavigation: NavItem[] = [
const _clientUserNavigation: NavItem[] = [
  // Dashboard
  {
    type: NAV_ITEM_TYPES.LINK,
    label: &quot;Dashboard&quot;,
    href: &quot;/&quot;,
    icon: <LayoutDashboard className=&quot;h-5 w-5&quot; />,
  },

  // Bookings
  {
    type: NAV_ITEM_TYPES.SECTION,
    label: &quot;Booking Management&quot;,
    icon: <BookOpenCheck className=&quot;h-5 w-5&quot; />,
    children: [
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;All Bookings&quot;,
        href: &quot;/bookings&quot;,
        icon: <ClipboardList className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Create Booking&quot;,
        href: &quot;/bookings/new&quot;,
        icon: <FileText className=&quot;h-5 w-5&quot; />,
      },
      {
        type: NAV_ITEM_TYPES.LINK,
        label: &quot;Calendar&quot;,
        href: &quot;/calendar&quot;,
        icon: <Calendar className=&quot;h-5 w-5&quot; />,
      },
    ],
  },

  // Events
  {
    type: NAV_ITEM_TYPES.LINK,
    label: &quot;Events&quot;,
    href: &quot;/events&quot;,
    icon: <Clock className=&quot;h-5 w-5&quot; />,
  },

  // Locations
  {
    type: NAV_ITEM_TYPES.LINK,
    label: &quot;Locations&quot;,
    href: &quot;/locations&quot;,
    icon: <MapPin className=&quot;h-5 w-5&quot; />,
  },

  // Analytics
  {
    type: NAV_ITEM_TYPES.LINK,
    label: &quot;Analytics&quot;,
    href: &quot;/analytics&quot;,
    icon: <BarChart className=&quot;h-5 w-5&quot; />,
  },
];
