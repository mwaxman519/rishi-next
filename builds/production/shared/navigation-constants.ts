/**
 * Navigation Constants for Production Build
 */

export const NAVIGATION_ROUTES = {
  DASHBOARD: '/dashboard',
  BOOKINGS: '/bookings',
  LOCATIONS: '/locations',
  STAFF: '/staff',
  INVENTORY: '/inventory',
  ANALYTICS: '/analytics',
  REPORTS: '/reports',
  TRAINING: '/training',
  ADMIN: '/admin',
  RBAC: '/rbac',
  ROLES: '/roles',
  SETTINGS: '/settings',
} as const;

export const PERMISSION_GROUPS = {
  BOOKINGS: 'bookings',
  LOCATIONS: 'locations', 
  STAFF: 'staff',
  INVENTORY: 'inventory',
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
  ADMIN: 'admin',
  SYSTEM: 'system',
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  INTERNAL_ADMIN: 'internal_admin',
  INTERNAL_FIELD_MANAGER: 'internal_field_manager',
  BRAND_AGENT: 'brand_agent',
  CLIENT_MANAGER: 'client_manager',
  CLIENT_USER: 'client_user',
} as const;

export const MOBILE_NAVIGATION_ITEMS = [
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
  }
] as const;