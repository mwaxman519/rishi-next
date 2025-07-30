/**
 * Client-side adapter for the Staff service API
 */
import { apiRequest, queryClient } from &quot;@/lib/queryClient&quot;;
import {
  StaffMember,
  StaffSkill,
  StaffAvailability,
  TimeOffRequest,
  CreateStaffMemberParams,
  UpdateStaffMemberParams,
  CreateStaffSkillParams,
  UpdateStaffSkillParams,
  CreateAvailabilityParams,
  UpdateAvailabilityParams,
  CreateTimeOffRequestParams,
  UpdateTimeOffRequestParams,
  StaffFilters,
  StaffStatus,
} from &quot;@/services/staff/models&quot;;

/**
 * Get all staff members with optional filtering
 */
export async function getAllStaffMembers(
  filters: StaffFilters = {},
): Promise<StaffMember[]> {
  // Convert filters to query params
  const params = new URLSearchParams();

  if (filters.organizationId)
    params.append(&quot;organizationId&quot;, filters.organizationId);
  if (filters.department) params.append(&quot;department&quot;, filters.department);
  if (filters.skillId) params.append(&quot;skillId&quot;, filters.skillId);
  if (filters.skillLevel) params.append(&quot;skillLevel&quot;, filters.skillLevel);
  if (filters.q) params.append(&quot;q&quot;, filters.q);
  if (filters.availableOn) params.append(&quot;availableOn&quot;, filters.availableOn);
  if (filters.availableStartTime)
    params.append(&quot;availableStartTime&quot;, filters.availableStartTime);
  if (filters.availableEndTime)
    params.append(&quot;availableEndTime&quot;, filters.availableEndTime);

  // Handle status filter which can be single value or array
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((status) => params.append(&quot;status&quot;, status));
    } else {
      params.append(&quot;status&quot;, filters.status);
    }
  }

  // Handle type filter which can be single value or array
  if (filters.type) {
    if (Array.isArray(filters.type)) {
      filters.type.forEach((type) => params.append(&quot;type&quot;, type));
    } else {
      params.append(&quot;type&quot;, filters.type);
    }
  }

  const response = await apiRequest(&quot;GET&quot;, `/api/staff?${params.toString()}`);
  return response.json();
}

/**
 * Get staff member by ID
 */
export async function getStaffMemberById(id: string): Promise<StaffMember> {
  const response = await apiRequest(&quot;GET&quot;, `/api/staff/${id}`);
  return response.json();
}

/**
 * Get staff member by user ID
 */
export async function getStaffMemberByUserId(
  userId: string,
): Promise<StaffMember> {
  const response = await apiRequest(&quot;GET&quot;, `/api/staff/user/${userId}`);
  return response.json();
}

/**
 * Get current user's staff profile
 */
export async function getCurrentUserStaffProfile(): Promise<StaffMember> {
  const response = await apiRequest(&quot;GET&quot;, &quot;/api/staff/me&quot;);
  return response.json();
}

/**
 * Create a new staff member
 */
export async function createStaffMember(
  data: CreateStaffMemberParams,
): Promise<StaffMember> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/staff&quot;, data);

  // Invalidate staff cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/staff&quot;] });

  return response.json();
}

/**
 * Update an existing staff member
 */
export async function updateStaffMember(
  id: string,
  data: UpdateStaffMemberParams,
): Promise<StaffMember> {
  const response = await apiRequest(&quot;PATCH&quot;, `/api/staff/${id}`, data);

  // Invalidate specific staff cache and the list
  queryClient.invalidateQueries({ queryKey: [&quot;/api/staff&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/staff&quot;] });

  return response.json();
}

/**
 * Delete a staff member
 */
export async function deleteStaffMember(id: string): Promise<void> {
  await apiRequest(&quot;DELETE&quot;, `/api/staff/${id}`);

  // Invalidate staff cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/staff&quot;] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/staff&quot;, id] });
}

/**
 * Change staff member status
 */
export async function changeStaffStatus(
  id: string,
  status: StaffStatus,
  terminationDate?: string,
): Promise<StaffMember> {
  const data = { status, terminationDate };
  const response = await apiRequest(&quot;POST&quot;, `/api/staff/${id}/status`, data);

  // Invalidate specific staff cache and the list
  queryClient.invalidateQueries({ queryKey: [&quot;/api/staff&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/staff&quot;] });

  return response.json();
}

/**
 * Skills methods
 */
export async function getStaffSkills(staffId: string): Promise<StaffSkill[]> {
  const response = await apiRequest(&quot;GET&quot;, `/api/staff/${staffId}/skills`);
  return response.json();
}

