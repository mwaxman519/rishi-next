/**
 * Navigation Structure for Production Build
 */

import { NAVIGATION_ROUTES, USER_ROLES } from './navigation-constants';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  roles?: string[];
}

export const SUPER_ADMIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: NAVIGATION_ROUTES.DASHBOARD,
    icon: 'LayoutDashboard'
  },
  {
    id: 'bookings',
    label: 'Bookings',
    href: NAVIGATION_ROUTES.BOOKINGS,
    icon: 'Calendar'
  },
  {
    id: 'locations',
    label: 'Locations',
    href: NAVIGATION_ROUTES.LOCATIONS,
    icon: 'MapPin'
  },
  {
    id: 'staff',
    label: 'Staff',
    href: NAVIGATION_ROUTES.STAFF,
    icon: 'Users'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    href: NAVIGATION_ROUTES.INVENTORY,
    icon: 'Package'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: NAVIGATION_ROUTES.ANALYTICS,
    icon: 'BarChart'
  },
  {
    id: 'reports',
    label: 'Reports',
    href: NAVIGATION_ROUTES.REPORTS,
    icon: 'FileText'
  },
  {
    id: 'admin',
    label: 'Administration',
    href: NAVIGATION_ROUTES.ADMIN,
    icon: 'Settings'
  },
  {
    id: 'rbac',
    label: 'Role Management',
    href: NAVIGATION_ROUTES.RBAC,
    icon: 'Shield'
  }
];

export const FIELD_MANAGER_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: NAVIGATION_ROUTES.DASHBOARD,
    icon: 'LayoutDashboard'
  },
  {
    id: 'bookings',
    label: 'My Bookings',
    href: NAVIGATION_ROUTES.BOOKINGS,
    icon: 'Calendar'
  },
  {
    id: 'staff',
    label: 'Team Management',
    href: NAVIGATION_ROUTES.STAFF,
    icon: 'Users'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    href: NAVIGATION_ROUTES.INVENTORY,
    icon: 'Package'
  }
];

// Export all navigation types for compatibility
export const superAdminNavigation = SUPER_ADMIN_NAVIGATION;
export const internalAdminNavigation = SUPER_ADMIN_NAVIGATION; // Same as super admin
export const fieldManagerNavigation = FIELD_MANAGER_NAVIGATION;
export const brandAgentNavigation = FIELD_MANAGER_NAVIGATION; // Limited navigation
export const clientUserNavigation = FIELD_MANAGER_NAVIGATION; // Basic navigation

export const getPlatformAdminNav = () => SUPER_ADMIN_NAVIGATION;

export const getNavigationForRole = (role: string): NavigationItem[] => {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
    case USER_ROLES.INTERNAL_ADMIN:
      return SUPER_ADMIN_NAVIGATION;
    case USER_ROLES.INTERNAL_FIELD_MANAGER:
      return FIELD_MANAGER_NAVIGATION;
    default:
      return FIELD_MANAGER_NAVIGATION; // Default fallback
  }
};