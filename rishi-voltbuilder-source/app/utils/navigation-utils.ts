import {
  NavItem,
  NavItemType,
  NAV_ITEM_TYPES,
} from "@shared/navigation-constants";
import { Permission } from "@/lib/rbac";

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
    if (link.priority === "high") return true;

    // Regular permission check
    if (!link.permission) return true;
    if (!user) return false;
    return userRole && checkPermission(link.permission as Permission);
  });
};

/**
 * Check if a navigation array contains a "My Availability" link
 */
export const hasMyAvailability = (items: NavItem[]): boolean => {
  return items.some((item: NavItem) => item.label === "My Availability");
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
    href: "/availability",
    path: "/availability",
    label: "My Availability",
    icon: "Clock", // This is a string that refers to the lucide-react Clock icon
    type: NAV_ITEM_TYPES.PRIMARY,
    priority: "high", // Always high priority
  };
};
