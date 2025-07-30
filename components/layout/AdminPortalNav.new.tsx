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
} from &quot;lucide-react&quot;;

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
    label: &quot;Platform Administration&quot;,
    path: &quot;/admin/platform&quot;,
    icon: <Server size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Access Control&quot;,
        path: &quot;/admin/rbac&quot;,
        icon: <Lock size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Feature Management&quot;,
        path: &quot;/admin/features&quot;,
        icon: <Command size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;System Settings&quot;,
        path: &quot;/admin/settings&quot;,
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Organization Permissions&quot;,
        path: &quot;/admin/organization-permissions&quot;,
        icon: <Shield size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Organization Management&quot;,
    path: &quot;/admin/organizations&quot;,
    icon: <Building size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Organization Directory&quot;,
        path: &quot;/admin/organizations&quot;,
        icon: <Building size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Organization Settings&quot;,
        path: &quot;/admin/organizations/settings&quot;,
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Branding&quot;,
        path: &quot;/admin/organizations/branding&quot;,
        icon: <Globe size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;User Management&quot;,
    path: &quot;/admin/users&quot;,
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;User Directory&quot;,
        path: &quot;/admin/users&quot;,
        icon: <UsersRound size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Add New User&quot;,
        path: &quot;/admin/users/create&quot;,
        icon: <UserPlus size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Role Assignments&quot;,
        path: &quot;/admin/users/permissions&quot;,
        icon: <Lock size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Testing&quot;,
    path: &quot;/admin/test-data&quot;,
    icon: <Database size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Test Data&quot;,
        path: &quot;/admin/test-data&quot;,
        icon: <Database size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Test Organizations&quot;,
        path: &quot;/admin/test-organizations&quot;,
        icon: <Building size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Test Users&quot;,
        path: &quot;/admin/test-users&quot;,
        icon: <Users size={20} />,
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
        label: &quot;Approval Queue&quot;,
        path: &quot;/admin/locations/approval-queue&quot;,
        icon: <CheckSquare size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Location Analytics&quot;,
        path: &quot;/admin/locations/analytics&quot;,
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
        label: &quot;Approval Queue&quot;,
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
        label: &quot;Approval Queue&quot;,
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
