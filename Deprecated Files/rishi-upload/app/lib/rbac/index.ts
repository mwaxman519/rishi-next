import { getRolePermissions } from "./permissions";
import { createRBACProvider, useRBAC } from "./provider";

// Define types for RBAC
export type UserRole =
  | "super_admin"
  | "admin"
  | "manager"
  | "staff"
  | "client"
  | "user";

export type Resource =
  | "locations"
  | "bookings"
  | "organizations"
  | "users"
  | "reports";

export type Permission =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "manage"
  | "export";

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
  "/admin": { resource: "users", permission: "manage" },
  "/admin/users": { resource: "users", permission: "read" },
  "/admin/roles": { resource: "users", permission: "manage" },
  "/admin/organizations": { resource: "organizations", permission: "read" },
  "/locations": { resource: "locations", permission: "read" },
  "/bookings": { resource: "bookings", permission: "read" },
  "/reports": { resource: "reports", permission: "read" },
};

// Check route-specific permissions
export function hasRoutePermission(userRole: UserRole, route: string): boolean {
  const routePerms = routePermissions[route];
  if (!routePerms) return true; // Allow access to unprotected routes

  return hasPermission(userRole, routePerms.resource, routePerms.permission);
}

export { getRolePermissions, createRBACProvider, useRBAC };
