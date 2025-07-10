/**
 * Role-Based Access Control (RBAC) role definitions
 */

// Export the role type for consistent typing
export type UserRole = string;

// Role definition interface
export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

// Define constants for role names
export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  INTERNAL_ADMIN: "internal_admin",
  INTERNAL_FIELD_MANAGER: "internal_field_manager",
  FIELD_COORDINATOR: "field_coordinator",
  BRAND_AGENT: "brand_agent",
  CLIENT_MANAGER: "client_manager",
  CLIENT_USER: "client_user",
} as const;

// Define role hierarchy
// Each role inherits permissions from roles lower in the hierarchy
export const ROLE_HIERARCHY: Record<string, string[]> = {
  [USER_ROLES.SUPER_ADMIN]: [
    USER_ROLES.INTERNAL_ADMIN,
    USER_ROLES.INTERNAL_FIELD_MANAGER,
    USER_ROLES.FIELD_COORDINATOR,
    USER_ROLES.BRAND_AGENT,
    USER_ROLES.CLIENT_MANAGER,
    USER_ROLES.CLIENT_USER,
  ],
  [USER_ROLES.INTERNAL_ADMIN]: [
    USER_ROLES.INTERNAL_FIELD_MANAGER,
    USER_ROLES.FIELD_COORDINATOR,
    USER_ROLES.BRAND_AGENT,
  ],
  [USER_ROLES.INTERNAL_FIELD_MANAGER]: [
    USER_ROLES.FIELD_COORDINATOR,
    USER_ROLES.BRAND_AGENT,
  ],
  [USER_ROLES.FIELD_COORDINATOR]: [USER_ROLES.BRAND_AGENT],
  [USER_ROLES.CLIENT_MANAGER]: [USER_ROLES.CLIENT_USER],
  [USER_ROLES.BRAND_AGENT]: [],
  [USER_ROLES.CLIENT_USER]: [],
};

// Define role-based permissions
// Follow the pattern: 'action:resource'
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [USER_ROLES.SUPER_ADMIN]: [
    "view:system",
    "edit:system",
    "view:organization",
    "edit:organization",
    "create:organization",
    "delete:organization",
    "view:user",
    "edit:user",
    "create:user",
    "delete:user",
    "view:region",
    "edit:region",
    "create:region",
    "delete:region",
    "view:feature",
    "edit:feature",
    "view:audit",
    "view:all_organizations",
    "view:locations",
    "create:locations",
    "edit:locations",
    "delete:locations",
    "approve:locations",
    "reject:locations",
  ],
  [USER_ROLES.INTERNAL_ADMIN]: [
    "view:organization",
    "edit:organization",
    "view:user",
    "edit:user",
    "create:user",
    "view:region",
    "edit:region",
    "create:region",
    "view:feature",
    "edit:feature",
    "view:audit",
    "view:locations",
    "create:locations",
    "edit:locations",
    "approve:locations",
    "reject:locations",
  ],
  [USER_ROLES.INTERNAL_FIELD_MANAGER]: [
    "view:organization",
    "view:user",
    "edit:user",
    "create:user",
    "view:region",
    "edit:region",
    "view:feature",
    "view:locations",
    "create:locations",
    "edit:locations",
  ],
  [USER_ROLES.FIELD_COORDINATOR]: [
    "view:organization",
    "view:user",
    "view:region",
    "view:feature",
    "view:locations",
  ],
  [USER_ROLES.BRAND_AGENT]: [
    "view:organization",
    "view:profile",
    "edit:profile",
    "view:locations",
  ],
  [USER_ROLES.CLIENT_MANAGER]: [
    "view:organization",
    "edit:organization",
    "view:user",
    "edit:user",
    "create:user",
    "view:region",
    "view:locations",
    "create:locations",
    "edit:locations",
  ],
  [USER_ROLES.CLIENT_USER]: [
    "view:organization",
    "view:profile",
    "edit:profile",
    "view:locations",
  ],
};

// Check if a role has a specific permission
export function roleHasPermission(role: string, permission: string): boolean {
  if (!ROLE_PERMISSIONS[role]) {
    return false;
  }

  // Direct permission check
  if (ROLE_PERMISSIONS[role].includes(permission)) {
    return true;
  }

  // Check inherited permissions
  for (const inheritedRole of ROLE_HIERARCHY[role] || []) {
    if (ROLE_PERMISSIONS[inheritedRole]?.includes(permission)) {
      return true;
    }
  }

  return false;
}

// Check if one role is higher than another in the hierarchy
export function isRoleHigherThan(role: string, targetRole: string): boolean {
  if (role === targetRole) {
    return false; // Same role
  }

  // Check if target role is in the hierarchy of the role
  return (ROLE_HIERARCHY[role] || []).includes(targetRole);
}

// Get all permissions for a role including inherited permissions
export function getAllPermissionsForRole(role: string): string[] {
  if (!ROLE_PERMISSIONS[role]) {
    return [];
  }

  // Start with direct permissions
  const permissions = [...ROLE_PERMISSIONS[role]];

  // Add inherited permissions
  for (const inheritedRole of ROLE_HIERARCHY[role] || []) {
    permissions.push(...(ROLE_PERMISSIONS[inheritedRole] || []));
  }

  // Remove duplicates
  return [...new Set(permissions)];
}

// Get all defined roles with their details
export function getAllRoles(): RoleDefinition[] {
  return Object.entries(USER_ROLES).map(([key, id]) => {
    const name = key
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const permissions = getAllPermissionsForRole(id);

    return {
      id,
      name,
      description: getRoleDescription(id),
      permissions,
    };
  });
}

// Helper function to get role description
function getRoleDescription(roleId: string): string {
  switch (roleId) {
    case USER_ROLES.SUPER_ADMIN:
      return "Full system access with complete control over all organizations, users, and configurations.";
    case USER_ROLES.INTERNAL_ADMIN:
      return "Administrative access within the internal organization, can manage users and configurations.";
    case USER_ROLES.INTERNAL_FIELD_MANAGER:
      return "Manages field operations and coordinates field staff across organizations.";
    case USER_ROLES.FIELD_COORDINATOR:
      return "Coordinates day-to-day field activities and oversees brand agents.";
    case USER_ROLES.BRAND_AGENT:
      return "Represents brands in the field and performs assigned tasks and activities.";
    case USER_ROLES.CLIENT_MANAGER:
      return "Manages client organization settings and users.";
    case USER_ROLES.CLIENT_USER:
      return "Regular user within a client organization with limited access.";
    default:
      return "Role with custom permissions.";
  }
}

// Check if a role has a specific permission (alias of roleHasPermission for RBAC page)
export function checkRoleHasPermission(
  roleId: string,
  permission: string,
): boolean {
  return roleHasPermission(roleId, permission);
}
