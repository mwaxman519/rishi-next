import { NavItem, NAV_ITEM_TYPES } from &quot;@shared/navigation-constants&quot;;
import {
  Home,
  LayoutDashboard,
  Calendar,
  Clock,
  CheckSquare,
  MapPin,
  FileText,
  Settings,
  ChevronRight,
  MessageSquare,
  User,
} from &quot;lucide-react&quot;;

/**
 * Desktop navigation items for Brand Agents
 */
export const BRAND_AGENT_NAV: NavItem[] = [
  {
    label: &quot;Dashboard&quot;,
    path: &quot;/dashboard&quot;,
    icon: <LayoutDashboard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;My Availability&quot;,
    path: &quot;/availability&quot;,
    icon: <Clock size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Events&quot;,
    path: &quot;/events&quot;,
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Requests&quot;,
    path: &quot;/requests&quot;,
    icon: <CheckSquare size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Locations&quot;,
    path: &quot;/locations&quot;,
    icon: <MapPin size={20} />,
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
 * Mobile navigation items for Brand Agents
 */
export const BRAND_AGENT_MOBILE_NAV: NavItem[] = [
  {
    label: &quot;Home&quot;,
    path: &quot;/&quot;,
    icon: <Home size={20} />,
    type: NAV_ITEM_TYPES.MOBILE,
  },
  {
    label: &quot;Events&quot;,
    path: &quot;/events&quot;,
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.MOBILE,
  },
  {
    label: &quot;Availability&quot;,
    path: &quot;/availability&quot;,
    icon: <Clock size={20} />,
    type: NAV_ITEM_TYPES.MOBILE,
  },
  {
    label: &quot;Requests&quot;,
    path: &quot;/requests&quot;,
    icon: <CheckSquare size={20} />,
    type: NAV_ITEM_TYPES.MOBILE,
  },
  {
    label: &quot;Profile&quot;,
    path: &quot;/profile&quot;,
    icon: <User size={20} />,
    type: NAV_ITEM_TYPES.MOBILE,
  },
];

/**
 * Secondary navigation items for Brand Agents (top bar items)
 */
export const BRAND_AGENT_SECONDARY_NAV: NavItem[] = [
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
