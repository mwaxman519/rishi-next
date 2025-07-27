/**
 * Client-side adapter for the RBAC service API
 */
import { apiRequest, queryClient } from "../../lib/queryClient";
import {
  Role,
  UserRole,
  OrganizationPermission,
  Permission,
  CreateRoleParams,
  UpdateRoleParams,
  UserRoleParams,
  OrganizationPermissionParams,
} from "../../services/rbac/models";

/**
 * Get all roles
 */
export async function getAllRoles(): Promise<Role[]> {
  const response = await apiRequest("GET", "/api/rbac/roles");
  return response.json();
}

/**
 * Get role by ID
 */
export async function getRoleById(id: string): Promise<Role> {
  const response = await apiRequest("GET", `/api/rbac/roles/${id}`);
  return response.json();
}

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleParams): Promise<Role> {
  const response = await apiRequest("POST", "/api/rbac/roles", data);

  // Invalidate roles cache
  queryClient.invalidateQueries({ queryKey: ["/api/rbac/roles"] });

  return response.json();
}

/**
 * Update an existing role
 */
export async function updateRole(
  id: string,
  data: UpdateRoleParams,
): Promise<Role> {
  const response = await apiRequest("PATCH", `/api/rbac/roles/${id}`, data);

  // Invalidate specific role cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/rbac/roles", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/rbac/roles"] });

  return response.json();
}

/**
 * Delete a role
 */
export async function deleteRole(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/rbac/roles/${id}`);

  // Invalidate roles cache
  queryClient.invalidateQueries({ queryKey: ["/api/rbac/roles"] });
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

  const response = await apiRequest("GET", url);
  return response.json();
}

/**
 * Get current user's permissions
 */
export async function getUserPermissions(
  organizationId?: string,
): Promise<Permission[]> {
  // In development mode, return mock permissions directly to avoid fetch issues
  if (process.env.NODE_ENV === "development") {
    const mockPermissions = [
      "view:all",
      "create:all",
      "edit:all",
      "delete:all",
      "view:users",
      "create:users",
      "edit:users",
      "delete:users",
      "view:organizations",
      "create:organizations",
      "edit:organizations",
      "delete:organizations",
      "view:events",
      "create:events",
      "edit:events",
      "delete:events",
      "view:locations",
      "create:locations",
      "edit:locations",
      "delete:locations",
      "view:reports",
      "create:reports",
      "admin:access",
    ];

    return Promise.resolve({
      permissions: mockPermissions,
      role: "super_admin",
    } as any);
  }

  let url = "/api/auth/permissions";

  if (organizationId) {
    url += `?organizationId=${organizationId}`;
  }

  try {
    const response = await apiRequest("GET", url);
    return response.json();
  } catch (error) {
    console.warn("Failed to fetch permissions, using fallback:", error);
    // Return basic permissions as fallback
    return Promise.resolve({
      permissions: ["view:events", "view:locations"],
      role: "brand_agent",
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
  if (process.env.NODE_ENV === "development") {
    return Promise.resolve(true);
  }

  let url = `/api/auth/check-permission?permission=${encodeURIComponent(permission)}`;

  if (organizationId) {
    url += `&organizationId=${organizationId}`;
  }

  try {
    const response = await apiRequest("GET", url);
    const data = await response.json();
    return data.hasPermission;
  } catch (error) {
    console.warn("Failed to check permission, denying access:", error);
    return false;
  }
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(
  params: UserRoleParams,
): Promise<UserRole> {
  const response = await apiRequest("POST", "/api/rbac/users/roles", params);

  // Invalidate user roles cache
  queryClient.invalidateQueries({
    queryKey: ["/api/rbac/users", params.userId, "roles"],
  });
  queryClient.invalidateQueries({ queryKey: ["/api/auth/permissions"] });

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

  await apiRequest("DELETE", url);

  // Invalidate user roles cache
  queryClient.invalidateQueries({
    queryKey: ["/api/rbac/users", userId, "roles"],
  });
  queryClient.invalidateQueries({ queryKey: ["/api/auth/permissions"] });
}

/**
 * Get organization permissions
 */
export async function getOrganizationPermissions(
  organizationId: string,
): Promise<OrganizationPermission[]> {
  const response = await apiRequest(
    "GET",
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
    "POST",
    "/api/rbac/organizations/permissions",
    params,
  );

  // Invalidate organization permissions cache
  queryClient.invalidateQueries({
    queryKey: ["/api/rbac/organizations", params.organizationId, "permissions"],
  });
  queryClient.invalidateQueries({ queryKey: ["/api/auth/permissions"] });

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
    "DELETE",
    `/api/rbac/organizations/${organizationId}/permissions/${encodeURIComponent(permission)}`,
  );

  // Invalidate organization permissions cache
  queryClient.invalidateQueries({
    queryKey: ["/api/rbac/organizations", organizationId, "permissions"],
  });
  queryClient.invalidateQueries({ queryKey: ["/api/auth/permissions"] });
}
