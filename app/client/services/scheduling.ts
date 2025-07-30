/**
 * Client-side adapter for the Scheduling service API
 */
import { apiRequest, queryClient } from &quot;@/lib/queryClient&quot;;
import {
  Schedule,
  ScheduleShift,
  ShiftAssignment,
  ScheduleTemplate,
  ShiftTemplate,
  CreateScheduleParams,
  UpdateScheduleParams,
  CreateShiftParams,
  UpdateShiftParams,
  CreateShiftAssignmentParams,
  UpdateShiftAssignmentParams,
  CreateScheduleTemplateParams,
  UpdateScheduleTemplateParams,
  CreateShiftTemplateParams,
  UpdateShiftTemplateParams,
  ScheduleStatus,
  ScheduleFilters,
  ShiftFilters,
  AssignmentFilters,
} from &quot;@/services/scheduling/models&quot;;

/**
 * Get all schedules with optional filtering
 */
export async function getAllSchedules(
  filters: ScheduleFilters = {},
): Promise<Schedule[]> {
  // Convert filters to query params
  const params = new URLSearchParams();

  if (filters.organizationId)
    params.append(&quot;organizationId&quot;, filters.organizationId);
  if (filters.bookingId) params.append(&quot;bookingId&quot;, filters.bookingId);
  if (filters.startDate) params.append(&quot;startDate&quot;, filters.startDate);
  if (filters.endDate) params.append(&quot;endDate&quot;, filters.endDate);
  if (filters.createdById) params.append(&quot;createdById&quot;, filters.createdById);
  if (filters.q) params.append(&quot;q&quot;, filters.q);

  // Handle status filter which can be single value or array
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((status) => params.append(&quot;status&quot;, status));
    } else {
      params.append(&quot;status&quot;, filters.status);
    }
  }

  const response = await apiRequest(
    &quot;GET&quot;,
    `/api/schedules?${params.toString()}`,
  );
  return response.json();
}

/**
 * Get schedule by ID
 */
export async function getScheduleById(id: string): Promise<Schedule> {
  const response = await apiRequest(&quot;GET&quot;, `/api/schedules/${id}`);
  return response.json();
}

/**
 * Create a new schedule
 */
export async function createSchedule(
  data: CreateScheduleParams,
): Promise<Schedule> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/schedules&quot;, data);

  // Invalidate schedules cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedules&quot;] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/bookings&quot;, data.bookingId, &quot;schedules&quot;],
  });

  return response.json();
}

/**
 * Update an existing schedule
 */
export async function updateSchedule(
  id: string,
  data: UpdateScheduleParams,
): Promise<Schedule> {
  const response = await apiRequest(&quot;PATCH&quot;, `/api/schedules/${id}`, data);

  // Invalidate specific schedule cache and the list
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedules&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedules&quot;] });

  // If changing booking, invalidate booking-related caches
  if (data.bookingId) {
    queryClient.invalidateQueries({
      queryKey: [&quot;/api/bookings&quot;, data.bookingId, &quot;schedules&quot;],
    });
  }

  return response.json();
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(
  id: string,
  bookingId: string,
): Promise<void> {
  await apiRequest(&quot;DELETE&quot;, `/api/schedules/${id}`);

  // Invalidate schedules cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedules&quot;] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedules&quot;, id] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/bookings&quot;, bookingId, &quot;schedules&quot;],
  });
}

/**
 * Publish a schedule
 */
export async function publishSchedule(
  id: string,
  notifyStaff: boolean = false,
): Promise<Schedule> {
  const response = await apiRequest(&quot;POST&quot;, `/api/schedules/${id}/publish`, {
    notifyStaff,
  });

  // Invalidate specific schedule cache and the list
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedules&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedules&quot;] });

  return response.json();
}

/**
 * Finalize a schedule
 */
export async function finalizeSchedule(id: string): Promise<Schedule> {
  const response = await apiRequest(&quot;POST&quot;, `/api/schedules/${id}/finalize`);

  // Invalidate specific schedule cache and the list
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedules&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedules&quot;] });

  return response.json();
}

/**
 * Get shifts with optional filtering
 */
export async function getShifts(
  filters: ShiftFilters = {},
): Promise<ScheduleShift[]> {
  // Convert filters to query params
  const params = new URLSearchParams();

  if (filters.scheduleId) params.append(&quot;scheduleId&quot;, filters.scheduleId);
  if (filters.date) params.append(&quot;date&quot;, filters.date);
  if (filters.startDateRange)
    params.append(&quot;startDateRange&quot;, filters.startDateRange);
  if (filters.endDateRange) params.append(&quot;endDateRange&quot;, filters.endDateRange);
  if (filters.locationId) params.append(&quot;locationId&quot;, filters.locationId);
  if (filters.requiredSkillId)
    params.append(&quot;requiredSkillId&quot;, filters.requiredSkillId);
  if (filters.q) params.append(&quot;q&quot;, filters.q);

  const response = await apiRequest(&quot;GET&quot;, `/api/shifts?${params.toString()}`);
  return response.json();
}

