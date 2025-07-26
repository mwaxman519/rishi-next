import { UserRole, PermissionMap } from ".";

/**
 * Returns the permissions for a specific role
 *
 * @param role The user role to get permissions for
 * @returns A map of resources to arrays of permissions
 */
export function getRolePermissions(role: UserRole): PermissionMap {
  switch (role) {
    case "super_admin":
      return {
        locations: [
          "create",
          "read",
          "update",
          "delete",
          "approve",
          "reject",
          "manage",
          "export",
        ],
        bookings: [
          "create",
          "read",
          "update",
          "delete",
          "approve",
          "reject",
          "manage",
          "export",
        ],
        organizations: [
          "create",
          "read",
          "update",
          "delete",
          "manage",
          "export",
        ],
        users: ["create", "read", "update", "delete", "manage", "export"],
        reports: ["create", "read", "update", "delete", "manage", "export"],
      };

    case "admin":
      return {
        locations: [
          "create",
          "read",
          "update",
          "delete",
          "approve",
          "reject",
          "manage",
          "export",
        ],
        bookings: [
          "create",
          "read",
          "update",
          "delete",
          "approve",
          "reject",
          "manage",
          "export",
        ],
        organizations: ["read"],
        users: ["create", "read", "update", "delete", "manage"],
        reports: ["create", "read", "update", "export"],
      };

    case "manager":
      return {
        locations: ["create", "read", "update", "approve", "reject", "export"],
        bookings: ["create", "read", "update", "approve", "reject", "export"],
        organizations: ["read"],
        users: ["read"],
        reports: ["read", "export"],
      };

    case "staff":
      return {
        locations: ["read", "create"],
        bookings: ["read", "create", "update"],
        organizations: ["read"],
        users: ["read"],
        reports: ["read"],
      };

    case "client":
      return {
        locations: ["read"],
        bookings: ["read", "create"],
        organizations: [],
        users: [],
        reports: [],
      };

    case "user":
    default:
      return {
        locations: ["read"],
        bookings: ["read"],
        organizations: [],
        users: [],
        reports: [],
      };
  }
}
