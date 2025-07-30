import {
  NavItem,
  NavItemType,
  NAV_ITEM_TYPES,
} from &quot;@shared/navigation-constants&quot;;
import { Permission } from &quot;@/lib/rbac&quot;;

/**
 * Filter navigation links based on user permissions while respecting high priority items
 * High priority items will always be displayed regardless of permissions
 */
export const filterLinksByPermission = (
  links: NavItem[],
  user: { id: string; role: string } | null | undefined,
  userRole: string | null | undefined,
  checkPermission: (permission: Permission | string) => boolean,
): NavItem[] => {
  return links.filter((link) => {
    // Always include high priority items regardless of permissions
    if (link.priority === &quot;high&quot;) return true;

    // Regular permission check
    if (!link.permission) return true;
    if (!user) return false;
    return userRole && checkPermission(link.permission as Permission);
  });
};

/**
 * Check if a navigation array contains a &quot;My Availability&quot; link
 */
export const hasMyAvailability = (items: NavItem[]): boolean => {
  return items.some((item: NavItem) => item.label === &quot;My Availability&quot;);
};

/**
 * Create a My Availability navigation item with high priority
 * This ensures consistency across all navigation components
 *
 * Note: The icon is specified as a string which gets dynamically
 * processed by the Sidebar component using the lucide-react Icons object
 */
export const createMyAvailabilityLink = (): NavItem => {
  return {
    href: &quot;/availability&quot;,
    path: &quot;/availability&quot;,
    label: &quot;My Availability&quot;,
    icon: &quot;Clock&quot;, // This is a string that refers to the lucide-react Clock icon
    type: NAV_ITEM_TYPES.PRIMARY,
    priority: &quot;high&quot;, // Always high priority
  };
};
