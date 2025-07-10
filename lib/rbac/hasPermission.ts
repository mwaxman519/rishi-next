/**
 * RBAC Permission Checking Utilities
 * Provides functions to check user permissions based on roles and organization context
 */

import { UserRole } from "../../shared/schema";

// Define permission levels
export type PermissionLevel = 'read' | 'write' | 'admin' | 'full';

// Define resource types
export type ResourceType = 
  | 'bookings'
  | 'users' 
  | 'organizations'
  | 'locations'
  | 'kits'
  | 'analytics'
  | 'admin'
  | 'system';

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  internal_admin: 80,
  internal_field_manager: 60,
  brand_agent: 40,
  client_manager: 30,
  client_user: 20,
};

// Permission matrix - defines what each role can access
const PERMISSION_MATRIX: Record<UserRole, Record<ResourceType, PermissionLevel[]>> = {
  super_admin: {
    bookings: ['read', 'write', 'admin', 'full'],
    users: ['read', 'write', 'admin', 'full'],
    organizations: ['read', 'write', 'admin', 'full'],
    locations: ['read', 'write', 'admin', 'full'],
    kits: ['read', 'write', 'admin', 'full'],
    analytics: ['read', 'write', 'admin', 'full'],
    admin: ['read', 'write', 'admin', 'full'],
    system: ['read', 'write', 'admin', 'full'],
  },
  internal_admin: {
    bookings: ['read', 'write', 'admin'],
    users: ['read', 'write', 'admin'],
    organizations: ['read', 'write'],
    locations: ['read', 'write', 'admin'],
    kits: ['read', 'write', 'admin'],
    analytics: ['read', 'write', 'admin'],
    admin: ['read', 'write'],
    system: ['read'],
  },
  internal_field_manager: {
    bookings: ['read', 'write'],
    users: ['read', 'write'],
    organizations: ['read'],
    locations: ['read', 'write'],
    kits: ['read', 'write'],
    analytics: ['read'],
    admin: ['read'],
    system: [],
  },
  brand_agent: {
    bookings: ['read', 'write'],
    users: ['read'],
    organizations: ['read'],
    locations: ['read'],
    kits: ['read'],
    analytics: ['read'],
    admin: [],
    system: [],
  },
  client_manager: {
    bookings: ['read', 'write'],
    users: ['read'],
    organizations: ['read'],
    locations: ['read'],
    kits: ['read'],
    analytics: ['read'],
    admin: [],
    system: [],
  },
  client_user: {
    bookings: ['read'],
    users: ['read'],
    organizations: ['read'],
    locations: ['read'],
    kits: ['read'],
    analytics: [],
    admin: [],
    system: [],
  },
};

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  userRole: UserRole,
  resource: ResourceType,
  permission: PermissionLevel
): boolean {
  const rolePermissions = PERMISSION_MATRIX[userRole];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(permission);
}

/**
 * Check if a user role has higher or equal hierarchy than required role
 */
export function hasRoleHierarchy(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get all permissions for a user role
 */
export function getUserPermissions(userRole: UserRole): Record<ResourceType, PermissionLevel[]> {
  return PERMISSION_MATRIX[userRole] || {};
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(userRole: UserRole): boolean {
  return hasPermission(userRole, 'admin', 'read');
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, 'users', 'write');
}

/**
 * Check if user can view analytics
 */
export function canViewAnalytics(userRole: UserRole): boolean {
  return hasPermission(userRole, 'analytics', 'read');
}

/**
 * Check if user can manage bookings
 */
export function canManageBookings(userRole: UserRole): boolean {
  return hasPermission(userRole, 'bookings', 'write');
}

// Default export for compatibility
export default {
  hasPermission,
  hasRoleHierarchy,
  getUserPermissions,
  canAccessAdmin,
  canManageUsers,
  canViewAnalytics,
  canManageBookings,
  PERMISSION_MATRIX,
  ROLE_HIERARCHY,
};