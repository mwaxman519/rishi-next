import { UserRole, Resource, Permission, RBACUser } from &quot;.&quot;;
import { getRolePermissions } from &quot;./permissions&quot;;

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
  if (user.role === &quot;super_admin&quot;) return true;

  const userPermissions = getRolePermissions(user.role);

  // Check if the user has the specified permission for the resource - NO FALLBACK
  const resourcePermissions = userPermissions[resource];
  if (!resourcePermissions) {
    return false;
  }
  return resourcePermissions.includes(permission);
}
