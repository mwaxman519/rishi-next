import { NavItem, NAV_ITEM_TYPES } from &quot;@shared/navigation-constants&quot;;
import {
  LayoutDashboard,
  Calendar,
  Clock,
  CheckSquare,
  MapPin,
  FileText,
  Settings,
  BarChart,
  Briefcase,
  CreditCard,
} from &quot;lucide-react&quot;;

/**
 * Desktop navigation items for Client Users
 */
export const CLIENT_USER_NAV: NavItem[] = [
  {
    label: &quot;Dashboard&quot;,
    path: &quot;/dashboard&quot;,
    icon: <LayoutDashboard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Schedule&quot;,
    path: &quot;/schedule&quot;,
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Events&quot;,
    path: &quot;/events&quot;,
    icon: <Clock size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Requests&quot;,
    path: &quot;/requests&quot;,
    icon: <CheckSquare size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Products&quot;,
    path: &quot;/products&quot;,
    icon: <Briefcase size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Locations&quot;,
    path: &quot;/locations&quot;,
    icon: <MapPin size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Billing&quot;,
    path: &quot;/billing&quot;,
    icon: <CreditCard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Analytics&quot;,
    path: &quot;/analytics&quot;,
    icon: <BarChart size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Documentation&quot;,
    path: &quot;/docs&quot;,
    icon: <FileText size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
  {
    label: &quot;Settings&quot;,
    path: &quot;/profile/settings&quot;,
    icon: <Settings size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
];

/**
 * Secondary navigation items for Client Users (top bar items)
 */
export const CLIENT_USER_SECONDARY_NAV: NavItem[] = [
  {
    label: &quot;Documentation&quot;,
    path: &quot;/docs&quot;,
    icon: <FileText size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
  {
    label: &quot;Profile Settings&quot;,
    path: &quot;/profile/settings&quot;,
    icon: <Settings size={20} />,
    type: NAV_ITEM_TYPES.SECONDARY,
  },
];
