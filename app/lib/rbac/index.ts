import { getRolePermissions } from &quot;./permissions&quot;;
import { createRBACProvider, useRBAC } from &quot;./provider&quot;;

// Define types for RBAC
export type UserRole =
  | &quot;super_admin&quot;
  | &quot;admin&quot;
  | &quot;manager&quot;
  | &quot;staff&quot;
  | &quot;client&quot;
  | &quot;user&quot;;

export type Resource =
  | &quot;locations&quot;
  | &quot;bookings&quot;
  | &quot;organizations&quot;
  | &quot;users&quot;
  | &quot;reports&quot;;

export type Permission =
  | &quot;create&quot;
  | &quot;read&quot;
  | &quot;update&quot;
  | &quot;delete&quot;
  | &quot;approve&quot;
  | &quot;reject&quot;
  | &quot;manage&quot;
  | &quot;export&quot;;

export type PermissionMap = Record<Resource, Permission[]>;

export interface RBACUser {
  id: string;
  role: UserRole;
  organizationId?: string;
  organizationRole?: string;
}

// Main permission checking function
export function hasPermission(
  userRole: UserRole,
  resource: Resource,
  permission: Permission,
): boolean {
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions[resource]?.includes(permission) || false;
}

// Get all permissions for a role
export function getAllPermissions(userRole: UserRole): PermissionMap {
  return getRolePermissions(userRole);
}

// Route-based permission system
export const routePermissions: Record<
  string,
  { resource: Resource; permission: Permission }
> = {
  &quot;/admin&quot;: { resource: &quot;users&quot;, permission: &quot;manage&quot; },
  &quot;/admin/users&quot;: { resource: &quot;users&quot;, permission: &quot;read&quot; },
  &quot;/admin/roles&quot;: { resource: &quot;users&quot;, permission: &quot;manage&quot; },
  &quot;/admin/organizations&quot;: { resource: &quot;organizations&quot;, permission: &quot;read&quot; },
  &quot;/locations&quot;: { resource: &quot;locations&quot;, permission: &quot;read&quot; },
  &quot;/bookings&quot;: { resource: &quot;bookings&quot;, permission: &quot;read&quot; },
  &quot;/reports&quot;: { resource: &quot;reports&quot;, permission: &quot;read&quot; },
};

// Check route-specific permissions
export function hasRoutePermission(userRole: UserRole, route: string): boolean {
  const routePerms = routePermissions[route];
  if (!routePerms) return true; // Allow access to unprotected routes

  return hasPermission(userRole, routePerms.resource, routePerms.permission);
}

export { getRolePermissions, createRBACProvider, useRBAC };
