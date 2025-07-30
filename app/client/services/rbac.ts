/**
 * Client-side adapter for the RBAC service API
 */
import { apiRequest, queryClient } from &quot;../../lib/queryClient&quot;;
import {
  Role,
  UserRole,
  OrganizationPermission,
  Permission,
  CreateRoleParams,
  UpdateRoleParams,
  UserRoleParams,
  OrganizationPermissionParams,
} from &quot;../../services/rbac/models&quot;;

/**
 * Get all roles
 */
export async function getAllRoles(): Promise<Role[]> {
  const response = await apiRequest(&quot;GET&quot;, &quot;/api/rbac/roles&quot;);
  return response.json();
}

/**
 * Get role by ID
 */
export async function getRoleById(id: string): Promise<Role> {
  const response = await apiRequest(&quot;GET&quot;, `/api/rbac/roles/${id}`);
  return response.json();
}

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleParams): Promise<Role> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/rbac/roles&quot;, data);

  // Invalidate roles cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/rbac/roles&quot;] });

  return response.json();
}

/**
 * Update an existing role
 */
export async function updateRole(
  id: string,
  data: UpdateRoleParams,
): Promise<Role> {
  const response = await apiRequest(&quot;PATCH&quot;, `/api/rbac/roles/${id}`, data);

  // Invalidate specific role cache and the list
  queryClient.invalidateQueries({ queryKey: [&quot;/api/rbac/roles&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/rbac/roles&quot;] });

  return response.json();
}

/**
 * Delete a role
 */
export async function deleteRole(id: string): Promise<void> {
  await apiRequest(&quot;DELETE&quot;, `/api/rbac/roles/${id}`);

  // Invalidate roles cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/rbac/roles&quot;] });
}

/**
 * Get user roles
 */
export async function getUserRoles(
  userId: string,
  organizationId?: string,
): Promise<UserRole[]> {
  let url = `/api/rbac/users/${userId}/roles`;

  if (organizationId) {
    url += `?organizationId=${organizationId}`;
  }

  const response = await apiRequest(&quot;GET&quot;, url);
  return response.json();
}

/**
 * Get current user's permissions
 */
export async function getUserPermissions(
  organizationId?: string,
): Promise<Permission[]> {
  // In development mode, return mock permissions directly to avoid fetch issues
  if (process.env.NODE_ENV === &quot;development&quot;) {
    const mockPermissions = [
      &quot;view:all&quot;,
      &quot;create:all&quot;,
      &quot;edit:all&quot;,
      &quot;delete:all&quot;,
      &quot;view:users&quot;,
      &quot;create:users&quot;,
      &quot;edit:users&quot;,
      &quot;delete:users&quot;,
      &quot;view:organizations&quot;,
      &quot;create:organizations&quot;,
      &quot;edit:organizations&quot;,
      &quot;delete:organizations&quot;,
      &quot;view:events&quot;,
      &quot;create:events&quot;,
      &quot;edit:events&quot;,
      &quot;delete:events&quot;,
      &quot;view:locations&quot;,
      &quot;create:locations&quot;,
      &quot;edit:locations&quot;,
      &quot;delete:locations&quot;,
      &quot;view:reports&quot;,
      &quot;create:reports&quot;,
      &quot;admin:access&quot;,
    ];

    return Promise.resolve({
      permissions: mockPermissions,
      role: &quot;super_admin&quot;,
    } as any);
  }

  let url = &quot;/api/auth/permissions&quot;;

  if (organizationId) {
    url += `?organizationId=${organizationId}`;
  }

  try {
    const response = await apiRequest(&quot;GET&quot;, url);
    return response.json();
  } catch (error) {
    console.warn(&quot;Failed to fetch permissions, using fallback:&quot;, error);
    // Return basic permissions as fallback
    return Promise.resolve({
      permissions: [&quot;view:events&quot;, &quot;view:locations&quot;],
      role: &quot;brand_agent&quot;,
    } as any);
  }
}

/**
 * Check if the current user has a specific permission
 */
export async function hasPermission(
  permission: string,
  organizationId?: string,
): Promise<boolean> {
  // In development mode, super admin has all permissions
  if (process.env.NODE_ENV === &quot;development&quot;) {
    return Promise.resolve(true);
  }

  let url = `/api/auth/check-permission?permission=${encodeURIComponent(permission)}`;

  if (organizationId) {
    url += `&organizationId=${organizationId}`;
  }

  try {
    const response = await apiRequest(&quot;GET&quot;, url);
    
    // Check if response is ok
    if (!response.ok) {
      console.warn(`Permission check failed with status ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    return data.hasPermission || false;
  } catch (error) {
    console.warn(&quot;Failed to check permission, denying access:&quot;, error);
    return false;
  }
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(
  params: UserRoleParams,
): Promise<UserRole> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/rbac/users/roles&quot;, params);

  // Invalidate user roles cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/rbac/users&quot;, params.userId, &quot;roles&quot;],
  });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/auth/permissions&quot;] });

  return response.json();
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(
  userId: string,
  roleId: string,
  organizationId?: string,
): Promise<void> {
  let url = `/api/rbac/users/${userId}/roles/${roleId}`;

  if (organizationId) {
    url += `?organizationId=${organizationId}`;
  }

  await apiRequest(&quot;DELETE&quot;, url);

  // Invalidate user roles cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/rbac/users&quot;, userId, &quot;roles&quot;],
  });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/auth/permissions&quot;] });
}

/**
 * Get organization permissions
 */
export async function getOrganizationPermissions(
  organizationId: string,
): Promise<OrganizationPermission[]> {
  const response = await apiRequest(
    &quot;GET&quot;,
    `/api/rbac/organizations/${organizationId}/permissions`,
  );
  return response.json();
}

/**
 * Set organization permission
 */
export async function setOrganizationPermission(
  params: OrganizationPermissionParams,
): Promise<OrganizationPermission> {
  const response = await apiRequest(
    &quot;POST&quot;,
    &quot;/api/rbac/organizations/permissions&quot;,
    params,
  );

  // Invalidate organization permissions cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/rbac/organizations&quot;, params.organizationId, &quot;permissions&quot;],
  });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/auth/permissions&quot;] });

  return response.json();
}

/**
 * Remove organization permission
 */
export async function removeOrganizationPermission(
  organizationId: string,
  permission: string,
): Promise<void> {
  await apiRequest(
    &quot;DELETE&quot;,
    `/api/rbac/organizations/${organizationId}/permissions/${encodeURIComponent(permission)}`,
  );

  // Invalidate organization permissions cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/rbac/organizations&quot;, organizationId, &quot;permissions&quot;],
  });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/auth/permissions&quot;] });
}
