import { UserRole, Resource, Permission, RBACUser } from ".";
import { getRolePermissions } from "./permissions";

/**
 * Checks if a user has the specified permission for a resource
 *
 * @param user The user to check permissions for
 * @param resource The resource to check permissions for
 * @param permission The specific permission to check
 * @returns boolean indicating if the user has the permission
 */
export function hasPermission(
  user: RBACUser | null | undefined,
  resource: Resource,
  permission: Permission,
): boolean {
  if (!user) return false;

  // Super admins have all permissions
  if (user.role === "super_admin") return true;

  const userPermissions = getRolePermissions(user.role);

  // Check if the user has the specified permission for the resource
  return userPermissions[resource]?.includes(permission) || false;
}
