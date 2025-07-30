import { useQuery } from &quot;@tanstack/react-query&quot;;
import { useOrganization } from &quot;../contexts/OrganizationProvider&quot;;
import { useAuth } from &quot;./useAuth&quot;;
import { queryClient } from &quot;../lib/queryClient&quot;;

// Type definition for organization permissions
type OrganizationPermissionsResponse = {
  organizationId: number;
  organizationType: string;
  organizationTier: string | null;
  permissions: Record<string, boolean>;
};

/**
 * Hook to check if specific organization permissions are allowed
 * Automatically considers the current organization context
 */
export function useOrganizationPermissions(permissions?: string[]) {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  const organizationId = currentOrganization?.id;
  const permissionsParam = permissions?.join(&quot;,&quot;);

  // Construct query key with organization ID and permissions
  const queryKey = [
    &quot;/api/rbac/organization-permissions&quot;,
    { organizationId, permissions: permissionsParam },
  ];

  // Query for the organization permissions
  const query = useQuery<OrganizationPermissionsResponse>({
    queryKey,
    queryFn: async () => {
      if (!organizationId) throw new Error(&quot;Organization ID is required&quot;);

      const url = new URL(
        &quot;/api/rbac/organization-permissions&quot;,
        window.location.origin,
      );
      url.searchParams.append(&quot;organizationId&quot;, organizationId.toString());
      if (permissionsParam) {
        url.searchParams.append(&quot;permissions&quot;, permissionsParam);
      }

      const res = await fetch(url.toString(), {
        credentials: &quot;include&quot;,
      });

      if (res.status === 401) {
        throw new Error(&quot;Unauthorized&quot;);
      }

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || &quot;Failed to fetch organization permissions&quot;);
      }

      return await res.json();
    },
    enabled: !!user && !!organizationId,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Helper function to check if a specific permission is allowed
  const isAllowed = (permission: string): boolean => {
    if (!query.data) return false;
    return !!query.data.permissions[permission];
  };

  // Helper function to check if all specified permissions are allowed
  const areAllAllowed = (perms: string[]): boolean => {
    return perms.every(isAllowed);
  };

  // Helper function to check if any of the specified permissions are allowed
  const isAnyAllowed = (perms: string[]): boolean => {
    return perms.some(isAllowed);
  };

  // Helper to invalidate permissions (used after updating permissions)
  const invalidatePermissions = () => {
    queryClient.invalidateQueries({
      queryKey: [&quot;/api/rbac/organization-permissions&quot;],
    });
  };

  return {
    ...query,
    isAllowed,
    areAllAllowed,
    isAnyAllowed,
    invalidatePermissions,
    organizationType: query.data?.organizationType,
    organizationTier: query.data?.organizationTier,
    organizationPermissions: query.data?.permissions || {},
  };
}