/**
 * Get shift by ID
 */
export async function getShiftById(id: string): Promise<ScheduleShift> {
  const response = await apiRequest(&quot;GET&quot;, `/api/shifts/${id}`);
  return response.json();
}

/**
 * Get shifts for a schedule
 */
export async function getShiftsForSchedule(
  scheduleId: string,
): Promise<ScheduleShift[]> {
  const response = await apiRequest(
    &quot;GET&quot;,
    `/api/schedules/${scheduleId}/shifts`,
  );
  return response.json();
}

/**
 * Create a new shift
 */
export async function createShift(
  data: CreateShiftParams,
): Promise<ScheduleShift> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/shifts&quot;, data);

  // Invalidate shifts cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shifts&quot;] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/schedules&quot;, data.scheduleId, &quot;shifts&quot;],
  });

  return response.json();
}

/**
 * Update an existing shift
 */
export async function updateShift(
  id: string,
  scheduleId: string,
  data: UpdateShiftParams,
): Promise<ScheduleShift> {
  const response = await apiRequest(&quot;PATCH&quot;, `/api/shifts/${id}`, data);

  // Invalidate specific shift cache and the list
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shifts&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shifts&quot;] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/schedules&quot;, scheduleId, &quot;shifts&quot;],
  });

  return response.json();
}

/**
 * Delete a shift
 */
export async function deleteShift(
  id: string,
  scheduleId: string,
): Promise<void> {
  await apiRequest(&quot;DELETE&quot;, `/api/shifts/${id}`);

  // Invalidate shifts cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shifts&quot;] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shifts&quot;, id] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/schedules&quot;, scheduleId, &quot;shifts&quot;],
  });
}

/**
 * Get assignments with optional filtering
 */
export async function getAssignments(
  filters: AssignmentFilters = {},
): Promise<ShiftAssignment[]> {
  // Convert filters to query params
  const params = new URLSearchParams();

  if (filters.scheduleId) params.append(&quot;scheduleId&quot;, filters.scheduleId);
  if (filters.shiftId) params.append(&quot;shiftId&quot;, filters.shiftId);
  if (filters.staffId) params.append(&quot;staffId&quot;, filters.staffId);
  if (filters.status) params.append(&quot;status&quot;, filters.status);
  if (filters.date) params.append(&quot;date&quot;, filters.date);
  if (filters.startDateRange)
    params.append(&quot;startDateRange&quot;, filters.startDateRange);
  if (filters.endDateRange) params.append(&quot;endDateRange&quot;, filters.endDateRange);

  const response = await apiRequest(
    &quot;GET&quot;,
    `/api/shift-assignments?${params.toString()}`,
  );
  return response.json();
}

/**
 * Get assignment by ID
 */
export async function getAssignmentById(id: string): Promise<ShiftAssignment> {
  const response = await apiRequest(&quot;GET&quot;, `/api/shift-assignments/${id}`);
  return response.json();
}

/**
 * Get assignments for a shift
 */
export async function getAssignmentsForShift(
  shiftId: string,
): Promise<ShiftAssignment[]> {
  const response = await apiRequest(
    &quot;GET&quot;,
    `/api/shifts/${shiftId}/assignments`,
  );
  return response.json();
}

/**
 * Get assignments for a staff member
 */
export async function getAssignmentsForStaff(
  staffId: string,
): Promise<ShiftAssignment[]> {
  const response = await apiRequest(&quot;GET&quot;, `/api/staff/${staffId}/assignments`);
  return response.json();
}

/**
 * Create a new assignment
 */
export async function createAssignment(
  data: CreateShiftAssignmentParams,
): Promise<ShiftAssignment> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/shift-assignments&quot;, data);

  // Invalidate assignments cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/shifts&quot;, data.shiftId, &quot;assignments&quot;],
  });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, data.staffId, &quot;assignments&quot;],
  });

  return response.json();
}

/**
 * Update an existing assignment
 */
export async function updateAssignment(
  id: string,
  shiftId: string,
  staffId: string,
  data: UpdateShiftAssignmentParams,
): Promise<ShiftAssignment> {
  const response = await apiRequest(
    &quot;PATCH&quot;,
    `/api/shift-assignments/${id}`,
    data,
  );

  // Invalidate specific assignment cache and related lists
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/shifts&quot;, shiftId, &quot;assignments&quot;],
  });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, staffId, &quot;assignments&quot;],
  });

  return response.json();
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(
  id: string,
  shiftId: string,
  staffId: string,
): Promise<void> {
  await apiRequest(&quot;DELETE&quot;, `/api/shift-assignments/${id}`);

  // Invalidate assignments cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;, id] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/shifts&quot;, shiftId, &quot;assignments&quot;],
  });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/staff&quot;, staffId, &quot;assignments&quot;],
  });
}

