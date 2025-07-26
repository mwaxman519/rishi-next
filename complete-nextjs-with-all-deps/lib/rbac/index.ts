/**
 * RBAC Module Exports
 * Centralized exports for all RBAC functionality
 */

export {
  hasPermission,
  hasRoleHierarchy,
  getUserPermissions,
  canAccessAdmin,
  canManageUsers,
  canViewAnalytics,
  canManageBookings,
  type PermissionLevel,
  type ResourceType,
} from './hasPermission';

// Role-based access control utilities
export const RBAC = {
  hasPermission,
  hasRoleHierarchy,
  getUserPermissions,
  canAccessAdmin,
  canManageUsers,
  canViewAnalytics,
  canManageBookings,
} as const;