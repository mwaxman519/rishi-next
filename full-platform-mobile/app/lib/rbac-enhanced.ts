/**
 * Enhanced RBAC Utilities
 *
 * This file provides advanced RBAC functionality that respects organizational boundaries
 * and implements the enhanced permission model with features and scopes.
 */

import { USER_ROLES, UserRole } from "../../shared/rbac/roles";
import {
  PermissionFeature,
  featureToString,
  parseFeature,
  permissionCovers,
  PERMISSION_SCOPES,
} from "../../shared/rbac/features";
import { ROLE_HIERARCHY, ROLE_PERMISSIONS } from "../../shared/rbac/roles";

/**
 * Type for organization-aware permission checking context
 */
export interface PermissionContext {
  organizationId?: number | undefined;
  resourceOwnerId?: string | undefined;
  regionIds?: number[] | undefined;
}

/**
 * Get all available permissions for a role, including inherited ones
 */
export function getAllPermissionsForRole(role: UserRole): string[] {
  const permissions = new Set<string>();

  // Add direct permissions
  const directPermissions = ROLE_PERMISSIONS[role] || [];
  directPermissions.forEach((perm) => permissions.add(perm));

  // Add inherited permissions recursively
  const addInheritedPermissions = (currentRole: string) => {
    const parentRoles = ROLE_HIERARCHY[currentRole] || [];

    parentRoles.forEach((parentRole) => {
      const parentPermissions = ROLE_PERMISSIONS[parentRole] || [];
      parentPermissions.forEach((perm) => permissions.add(perm));

      // Continue recursion
      addInheritedPermissions(parentRole);
    });
  };

  addInheritedPermissions(role);

  return Array.from(permissions);
}

/**
 * Check if a user with a given role has a specific permission within a context
 */
export function hasEnhancedPermission(
  permission: string,
  role: UserRole,
  context: PermissionContext = {},
): boolean {
  // Super admin has all permissions
  if (role === USER_ROLES.SUPER_ADMIN) return true;

  // Get all permissions for this role
  const rolePermissions = getAllPermissionsForRole(role);

  // Parse the requested permission
  let requestedFeature: PermissionFeature;
  try {
    requestedFeature = parseFeature(permission);
  } catch (error) {
    console.error(`Invalid permission format: ${permission}`);
    return false;
  }

  // Look for a permission that covers the requested one
  for (const rolePerm of rolePermissions) {
    // Direct string match
    if (rolePerm === permission) return true;

    // Check if this role permission covers the requested permission
    if (permissionCovers(rolePerm, permission)) {
      // If the permission has an organization scope but no organization context provided, deny
      const roleFeature = parseFeature(rolePerm);

      if (
        roleFeature.scope === PERMISSION_SCOPES.ORGANIZATION &&
        !context.organizationId
      ) {
        continue; // Skip this permission if it's org-scoped but no org context provided
      }

      // If the permission has a region scope but no region context provided, deny
      if (
        roleFeature.scope === PERMISSION_SCOPES.REGION &&
        (!context.regionIds || context.regionIds.length === 0)
      ) {
        continue;
      }

      // If the permission has an owned scope but no resource owner context provided, deny
      if (
        roleFeature.scope === PERMISSION_SCOPES.OWNED &&
        !context.resourceOwnerId
      ) {
        continue;
      }

      return true;
    }
  }

  return false;
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllEnhancedPermissions(
  permissions: string[],
  role: UserRole,
  context: PermissionContext = {},
): boolean {
  return permissions.every((permission) =>
    hasEnhancedPermission(permission, role, context),
  );
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasSomeEnhancedPermissions(
  permissions: string[],
  role: UserRole,
  context: PermissionContext = {},
): boolean {
  return permissions.some((permission) =>
    hasEnhancedPermission(permission, role, context),
  );
}

/**
 * Check if a user role can access a specific route with given context
 */
export function hasRoutePermission(
  route: string,
  role: UserRole,
  routePermissions: Record<string, string>,
  context: PermissionContext = {},
): boolean {
  // Super admin always has access
  if (role === USER_ROLES.SUPER_ADMIN) return true;

  // Check if we have a direct match for the route
  if (routePermissions[route]) {
    return hasEnhancedPermission(routePermissions[route], role, context);
  }

  // Try to match dynamic routes (e.g., "/users/123" should match "/users/[id]")
  const pathSegments = route.split("/").filter(Boolean);

  for (const [routePath, permission] of Object.entries(routePermissions)) {
    const routeSegments = routePath.split("/").filter(Boolean);

    // Skip if segment count doesn't match
    if (pathSegments.length !== routeSegments.length) continue;

    let matches = true;

    for (let i = 0; i < routeSegments.length; i++) {
      // Check for invalid segments
      if (!routeSegments[i] || !pathSegments[i]) {
        matches = false;
        break;
      }

      // If this segment is a parameter (e.g., [id]), it matches anything
      const segment = routeSegments[i];
      if (
        segment &&
        typeof segment === "string" &&
        segment.startsWith("[") &&
        segment.endsWith("]")
      ) {
        continue;
      }

      // Otherwise, segments must match exactly
      if (routeSegments[i] !== pathSegments[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return hasEnhancedPermission(permission, role, context);
    }
  }

  // Default behavior for internal admins
  return role === USER_ROLES.INTERNAL_ADMIN;
}

/**
 * Generate a permission context from user and request data
 */
export function createPermissionContext(
  userId?: string,
  organizationId?: number,
  regionIds?: number[],
): PermissionContext {
  return {
    resourceOwnerId: userId,
    organizationId,
    regionIds,
  };
}
