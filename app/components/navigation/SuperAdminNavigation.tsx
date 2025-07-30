&quot;use client&quot;;

import { NavItem, NAV_ITEM_TYPES } from &quot;@shared/navigation-constants&quot;;
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
} from &quot;lucide-react&quot;;

/**
 * Super Admin Navigation Structure
 * Organized following information architecture best practices
 */
export const SUPER_ADMIN_NAVIGATION: NavItem[] = [
  {
    id: &quot;organizations&quot;,
    label: &quot;Organizations&quot;,
    path: &quot;/admin/organizations&quot;,
    href: &quot;/admin/organizations&quot;,
    icon: <Building size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: &quot;org-list&quot;,
        label: &quot;Organization List&quot;,
        path: &quot;/admin/organizations&quot;,
        href: &quot;/admin/organizations&quot;,
        icon: <Building size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;org-settings&quot;,
        label: &quot;Organization Settings&quot;,
        path: &quot;/admin/organizations/settings&quot;,
        href: &quot;/admin/organizations/settings&quot;,
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;org-analytics&quot;,
        label: &quot;Analytics&quot;,
        path: &quot;/admin/organizations/analytics&quot;,
        href: &quot;/admin/organizations/analytics&quot;,
        icon: <BarChart size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    id: &quot;users-access&quot;,
    label: &quot;Users & Access&quot;,
    path: &quot;/admin/users&quot;,
    href: &quot;/admin/users&quot;,
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: &quot;users&quot;,
        label: &quot;Users&quot;,
        path: &quot;/admin/users&quot;,
        href: &quot;/admin/users&quot;,
        icon: <Users size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;roles&quot;,
        label: &quot;Roles&quot;,
        path: &quot;/admin/roles&quot;,
        href: &quot;/admin/roles&quot;,
        icon: <UserCog size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;access-control&quot;,
        label: &quot;Access Control&quot;,
        path: &quot;/admin/rbac&quot;,
        href: &quot;/admin/rbac&quot;,
        icon: <Lock size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;org-permissions&quot;,
        label: &quot;Organization Permissions&quot;,
        path: &quot;/admin/organization-permissions&quot;,
        href: &quot;/admin/organization-permissions&quot;,
        icon: <Shield size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    id: &quot;operations&quot;,
    label: &quot;Operations&quot;,
    path: &quot;/admin/operations&quot;,
    href: &quot;/admin/operations&quot;,
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: &quot;events&quot;,
        label: &quot;Events&quot;,
        path: &quot;/admin/events&quot;,
        href: &quot;/admin/events&quot;,
        icon: <Calendar size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;locations&quot;,
        label: &quot;Locations&quot;,
        path: &quot;/admin/locations&quot;,
        href: &quot;/admin/locations&quot;,
        icon: <MapPin size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;bookings&quot;,
        label: &quot;Bookings&quot;,
        path: &quot;/admin/bookings&quot;,
        href: &quot;/admin/bookings&quot;,
        icon: <Clock size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;staff&quot;,
        label: &quot;Staff&quot;,
        path: &quot;/admin/staff&quot;,
        href: &quot;/admin/staff&quot;,
        icon: <UsersRound size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    id: &quot;system&quot;,
    label: &quot;System&quot;,
    path: &quot;/admin/system&quot;,
    href: &quot;/admin/system&quot;,
    icon: <Server size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: &quot;platform-settings&quot;,
        label: &quot;Platform Settings&quot;,
        path: &quot;/admin/settings&quot;,
        href: &quot;/admin/settings&quot;,
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;features&quot;,
        label: &quot;Features&quot;,
        path: &quot;/admin/features&quot;,
        href: &quot;/admin/features&quot;,
        icon: <Command size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;database&quot;,
        label: &quot;Database&quot;,
        path: &quot;/admin/database&quot;,
        href: &quot;/admin/database&quot;,
        icon: <Database size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;api&quot;,
        label: &quot;API&quot;,
        path: &quot;/admin/api&quot;,
        href: &quot;/admin/api&quot;,
        icon: <Network size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    id: &quot;monitoring&quot;,
    label: &quot;Monitoring&quot;,
    path: &quot;/admin/monitoring&quot;,
    href: &quot;/admin/monitoring&quot;,
    icon: <BarChart size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: &quot;system-status&quot;,
        label: &quot;System Status&quot;,
        path: &quot;/admin/system-status&quot;,
        href: &quot;/admin/system-status&quot;,
        icon: <AlertCircle size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;security&quot;,
        label: &quot;Security&quot;,
        path: &quot;/admin/security&quot;,
        href: &quot;/admin/security&quot;,
        icon: <Shield size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;performance&quot;,
        label: &quot;Performance&quot;,
        path: &quot;/admin/performance&quot;,
        href: &quot;/admin/performance&quot;,
        icon: <LineChart size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;audit&quot;,
        label: &quot;Audit&quot;,
        path: &quot;/admin/audit&quot;,
        href: &quot;/admin/audit&quot;,
        icon: <FileText size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    id: &quot;tools&quot;,
    label: &quot;Tools&quot;,
    path: &quot;/admin/tools&quot;,
    href: &quot;/admin/tools&quot;,
    icon: <Cog size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        id: &quot;test-data&quot;,
        label: &quot;Test Data&quot;,
        path: &quot;/admin/test-data&quot;,
        href: &quot;/admin/test-data&quot;,
        icon: <Database size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;debug-console&quot;,
        label: &quot;Debug Console&quot;,
        path: &quot;/admin/debug&quot;,
        href: &quot;/admin/debug&quot;,
        icon: <Command size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        id: &quot;infrastructure&quot;,
        label: &quot;Infrastructure&quot;,
        path: &quot;/admin/infrastructure&quot;,
        href: &quot;/admin/infrastructure&quot;,
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
  if (itemPath !== &quot;/&quot; && pathname.startsWith(itemPath + &quot;/&quot;)) {
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
