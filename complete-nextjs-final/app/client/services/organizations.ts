/**
 * Client-side adapter for the Organization service API
 */
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Organization,
  OrganizationUser,
  UserOrganization,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  OrganizationUserParams,
  OrganizationFilters,
} from "@/services/organizations/models";

/**
 * Get all organizations
 */
export async function getAllOrganizations(): Promise<Organization[]> {
  const response = await apiRequest("GET", "/api/organizations");
  return response.json();
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string): Promise<Organization> {
  const response = await apiRequest("GET", `/api/organizations/${id}`);
  return response.json();
}

/**
 * Create a new organization
 */
export async function createOrganization(
  data: CreateOrganizationParams,
): Promise<Organization> {
  const response = await apiRequest("POST", "/api/organizations", data);

  // Invalidate organizations cache
  queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });

  return response.json();
}

/**
 * Update an existing organization
 */
export async function updateOrganization(
  id: string,
  data: UpdateOrganizationParams,
): Promise<Organization> {
  const response = await apiRequest("PATCH", `/api/organizations/${id}`, data);

  // Invalidate specific organization cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/organizations", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });

  return response.json();
}

/**
 * Delete an organization
 */
export async function deleteOrganization(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/organizations/${id}`);

  // Invalidate organizations cache
  queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
}

/**
 * Search organizations with filters
 */
export async function searchOrganizations(
  filters: OrganizationFilters,
): Promise<Organization[]> {
  // Convert filters to query params
  const params = new URLSearchParams();

  if (filters.name) params.append("name", filters.name);
  if (filters.type) params.append("type", filters.type);
  if (filters.tier) params.append("tier", filters.tier);
  if (filters.isActive !== undefined)
    params.append("isActive", String(filters.isActive));
  if (filters.parentOrganizationId)
    params.append("parentOrganizationId", filters.parentOrganizationId);

  const response = await apiRequest(
    "GET",
    `/api/organizations/search?${params.toString()}`,
  );
  return response.json();
}

/**
 * Add user to organization
 */
export async function addUserToOrganization(
  params: OrganizationUserParams,
): Promise<OrganizationUser> {
  const response = await apiRequest("POST", "/api/organizations/users", params);

  // Invalidate organization users cache
  queryClient.invalidateQueries({
    queryKey: ["/api/organizations", params.organizationId, "users"],
  });
  queryClient.invalidateQueries({ queryKey: ["/api/organizations/user"] });

  return response.json();
}

/**
 * Update user's role in an organization
 */
export async function updateUserRole(
  organizationId: string,
  userId: string,
  roleId: string,
): Promise<OrganizationUser> {
  const response = await apiRequest(
    "PATCH",
    `/api/organizations/${organizationId}/users/${userId}`,
    { roleId },
  );

  // Invalidate organization users cache
  queryClient.invalidateQueries({
    queryKey: ["/api/organizations", organizationId, "users"],
  });
  queryClient.invalidateQueries({ queryKey: ["/api/organizations/user"] });

  return response.json();
}

/**
 * Remove user from organization
 */
export async function removeUserFromOrganization(
  organizationId: string,
  userId: string,
): Promise<void> {
  await apiRequest(
    "DELETE",
    `/api/organizations/${organizationId}/users/${userId}`,
  );

  // Invalidate organization users cache
  queryClient.invalidateQueries({
    queryKey: ["/api/organizations", organizationId, "users"],
  });
  queryClient.invalidateQueries({ queryKey: ["/api/organizations/user"] });
}

/**
 * Get all organizations for current user
 */
export async function getUserOrganizations(): Promise<UserOrganization[]> {
  const response = await apiRequest("GET", "/api/organizations/user");
  return response.json();
}

/**
 * Get all users in an organization
 */
export async function getOrganizationUsers(
  organizationId: string,
): Promise<OrganizationUser[]> {
  const response = await apiRequest(
    "GET",
    `/api/organizations/${organizationId}/users`,
  );
  return response.json();
}

/**
 * Switch user's context to a different organization
 */
export async function switchOrganization(
  organizationId: string,
): Promise<UserOrganization> {
  const response = await apiRequest("POST", "/api/auth/switch-organization", {
    organizationId,
  });

  // Invalidate user and permissions cache
  queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  queryClient.invalidateQueries({ queryKey: ["/api/auth/permissions"] });

  return response.json();
}
