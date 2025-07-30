/**
 * Client-side adapter for the Organization service API
 */
import { apiRequest, queryClient } from &quot;@/lib/queryClient&quot;;
import {
  Organization,
  OrganizationUser,
  UserOrganization,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  OrganizationUserParams,
  OrganizationFilters,
} from &quot;@/services/organizations/models&quot;;

/**
 * Get all organizations
 */
export async function getAllOrganizations(): Promise<Organization[]> {
  const response = await apiRequest(&quot;GET&quot;, &quot;/api/organizations&quot;);
  return response.json();
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string): Promise<Organization> {
  const response = await apiRequest(&quot;GET&quot;, `/api/organizations/${id}`);
  return response.json();
}

/**
 * Create a new organization
 */
export async function createOrganization(
  data: CreateOrganizationParams,
): Promise<Organization> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/organizations&quot;, data);

  // Invalidate organizations cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/organizations&quot;] });

  return response.json();
}

/**
 * Update an existing organization
 */
export async function updateOrganization(
  id: string,
  data: UpdateOrganizationParams,
): Promise<Organization> {
  const response = await apiRequest(&quot;PATCH&quot;, `/api/organizations/${id}`, data);

  // Invalidate specific organization cache and the list
  queryClient.invalidateQueries({ queryKey: [&quot;/api/organizations&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/organizations&quot;] });

  return response.json();
}

/**
 * Delete an organization
 */
export async function deleteOrganization(id: string): Promise<void> {
  await apiRequest(&quot;DELETE&quot;, `/api/organizations/${id}`);

  // Invalidate organizations cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/organizations&quot;] });
}

/**
 * Search organizations with filters
 */
export async function searchOrganizations(
  filters: OrganizationFilters,
): Promise<Organization[]> {
  // Convert filters to query params
  const params = new URLSearchParams();

  if (filters.name) params.append(&quot;name&quot;, filters.name);
  if (filters.type) params.append(&quot;type&quot;, filters.type);
  if (filters.tier) params.append(&quot;tier&quot;, filters.tier);
  if (filters.isActive !== undefined)
    params.append(&quot;isActive&quot;, String(filters.isActive));
  if (filters.parentOrganizationId)
    params.append(&quot;parentOrganizationId&quot;, filters.parentOrganizationId);

  const response = await apiRequest(
    &quot;GET&quot;,
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
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/organizations/users&quot;, params);

  // Invalidate organization users cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/organizations&quot;, params.organizationId, &quot;users&quot;],
  });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/organizations/user&quot;] });

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
    &quot;PATCH&quot;,
    `/api/organizations/${organizationId}/users/${userId}`,
    { roleId },
  );

  // Invalidate organization users cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/organizations&quot;, organizationId, &quot;users&quot;],
  });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/organizations/user&quot;] });

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
    &quot;DELETE&quot;,
    `/api/organizations/${organizationId}/users/${userId}`,
  );

  // Invalidate organization users cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/organizations&quot;, organizationId, &quot;users&quot;],
  });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/organizations/user&quot;] });
}

/**
 * Get all organizations for current user
 */
export async function getUserOrganizations(): Promise<UserOrganization[]> {
  const response = await apiRequest(&quot;GET&quot;, &quot;/api/organizations/user&quot;);
  return response.json();
}

/**
 * Get all users in an organization
 */
export async function getOrganizationUsers(
  organizationId: string,
): Promise<OrganizationUser[]> {
  const response = await apiRequest(
    &quot;GET&quot;,
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
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/auth/switch-organization&quot;, {
    organizationId,
  });

  // Invalidate user and permissions cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/user&quot;] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/auth/permissions&quot;] });

  return response.json();
}