export async function addStaffSkill(
  data: CreateStaffSkillParams,
): Promise<StaffSkill> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/staff-skills&quot;, data);

  // Invalidate staff skills cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, data.staffId, &quot;skills&quot;],
  });

  return response.json();
}

export async function updateStaffSkill(
  id: string,
  staffId: string,
  data: UpdateStaffSkillParams,
): Promise<StaffSkill> {
  const response = await apiRequest(&quot;PATCH&quot;, `/api/staff-skills/${id}`, data);

  // Invalidate staff skills cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, staffId, &quot;skills&quot;],
  });

  return response.json();
}

export async function removeStaffSkill(
  id: string,
  staffId: string,
): Promise<void> {
  await apiRequest(&quot;DELETE&quot;, `/api/staff-skills/${id}`);

  // Invalidate staff skills cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, staffId, &quot;skills&quot;],
  });
}

/**
 * Availability methods
 */
export async function getStaffAvailability(
  staffId: string,
): Promise<StaffAvailability[]> {
  const response = await apiRequest(
    &quot;GET&quot;,
    `/api/staff/${staffId}/availability`,
  );
  return response.json();
}

export async function addStaffAvailability(
  data: CreateAvailabilityParams,
): Promise<StaffAvailability> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/staff-availability&quot;, data);

  // Invalidate staff availability cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, data.staffId, &quot;availability&quot;],
  });

  return response.json();
}

export async function updateStaffAvailability(
  id: string,
  staffId: string,
  data: UpdateAvailabilityParams,
): Promise<StaffAvailability> {
  const response = await apiRequest(
    &quot;PATCH&quot;,
    `/api/staff-availability/${id}`,
    data,
  );

  // Invalidate staff availability cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, staffId, &quot;availability&quot;],
  });

  return response.json();
}

export async function removeStaffAvailability(
  id: string,
  staffId: string,
): Promise<void> {
  await apiRequest(&quot;DELETE&quot;, `/api/staff-availability/${id}`);

  // Invalidate staff availability cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, staffId, &quot;availability&quot;],
  });
}

/**
 * Time off request methods
 */
export async function getTimeOffRequests(
  staffId: string,
): Promise<TimeOffRequest[]> {
  const response = await apiRequest(&quot;GET&quot;, `/api/staff/${staffId}/time-off`);
  return response.json();
}

export async function getAllPendingTimeOffRequests(): Promise<
  TimeOffRequest[]
> {
  const response = await apiRequest(&quot;GET&quot;, &quot;/api/time-off?status=pending&quot;);
  return response.json();
}

export async function createTimeOffRequest(
  data: CreateTimeOffRequestParams,
): Promise<TimeOffRequest> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/time-off&quot;, data);

  // Invalidate time off requests cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, data.staffId, &quot;time-off&quot;],
  });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/time-off&quot;] });

  return response.json();
}

export async function updateTimeOffRequest(
  id: string,
  staffId: string,
  data: UpdateTimeOffRequestParams,
): Promise<TimeOffRequest> {
  const response = await apiRequest(&quot;PATCH&quot;, `/api/time-off/${id}`, data);

  // Invalidate time off requests cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, staffId, &quot;time-off&quot;],
  });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/time-off&quot;] });

  return response.json();
}

export async function approveTimeOffRequest(
  id: string,
  notes?: string,
): Promise<TimeOffRequest> {
  const response = await apiRequest(&quot;POST&quot;, `/api/time-off/${id}/approve`, {
    notes,
  });

  // Invalidate time off requests cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/time-off&quot;] });

  return response.json();
}

export async function rejectTimeOffRequest(
  id: string,
  rejectionReason: string,
  notes?: string,
): Promise<TimeOffRequest> {
  const response = await apiRequest(&quot;POST&quot;, `/api/time-off/${id}/reject`, {
    rejectionReason,
    notes,
  });

  // Invalidate time off requests cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/time-off&quot;] });

  return response.json();
}

export async function cancelTimeOffRequest(
  id: string,
  staffId: string,
): Promise<TimeOffRequest> {
  const response = await apiRequest(&quot;POST&quot;, `/api/time-off/${id}/cancel`);

  // Invalidate time off requests cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, staffId, &quot;time-off&quot;],
  });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/time-off&quot;] });

  return response.json();
}

/**
 * Check staff availability for a specific time slot
 */
export async function checkStaffAvailability(
  staffId: string,
  date: string,
  startTime: string,
  endTime: string,
): Promise<boolean> {
  const params = new URLSearchParams({
    date,
    startTime,
    endTime,
  });

  const response = await apiRequest(
    &quot;GET&quot;,
    `/api/staff/${staffId}/check-availability?${params.toString()}`,
  );
  const data = await response.json();
  return data.available;
}
