/**
 * Role-Based Access Control (RBAC) system
 * This module provides functions for checking user permissions based on roles
 */

import { NextRequest } from "next/server";
import { getJwtPayload } from "./auth";

// Define role types
export enum ROLES {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
}

// Define permissions by role
const rolePermissions: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: [
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
  [ROLES.ADMIN]: [
    "view:locations",
    "create:locations",
    "update:locations",
    "approve:locations",
    "view:users",
    "create:users",
    "update:users",
    "view:organizations",
  ],
  [ROLES.MANAGER]: ["view:locations", "create:locations", "view:users"],
  [ROLES.USER]: ["view:locations"],
};

// Get all permissions for a role
export function getPermissionsForRole(role: string): string[] {
  return rolePermissions[role] || [];
}

// Get all permissions for a user
export async function getUserPermissions(userId: string): Promise<string[]> {
  // In a real app, this would fetch from the database
  // For development, return super admin permissions
  console.log("DEVELOPMENT MODE: Using super_admin permissions for user");
  return rolePermissions[ROLES.SUPER_ADMIN];
}

// Check if a user has a specific permission
export async function checkPermission(
  req: NextRequest,
  permission: string,
): Promise<boolean> {
  try {
    // For development mode, always return true
    // In a real app, you would:
    // 1. Get the JWT payload from the request
    // 2. Extract the user's role
    // 3. Check if the role has the required permission

    // For mock implementation
    console.log(
      `Checking permission: ${permission} - DEVELOPMENT MODE: Always granted`,
    );
    return true;

    // Real implementation would be:
    // const payload = await getJwtPayload(req);
    // if (!payload) return false;
    //
    // const userRole = payload.role;
    // const permissions = getPermissionsForRole(userRole);
    //
    // return permissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}
