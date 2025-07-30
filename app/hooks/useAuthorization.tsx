&quot;use client&quot;;

import { useQuery } from &quot;@tanstack/react-query&quot;;
import { Permission } from &quot;../services/rbac/models&quot;;
import { getUserPermissions, hasPermission } from &quot;../client/services/rbac&quot;;
import { useOrganization } from &quot;../contexts/OrganizationProvider&quot;;

/**
 * Hook for checking user permissions
 */
export function useAuthorization() {
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  // Fetch the current user's permissions
  const {
    data: permissions = [],
    isLoading,
    error,
  } = useQuery<Permission[] | { permissions?: Permission[] }>({
    queryKey: [&quot;/api/auth/permissions&quot;, organizationId],
    queryFn: () => getUserPermissions(organizationId),
    // Keep cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Check if the user has a specific permission
   */
  const can = (permission: Permission): boolean => {
    if (isLoading || error) {
      return false;
    }

    // Extract the parts of the permission
    const [action, resource] = permission.split(&quot;:&quot;);

    // Handle development mode where permissions is an object
    const permissionList = Array.isArray(permissions)
      ? permissions
      : permissions?.permissions || [];

    // Check for direct permission match
    if (permissionList.includes(permission)) {
      return true;
    }

    // Check for wildcard permission (e.g., manage:* would grant manage:users)
    return permissionList.includes(`${action}:*`);
  };

  /**
   * Check if the user has all of the specified permissions
   */
  const canAll = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every((permission) => can(permission));
  };

  /**
   * Check if the user has any of the specified permissions
   */
  const canAny = (possiblePermissions: Permission[]): boolean => {
    return possiblePermissions.some((permission) => can(permission));
  };

  /**
   * Check permission asynchronously (for backend validation)
   */
  const checkPermission = async (permission: Permission): Promise<boolean> => {
    return hasPermission(permission, organizationId);
  };

  return {
    permissions,
    can,
    canAll,
    canAny,
    checkPermission,
    isLoading,
    error,
  };
}
