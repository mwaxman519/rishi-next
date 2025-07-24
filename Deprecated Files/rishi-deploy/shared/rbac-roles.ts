/**
 * RBAC (Role-Based Access Control) role definitions and utilities
 * This file contains centralized role and permission configuration for the application
 *
 * This is the canonical source of truth for all role and permission definitions
 */

// Define the role hierarchy
// Higher number indicates higher authority level
export const ROLE_HIERARCHY = {
  super_admin: 7,
  internal_admin: 6,
  internal_field_manager: 5,
  field_coordinator: 4,
  brand_agent: 3,
  client_manager: 2,
  client_user: 1,
  // Legacy aliases
  admin: 6, // alias for internal_admin
  user: 1, // alias for client_user
};

// Define role types
export type UserRole = keyof typeof ROLE_HIERARCHY;

// Define constants for role names (for consistency in string literals)
export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  INTERNAL_ADMIN: "internal_admin",
  INTERNAL_FIELD_MANAGER: "internal_field_manager",
  FIELD_COORDINATOR: "field_coordinator",
  BRAND_AGENT: "brand_agent",
  CLIENT_MANAGER: "client_manager",
  CLIENT_USER: "client_user",
  // Legacy aliases
  ADMIN: "admin",
  USER: "user",
} as const;

// Role display names for UI presentation
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  super_admin: "Super Admin",
  internal_admin: "Internal Admin",
  internal_field_manager: "Field Manager",
  field_coordinator: "Field Coordinator",
  brand_agent: "Brand Agent",
  client_manager: "Client Manager",
  client_user: "Client User",
  admin: "Admin",
  user: "User",
};

// Role hierarchy for inheritance (which roles inherit permissions from other roles)
export const ROLE_INHERITANCE: Record<UserRole, UserRole[]> = {
  super_admin: [
    "internal_admin",
    "internal_field_manager",
    "field_coordinator",
    "brand_agent",
    "client_manager",
    "client_user",
  ],
  internal_admin: [
    "internal_field_manager",
    "field_coordinator",
    "brand_agent",
  ],
  internal_field_manager: ["field_coordinator", "brand_agent"],
  field_coordinator: ["brand_agent"],
  client_manager: ["client_user"],
  brand_agent: [],
  client_user: [],
  admin: [], // Same inheritance as internal_admin
  user: [], // Same inheritance as client_user
};

// Mapping of roles to their default permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["*:*"], // Wildcard for all permissions

  internal_admin: [
    "view:*",
    "edit:*",
    "create:*",
    "delete:*",
    // Restrict certain system operations
    "!delete:system",
    "!edit:system_config",
  ],

  internal_field_manager: [
    "view:*",
    "edit:staff",
    "edit:events",
    "edit:assignments",
    "create:staff",
    "create:events",
    "create:assignments",
    "delete:events",
    "delete:assignments",
  ],

  field_coordinator: [
    "view:staff",
    "view:events",
    "view:assignments",
    "view:clients",
    "edit:assignments",
    "create:assignments",
  ],

  brand_agent: [
    "view:assignments:own",
    "view:events:assigned",
    "view:profile:own",
    "edit:profile:own",
    "edit:availability:own",
    "view:schedule:own",
  ],

  client_manager: [
    "view:events",
    "view:assignments",
    "view:billing",
    "view:staff",
    "edit:events",
    "create:events",
    "edit:organization_settings",
    "edit:organization_users",
  ],

  client_user: [
    "view:events",
    "view:assignments",
    "view:staff",
    "create:events",
  ],

  // Legacy aliases
  admin: [], // Same as internal_admin, but empty to avoid duplication
  user: [], // Same as client_user, but empty to avoid duplication
};

// Initialize roles that are aliases by copying permissions from their main role
ROLE_PERMISSIONS.admin = [...ROLE_PERMISSIONS.internal_admin];
ROLE_PERMISSIONS.user = [...ROLE_PERMISSIONS.client_user];

/**
 * Check if a user's role meets or exceeds a required role level
 * @param userRole The user's current role
 * @param requiredRole The minimum role required
 * @returns boolean indicating if the user's role is sufficient
 */
export function userHasRole(userRole: string, requiredRole: string): boolean {
  if (!userRole) return false;

  const userRank = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const requiredRank = ROLE_HIERARCHY[requiredRole as UserRole] || 0;

  return userRank >= requiredRank;
}

/**
 * Check if a permission matches a specified permission list
 * Supports wildcard matching with '*'
 * @param permission Permission to check for
 * @param permissionList List of permissions to check against
 * @returns boolean indicating if permission is granted
 */
export function permissionMatches(
  permission: string,
  permissionList: string[],
): boolean {
  // Handle empty or invalid inputs
  if (!permission || !permissionList || permissionList.length === 0) {
    return false;
  }

  // Exact match
  if (permissionList.includes(permission)) {
    return true;
  }

  // Handle negation permissions (permissions starting with !)
  // Check if this permission is explicitly denied
  const negatedPermission = `!${permission}`;
  if (permissionList.includes(negatedPermission)) {
    return false;
  }

  // Wildcard matching
  // Convert action:resource to components
  const [action, resource] = permission.split(":");

  // Check for wildcard matches
  if (permissionList.includes(`${action}:*`)) {
    // Make sure there's no negation for this specific resource
    if (!permissionList.includes(`!${action}:${resource}`)) {
      return true;
    }
  }

  if (permissionList.includes(`*:${resource}`)) {
    // Make sure there's no negation for this specific action
    if (!permissionList.includes(`!${action}:${resource}`)) {
      return true;
    }
  }

  if (permissionList.includes("*:*")) {
    // Make sure there's no specific negation
    if (
      !permissionList.includes(`!${action}:${resource}`) &&
      !permissionList.includes(`!${action}:*`) &&
      !permissionList.includes(`!*:${resource}`)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Get all permissions for a specified role, including inherited ones
 * @param role The role to get permissions for
 * @returns Array of permission strings
 */
export function getRolePermissions(role: UserRole): string[] {
  if (!role) return [];

  const directPermissions = ROLE_PERMISSIONS[role] || [];

  // Get inherited permissions from roles lower in the hierarchy
  const inheritedRoles = ROLE_INHERITANCE[role] || [];
  let inheritedPermissions: string[] = [];

  for (const inheritedRole of inheritedRoles) {
    inheritedPermissions = [
      ...inheritedPermissions,
      ...ROLE_PERMISSIONS[inheritedRole as UserRole],
    ];
  }

  // Combine and remove duplicates
  return [...new Set([...directPermissions, ...inheritedPermissions])];
}

/**
 * Get all available roles in the system
 * @returns Array of role keys
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_HIERARCHY) as UserRole[];
}

// Default export of all RBAC utilities
export default {
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  ROLE_PERMISSIONS,
  ROLE_INHERITANCE,
  USER_ROLES,
  userHasRole,
  permissionMatches,
  getRolePermissions,
  getAllRoles,
};
