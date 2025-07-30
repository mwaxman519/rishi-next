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
} from &quot;lucide-react&quot;;

/**
 * Desktop navigation items for Field Managers
 */
export const FIELD_MANAGER_NAV: NavItem[] = [
  {
    label: &quot;Dashboard&quot;,
    path: &quot;/dashboard&quot;,
    icon: <LayoutDashboard size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Team Schedule&quot;,
    path: &quot;/team-schedule&quot;,
    icon: <Calendar size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;My Availability&quot;,
    path: &quot;/availability&quot;,
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
    label: &quot;Agents&quot;,
    path: &quot;/agents&quot;,
    icon: <Users size={20} />,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Locations&quot;,
    path: &quot;/locations&quot;,
    icon: <MapPin size={20} />,
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
