/**
 * Role-Based Access Control (RBAC) System
 * Handles user permissions and role-based authorization
 */

import { db } from '../server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Role definitions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  INTERNAL_ADMIN: 'internal_admin',
  INTERNAL_FIELD_MANAGER: 'internal_field_manager',
  BRAND_AGENT: 'brand_agent',
  CLIENT_MANAGER: 'client_manager',
  CLIENT_USER: 'client_user',
} as const;

// Permission definitions
export const PERMISSIONS = {
  // Organization permissions
  'create:organizations': ['super_admin', 'internal_admin'],
  'read:organizations': ['super_admin', 'internal_admin', 'internal_field_manager'],
  'update:organizations': ['super_admin', 'internal_admin'],
  'delete:organizations': ['super_admin'],

  // User permissions
  'create:users': ['super_admin', 'internal_admin', 'client_manager'],
  'read:users': ['super_admin', 'internal_admin', 'internal_field_manager', 'client_manager'],
  'update:users': ['super_admin', 'internal_admin', 'client_manager'],
  'delete:users': ['super_admin', 'internal_admin'],

  // Booking permissions
  'create:bookings': ['super_admin', 'internal_admin', 'internal_field_manager', 'client_manager', 'client_user'],
  'read:bookings': ['super_admin', 'internal_admin', 'internal_field_manager', 'brand_agent', 'client_manager', 'client_user'],
  'update:bookings': ['super_admin', 'internal_admin', 'internal_field_manager', 'client_manager'],
  'delete:bookings': ['super_admin', 'internal_admin'],

  // Location permissions
  'create:locations': ['super_admin', 'internal_admin', 'internal_field_manager', 'client_manager'],
  'read:locations': ['super_admin', 'internal_admin', 'internal_field_manager', 'brand_agent', 'client_manager', 'client_user'],
  'update:locations': ['super_admin', 'internal_admin', 'internal_field_manager', 'client_manager'],
  'delete:locations': ['super_admin', 'internal_admin'],

  // Staff permissions
  'create:staff': ['super_admin', 'internal_admin', 'internal_field_manager'],
  'read:staff': ['super_admin', 'internal_admin', 'internal_field_manager', 'brand_agent', 'client_manager'],
  'update:staff': ['super_admin', 'internal_admin', 'internal_field_manager'],
  'delete:staff': ['super_admin', 'internal_admin'],

  // Reports permissions
  'read:reports': ['super_admin', 'internal_admin', 'internal_field_manager', 'client_manager'],
  'create:reports': ['super_admin', 'internal_admin', 'internal_field_manager'],
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a user has a specific permission
 */
export async function checkPermission(user: any, permission: Permission): Promise<boolean> {
  if (!user || !user.role) {
    return false;
  }

  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) {
    return false;
  }

  return allowedRoles.includes(user.role as Role);
}

/**
 * Get user by ID from database
 */
export async function getUserById(userId: string): Promise<any> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(role: Role): Permission[] {
  const permissions: Permission[] = [];
  
  for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
    if (allowedRoles.includes(role)) {
      permissions.push(permission as Permission);
    }
  }
  
  return permissions;
}

/**
 * Check if user has permission (wrapper for compatibility)
 */
export function hasPermission(user: any, permission: Permission): boolean {
  if (!user || !user.role) {
    return false;
  }

  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) {
    return false;
  }

  return allowedRoles.includes(user.role as Role);
}

/**
 * Role hierarchy for permission inheritance
 */
export const ROLE_HIERARCHY = {
  super_admin: 6,
  internal_admin: 5,
  internal_field_manager: 4,
  brand_agent: 3,
  client_manager: 2,
  client_user: 1,
} as const;

/**
 * Check if user role has higher or equal hierarchy level
 */
export function hasRoleLevel(userRole: Role, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

// Default export for compatibility
export default {
  ROLES,
  PERMISSIONS,
  checkPermission,
  getUserById,
  getUserPermissions,
  hasPermission,
  hasRoleLevel,
};