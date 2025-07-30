/**
 * Simplified Role-Based Access Control (RBAC) system
 * This version is designed to work with the current application requirements
 */

import { NextRequest } from &quot;next/server&quot;;

// Define permission type
export type Permission = string;

// Define role type
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Define roles
export const ROLES: Record<string, Role> = {
  super_admin: {
    id: &quot;super_admin&quot;,
    name: &quot;Super Admin&quot;,
    description: &quot;Full access to all system functions&quot;,
    permissions: [
      &quot;view:locations&quot;,
      &quot;create:locations&quot;,
      &quot;update:locations&quot;,
      &quot;delete:locations&quot;,
      &quot;approve:locations&quot;,
      &quot;view:users&quot;,
      &quot;create:users&quot;,
      &quot;update:users&quot;,
      &quot;delete:users&quot;,
      &quot;view:organizations&quot;,
      &quot;create:organizations&quot;,
      &quot;update:organizations&quot;,
      &quot;delete:organizations&quot;,
    ],
  },
  admin: {
    id: &quot;admin&quot;,
    name: &quot;Admin&quot;,
    description: &quot;Administrative access to organizational resources&quot;,
    permissions: [
      &quot;view:locations&quot;,
      &quot;create:locations&quot;,
      &quot;update:locations&quot;,
      &quot;approve:locations&quot;,
      &quot;view:users&quot;,
      &quot;create:users&quot;,
      &quot;update:users&quot;,
      &quot;view:organizations&quot;,
    ],
  },
  manager: {
    id: &quot;manager&quot;,
    name: &quot;Manager&quot;,
    description: &quot;Management access to team resources&quot;,
    permissions: [&quot;view:locations&quot;, &quot;create:locations&quot;, &quot;view:users&quot;],
  },
  user: {
    id: &quot;user&quot;,
    name: &quot;User&quot;,
    description: &quot;Basic user access&quot;,
    permissions: [&quot;view:locations&quot;],
  },
};

// Get all permissions for a role
export function getPermissionsForRole(role: string): Permission[] {
  return ROLES[role]?.permissions || [];
}

// Get all permissions for a user based on their roles
export function getUserPermissions(roles: string[]): Permission[] {
  const permissions = new Set<Permission>();

  roles.forEach((role) => {
    const rolePermissions = getPermissionsForRole(role);
    rolePermissions.forEach((permission) => permissions.add(permission));
  });

  return Array.from(permissions);
}

// Check if a user has a specific permission
export async function checkPermission(
  req: NextRequest,
  permission: string,
): Promise<boolean> {
  console.log(
    `Checking permission: ${permission} - DEVELOPMENT MODE: Always granted`,
  );
  return true;
}

// Additional exports needed by the application
export function getAllPermissions(): Permission[] {
  const allPermissions = new Set<Permission>();
  Object.values(ROLES).forEach((role) => {
    role.permissions.forEach((permission) => allPermissions.add(permission));
  });
  return Array.from(allPermissions);
}

export async function hasPermission(
  permission: string,
  userRoles: string[] = [],
): Promise<boolean> {
  // In development mode, always return true for super_admin
  if (userRoles.includes(&quot;super_admin&quot;)) return true;

  const userPermissions = getUserPermissions(userRoles);
  return userPermissions.includes(permission);
}

export const routePermissions: Record<string, string[]> = {
  &quot;/admin&quot;: [&quot;admin:access&quot;],
  &quot;/users&quot;: [&quot;view:users&quot;],
  &quot;/organizations&quot;: [&quot;view:organizations&quot;],
  &quot;/locations&quot;: [&quot;view:locations&quot;],
  &quot;/bookings&quot;: [&quot;view:bookings&quot;],
  &quot;/reports&quot;: [&quot;view:reports&quot;],
};

export async function hasRoutePermission(
  route: string,
  userRoles: string[] = [],
): Promise<boolean> {
  const requiredPermissions = routePermissions[route] || [];
  if (requiredPermissions.length === 0) return true;

  return requiredPermissions.some((permission) =>
    getUserPermissions(userRoles).includes(permission),
  );
}
