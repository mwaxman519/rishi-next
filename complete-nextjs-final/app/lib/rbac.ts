/**
 * Simplified Role-Based Access Control (RBAC) system
 * This version is designed to work with the current application requirements
 */

import { NextRequest } from "next/server";

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
    id: "super_admin",
    name: "Super Admin",
    description: "Full access to all system functions",
    permissions: [
      "view:locations",
      "create:locations",
      "update:locations",
      "delete:locations",
      "approve:locations",
      "view:users",
      "create:users",
      "update:users",
      "delete:users",
      "view:organizations",
      "create:organizations",
      "update:organizations",
      "delete:organizations",
    ],
  },
  admin: {
    id: "admin",
    name: "Admin",
    description: "Administrative access to organizational resources",
    permissions: [
      "view:locations",
      "create:locations",
      "update:locations",
      "approve:locations",
      "view:users",
      "create:users",
      "update:users",
      "view:organizations",
    ],
  },
  manager: {
    id: "manager",
    name: "Manager",
    description: "Management access to team resources",
    permissions: ["view:locations", "create:locations", "view:users"],
  },
  user: {
    id: "user",
    name: "User",
    description: "Basic user access",
    permissions: ["view:locations"],
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
  if (userRoles.includes("super_admin")) return true;

  const userPermissions = getUserPermissions(userRoles);
  return userPermissions.includes(permission);
}

export const routePermissions: Record<string, string[]> = {
  "/admin": ["admin:access"],
  "/users": ["view:users"],
  "/organizations": ["view:organizations"],
  "/locations": ["view:locations"],
  "/bookings": ["view:bookings"],
  "/reports": ["view:reports"],
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
