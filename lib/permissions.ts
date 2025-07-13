/**
 * Permissions module for RBAC system
 * Handles permission checking and role-based access control
 */

import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { users, userOrganizations } from "../shared/schema";

// Define permission levels
export type PermissionLevel = "read" | "write" | "admin" | "full";

// Define available permissions
export type Permission = 
  | "create:organizations"
  | "read:organizations"
  | "update:organizations"
  | "delete:organizations"
  | "create:users"
  | "read:users"
  | "update:users"
  | "delete:users"
  | "create:bookings"
  | "read:bookings"
  | "update:bookings"
  | "delete:bookings"
  | "create:activities"
  | "read:activities"
  | "update:activities"
  | "delete:activities"
  | "create:locations"
  | "read:locations"
  | "update:locations"
  | "delete:locations"
  | "create:staff"
  | "read:staff"
  | "update:staff"
  | "delete:staff";

// Role to permissions mapping
const rolePermissions = {
  super_admin: [
    "create:organizations", "read:organizations", "update:organizations", "delete:organizations",
    "create:users", "read:users", "update:users", "delete:users",
    "create:bookings", "read:bookings", "update:bookings", "delete:bookings",
    "create:activities", "read:activities", "update:activities", "delete:activities",
    "create:locations", "read:locations", "update:locations", "delete:locations",
    "create:staff", "read:staff", "update:staff", "delete:staff"
  ] as Permission[],
  internal_admin: [
    "read:organizations", "update:organizations",
    "create:users", "read:users", "update:users",
    "create:bookings", "read:bookings", "update:bookings",
    "create:activities", "read:activities", "update:activities",
    "create:locations", "read:locations", "update:locations",
    "create:staff", "read:staff", "update:staff"
  ] as Permission[],
  internal_field_manager: [
    "read:organizations",
    "read:users",
    "create:bookings", "read:bookings", "update:bookings",
    "create:activities", "read:activities", "update:activities",
    "read:locations", "update:locations",
    "read:staff", "update:staff"
  ] as Permission[],
  brand_agent: [
    "read:organizations",
    "read:users",
    "create:bookings", "read:bookings", "update:bookings",
    "read:activities", "update:activities",
    "read:locations",
    "read:staff"
  ] as Permission[],
  client_manager: [
    "read:organizations",
    "read:users",
    "read:bookings",
    "read:activities",
    "read:locations",
    "read:staff"
  ] as Permission[],
  client_user: [
    "read:bookings",
    "read:activities",
    "read:locations"
  ] as Permission[]
};

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  userId: string, 
  permission: Permission, 
  organizationId?: string
): Promise<boolean> {
  try {
    // Get user and their role
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return false;
    }

    // Super admin has all permissions
    if (user.role === "super_admin") {
      return true;
    }

    // Check if the user has the permission based on their role
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return [];
    }

    return rolePermissions[user.role] || [];
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
}