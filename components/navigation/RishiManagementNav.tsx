import { NavItem, NAV_ITEM_TYPES } from &quot;@shared/navigation-constants&quot;;
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
} from &quot;lucide-react&quot;;

/**
 * Desktop navigation items for Rishi Management (Internal Admins)
 */
export const RISHI_MANAGEMENT_NAV: NavItem[] = [
  {
    label: &quot;Dashboard&quot;,
    path: &quot;/dashboard&quot;,
    icon: <LayoutDashboard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Organizations&quot;,
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
    ],
  },
  {
    label: &quot;Users&quot;,
    path: &quot;/admin/users&quot;,
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;User Directory&quot;,
        path: &quot;/admin/users&quot;,
        icon: <Users size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Create User&quot;,
        path: &quot;/admin/users/create&quot;,
        icon: <Users size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Schedule&quot;,
    path: &quot;/team-schedule&quot;,
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Bookings&quot;,
    path: &quot;/bookings&quot;,
    icon: <CalendarClock size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;All Bookings&quot;,
        path: &quot;/bookings&quot;,
        icon: <Calendar size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Create Booking&quot;,
        path: &quot;/bookings/new&quot;,
        icon: <CalendarPlus size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Approval Queue&quot;,
        path: &quot;/bookings/approval-queue&quot;,
        icon: <CheckSquare size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Locations&quot;,
    path: &quot;/admin/locations&quot;,
    icon: <MapPin size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Location Management&quot;,
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
    label: &quot;Analytics&quot;,
    path: &quot;/admin/analytics&quot;,
    icon: <BarChart size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Billing&quot;,
    path: &quot;/admin/billing&quot;,
    icon: <CreditCard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Documentation&quot;,
    path: &quot;/docs&quot;,
    icon: <FileText size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
  {
    label: &quot;System&quot;,
    path: &quot;/admin/system&quot;,
    icon: <Database size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
    children: [
      {
        label: &quot;Settings&quot;,
        path: &quot;/admin/system/settings&quot;,
        icon: <Settings size={20} />,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      {
        label: &quot;RBAC&quot;,
        path: &quot;/admin/system/rbac&quot;,
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
    label: &quot;Documentation&quot;,
    path: &quot;/docs&quot;,
    icon: <FileText size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
  {
    label: &quot;System Settings&quot;,
    path: &quot;/admin/system/settings&quot;,
    icon: <Settings size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
];