/**
 * Confirm an assignment (for staff to accept)
 */
export async function confirmAssignment(id: string): Promise<ShiftAssignment> {
  const response = await apiRequest(
    &quot;POST&quot;,
    `/api/shift-assignments/${id}/confirm`,
  );

  // Invalidate assignment-related caches
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;] });

  return response.json();
}

/**
 * Decline an assignment (for staff to decline)
 */
export async function declineAssignment(
  id: string,
  reason: string,
): Promise<ShiftAssignment> {
  const response = await apiRequest(
    &quot;POST&quot;,
    `/api/shift-assignments/${id}/decline`,
    { reason },
  );

  // Invalidate assignment-related caches
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;] });

  return response.json();
}

/**
 * Check in for an assignment
 */
export async function checkInForAssignment(
  id: string,
): Promise<ShiftAssignment> {
  const response = await apiRequest(
    &quot;POST&quot;,
    `/api/shift-assignments/${id}/check-in`,
  );

  // Invalidate assignment-related caches
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;] });

  return response.json();
}

/**
 * Check out from an assignment
 */
export async function checkOutFromAssignment(
  id: string,
): Promise<ShiftAssignment> {
  const response = await apiRequest(
    &quot;POST&quot;,
    `/api/shift-assignments/${id}/check-out`,
  );

  // Invalidate assignment-related caches
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-assignments&quot;] });

  return response.json();
}

/**
 * Get schedule templates for an organization
 */
export async function getScheduleTemplates(
  organizationId: string,
): Promise<ScheduleTemplate[]> {
  const response = await apiRequest(
    &quot;GET&quot;,
    `/api/schedule-templates?organizationId=${organizationId}`,
  );
  return response.json();
}

/**
 * Get schedule template by ID
 */
export async function getScheduleTemplateById(
  id: string,
): Promise<ScheduleTemplate> {
  const response = await apiRequest(&quot;GET&quot;, `/api/schedule-templates/${id}`);
  return response.json();
}

/**
 * Create a new schedule template
 */
export async function createScheduleTemplate(
  data: CreateScheduleTemplateParams,
): Promise<ScheduleTemplate> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/schedule-templates&quot;, data);

  // Invalidate templates cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedule-templates&quot;] });

  return response.json();
}

/**
 * Update an existing schedule template
 */
export async function updateScheduleTemplate(
  id: string,
  data: UpdateScheduleTemplateParams,
): Promise<ScheduleTemplate> {
  const response = await apiRequest(
    &quot;PATCH&quot;,
    `/api/schedule-templates/${id}`,
    data,
  );

  // Invalidate specific template cache and the list
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedule-templates&quot;, id] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedule-templates&quot;] });

  return response.json();
}

/**
 * Delete a schedule template
 */
export async function deleteScheduleTemplate(
  id: string,
  organizationId: string,
): Promise<void> {
  await apiRequest(&quot;DELETE&quot;, `/api/schedule-templates/${id}`);

  // Invalidate templates cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedule-templates&quot;] });
  queryClient.invalidateQueries({ queryKey: [&quot;/api/schedule-templates&quot;, id] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/organizations&quot;, organizationId, &quot;schedule-templates&quot;],
  });
}

/**
 * Get shift templates for a schedule template
 */
export async function getShiftTemplates(
  templateId: string,
): Promise<ShiftTemplate[]> {
  const response = await apiRequest(
    &quot;GET&quot;,
    `/api/schedule-templates/${templateId}/shift-templates`,
  );
  return response.json();
}

/**
 * Create a new shift template
 */
export async function createShiftTemplate(
  data: CreateShiftTemplateParams,
): Promise<ShiftTemplate> {
  const response = await apiRequest(&quot;POST&quot;, &quot;/api/shift-templates&quot;, data);

  // Invalidate shift templates cache
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/schedule-templates&quot;, data.templateId, &quot;shift-templates&quot;],
  });

  return response.json();
}

/**
 * Update an existing shift template
 */
export async function updateShiftTemplate(
  id: string,
  templateId: string,
  data: UpdateShiftTemplateParams,
): Promise<ShiftTemplate> {
  const response = await apiRequest(
    &quot;PATCH&quot;,
    `/api/shift-templates/${id}`,
    data,
  );

  // Invalidate specific shift template cache and the list
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-templates&quot;, id] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/schedule-templates&quot;, templateId, &quot;shift-templates&quot;],
  });

  return response.json();
}

/**
 * Delete a shift template
 */
export async function deleteShiftTemplate(
  id: string,
  templateId: string,
): Promise<void> {
  await apiRequest(&quot;DELETE&quot;, `/api/shift-templates/${id}`);

  // Invalidate shift templates cache
  queryClient.invalidateQueries({ queryKey: [&quot;/api/shift-templates&quot;, id] });
  queryClient.invalidateQueries({
    queryKey: [&quot;/api/schedule-templates&quot;, templateId, &quot;shift-templates&quot;],
  });
}
