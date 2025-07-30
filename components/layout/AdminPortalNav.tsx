&quot;use client&quot;;

import { NavItem, NAV_ITEM_TYPES } from &quot;@shared/navigation-constants&quot;;
import { USER_ROLES } from &quot;@shared/rbac-roles&quot;;
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
  PlusCircle,
} from &quot;lucide-react&quot;;

/**
 * IMPORTANT: We've removed the separate PLATFORM_ADMIN_NAV array and consolidated
 * all system administration features into the SUPER_ADMIN_NAV structure below.
 * This prevents duplication in the navigation menu.
 */

// Import the new Super Admin navigation structure
import { SUPER_ADMIN_NAVIGATION } from &quot;@/components/navigation/SuperAdminNavigation&quot;;

/**
 * Navigation items for Super Admin role - Admin Portal
 * Using the new organized structure from SuperAdminNavigation
 */
export const SUPER_ADMIN_NAV: NavItem[] = SUPER_ADMIN_NAVIGATION;

/**
 * Navigation items for Internal Admin role
 */
export const INTERNAL_ADMIN_NAV: NavItem[] = [
  {
    label: &quot;Organization Management&quot;,
    path: &quot;/admin/organizations&quot;,
    icon: <Building size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Client Directory&quot;,
        path: &quot;/admin/organizations&quot;,
        icon: <Building size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Client Settings&quot;,
        path: &quot;/admin/organizations/settings&quot;,
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Staff Management&quot;,
    path: &quot;/admin/users&quot;,
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Staff Directory&quot;,
        path: &quot;/admin/users&quot;,
        icon: <UsersRound size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Add New Staff&quot;,
        path: &quot;/admin/users/create&quot;,
        icon: <UserPlus size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Location Management&quot;,
    path: &quot;/admin/locations&quot;,
    icon: <MapPin size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Location Directory&quot;,
        path: &quot;/admin/locations&quot;,
        icon: <MapPin size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Add New Location&quot;,
        path: &quot;/admin/locations/new&quot;,
        icon: <PlusCircle size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Pending Approval&quot;,
        path: &quot;/admin/locations/approval-queue&quot;,
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
    label: &quot;Field Operations&quot;,
    path: &quot;/admin/field-operations&quot;,
    icon: <Briefcase size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Team Dashboard&quot;,
        path: &quot;/admin/field-operations/dashboard&quot;,
        icon: <LayoutDashboard size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Assignment Calendar&quot;,
        path: &quot;/admin/field-operations/calendar&quot;,
        icon: <Calendar size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Location Management&quot;,
    path: &quot;/admin/locations&quot;,
    icon: <MapPin size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Location Directory&quot;,
        path: &quot;/admin/locations&quot;,
        icon: <MapPin size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Add New Location&quot;,
        path: &quot;/admin/locations/new&quot;,
        icon: <PlusCircle size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Pending Approval&quot;,
        path: &quot;/admin/locations/approval-queue&quot;,
        icon: <CheckSquare size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Team Management&quot;,
    path: &quot;/admin/users&quot;,
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Agent Directory&quot;,
        path: &quot;/admin/users&quot;,
        icon: <UsersRound size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Performance Reports&quot;,
        path: &quot;/admin/users/performance&quot;,
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
    (item) => item.label === &quot;Platform Administration&quot;,
  );
}
