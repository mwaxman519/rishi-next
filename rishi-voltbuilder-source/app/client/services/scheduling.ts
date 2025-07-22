/**
 * Client-side adapter for the Scheduling service API
 */
import { apiRequest, queryClient } from "@/lib/queryClient";
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
} from "@/services/scheduling/models";

/**
 * Get all schedules with optional filtering
 */
export async function getAllSchedules(
  filters: ScheduleFilters = {},
): Promise<Schedule[]> {
  // Convert filters to query params
  const params = new URLSearchParams();

  if (filters.organizationId)
    params.append("organizationId", filters.organizationId);
  if (filters.bookingId) params.append("bookingId", filters.bookingId);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.createdById) params.append("createdById", filters.createdById);
  if (filters.q) params.append("q", filters.q);

  // Handle status filter which can be single value or array
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((status) => params.append("status", status));
    } else {
      params.append("status", filters.status);
    }
  }

  const response = await apiRequest(
    "GET",
    `/api/schedules?${params.toString()}`,
  );
  return response.json();
}

/**
 * Get schedule by ID
 */
export async function getScheduleById(id: string): Promise<Schedule> {
  const response = await apiRequest("GET", `/api/schedules/${id}`);
  return response.json();
}

/**
 * Create a new schedule
 */
export async function createSchedule(
  data: CreateScheduleParams,
): Promise<Schedule> {
  const response = await apiRequest("POST", "/api/schedules", data);

  // Invalidate schedules cache
  queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
  queryClient.invalidateQueries({
    queryKey: ["/api/bookings", data.bookingId, "schedules"],
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
  const response = await apiRequest("PATCH", `/api/schedules/${id}`, data);

  // Invalidate specific schedule cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/schedules", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });

  // If changing booking, invalidate booking-related caches
  if (data.bookingId) {
    queryClient.invalidateQueries({
      queryKey: ["/api/bookings", data.bookingId, "schedules"],
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
  await apiRequest("DELETE", `/api/schedules/${id}`);

  // Invalidate schedules cache
  queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
  queryClient.invalidateQueries({ queryKey: ["/api/schedules", id] });
  queryClient.invalidateQueries({
    queryKey: ["/api/bookings", bookingId, "schedules"],
  });
}

/**
 * Publish a schedule
 */
export async function publishSchedule(
  id: string,
  notifyStaff: boolean = false,
): Promise<Schedule> {
  const response = await apiRequest("POST", `/api/schedules/${id}/publish`, {
    notifyStaff,
  });

  // Invalidate specific schedule cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/schedules", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });

  return response.json();
}

/**
 * Finalize a schedule
 */
export async function finalizeSchedule(id: string): Promise<Schedule> {
  const response = await apiRequest("POST", `/api/schedules/${id}/finalize`);

  // Invalidate specific schedule cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/schedules", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });

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

  if (filters.scheduleId) params.append("scheduleId", filters.scheduleId);
  if (filters.date) params.append("date", filters.date);
  if (filters.startDateRange)
    params.append("startDateRange", filters.startDateRange);
  if (filters.endDateRange) params.append("endDateRange", filters.endDateRange);
  if (filters.locationId) params.append("locationId", filters.locationId);
  if (filters.requiredSkillId)
    params.append("requiredSkillId", filters.requiredSkillId);
  if (filters.q) params.append("q", filters.q);

  const response = await apiRequest("GET", `/api/shifts?${params.toString()}`);
  return response.json();
}

/**
 * Get shift by ID
 */
export async function getShiftById(id: string): Promise<ScheduleShift> {
  const response = await apiRequest("GET", `/api/shifts/${id}`);
  return response.json();
}

/**
 * Get shifts for a schedule
 */
export async function getShiftsForSchedule(
  scheduleId: string,
): Promise<ScheduleShift[]> {
  const response = await apiRequest(
    "GET",
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
  const response = await apiRequest("POST", "/api/shifts", data);

  // Invalidate shifts cache
  queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
  queryClient.invalidateQueries({
    queryKey: ["/api/schedules", data.scheduleId, "shifts"],
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
  const response = await apiRequest("PATCH", `/api/shifts/${id}`, data);

  // Invalidate specific shift cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/shifts", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
  queryClient.invalidateQueries({
    queryKey: ["/api/schedules", scheduleId, "shifts"],
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
  await apiRequest("DELETE", `/api/shifts/${id}`);

  // Invalidate shifts cache
  queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
  queryClient.invalidateQueries({ queryKey: ["/api/shifts", id] });
  queryClient.invalidateQueries({
    queryKey: ["/api/schedules", scheduleId, "shifts"],
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

  if (filters.scheduleId) params.append("scheduleId", filters.scheduleId);
  if (filters.shiftId) params.append("shiftId", filters.shiftId);
  if (filters.staffId) params.append("staffId", filters.staffId);
  if (filters.status) params.append("status", filters.status);
  if (filters.date) params.append("date", filters.date);
  if (filters.startDateRange)
    params.append("startDateRange", filters.startDateRange);
  if (filters.endDateRange) params.append("endDateRange", filters.endDateRange);

  const response = await apiRequest(
    "GET",
    `/api/shift-assignments?${params.toString()}`,
  );
  return response.json();
}

/**
 * Get assignment by ID
 */
export async function getAssignmentById(id: string): Promise<ShiftAssignment> {
  const response = await apiRequest("GET", `/api/shift-assignments/${id}`);
  return response.json();
}

/**
 * Get assignments for a shift
 */
export async function getAssignmentsForShift(
  shiftId: string,
): Promise<ShiftAssignment[]> {
  const response = await apiRequest(
    "GET",
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
  const response = await apiRequest("GET", `/api/staff/${staffId}/assignments`);
  return response.json();
}

/**
 * Create a new assignment
 */
export async function createAssignment(
  data: CreateShiftAssignmentParams,
): Promise<ShiftAssignment> {
  const response = await apiRequest("POST", "/api/shift-assignments", data);

  // Invalidate assignments cache
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] });
  queryClient.invalidateQueries({
    queryKey: ["/api/shifts", data.shiftId, "assignments"],
  });
  queryClient.invalidateQueries({
    queryKey: ["/api/staff", data.staffId, "assignments"],
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
    "PATCH",
    `/api/shift-assignments/${id}`,
    data,
  );

  // Invalidate specific assignment cache and related lists
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] });
  queryClient.invalidateQueries({
    queryKey: ["/api/shifts", shiftId, "assignments"],
  });
  queryClient.invalidateQueries({
    queryKey: ["/api/staff", staffId, "assignments"],
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
  await apiRequest("DELETE", `/api/shift-assignments/${id}`);

  // Invalidate assignments cache
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] });
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments", id] });
  queryClient.invalidateQueries({
    queryKey: ["/api/shifts", shiftId, "assignments"],
  });
  queryClient.invalidateQueries({
    queryKey: ["/api/staff", staffId, "assignments"],
  });
}

/**
 * Confirm an assignment (for staff to accept)
 */
export async function confirmAssignment(id: string): Promise<ShiftAssignment> {
  const response = await apiRequest(
    "POST",
    `/api/shift-assignments/${id}/confirm`,
  );

  // Invalidate assignment-related caches
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] });

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
    "POST",
    `/api/shift-assignments/${id}/decline`,
    { reason },
  );

  // Invalidate assignment-related caches
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] });

  return response.json();
}

/**
 * Check in for an assignment
 */
export async function checkInForAssignment(
  id: string,
): Promise<ShiftAssignment> {
  const response = await apiRequest(
    "POST",
    `/api/shift-assignments/${id}/check-in`,
  );

  // Invalidate assignment-related caches
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] });

  return response.json();
}

/**
 * Check out from an assignment
 */
export async function checkOutFromAssignment(
  id: string,
): Promise<ShiftAssignment> {
  const response = await apiRequest(
    "POST",
    `/api/shift-assignments/${id}/check-out`,
  );

  // Invalidate assignment-related caches
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] });

  return response.json();
}

/**
 * Get schedule templates for an organization
 */
export async function getScheduleTemplates(
  organizationId: string,
): Promise<ScheduleTemplate[]> {
  const response = await apiRequest(
    "GET",
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
  const response = await apiRequest("GET", `/api/schedule-templates/${id}`);
  return response.json();
}

/**
 * Create a new schedule template
 */
export async function createScheduleTemplate(
  data: CreateScheduleTemplateParams,
): Promise<ScheduleTemplate> {
  const response = await apiRequest("POST", "/api/schedule-templates", data);

  // Invalidate templates cache
  queryClient.invalidateQueries({ queryKey: ["/api/schedule-templates"] });

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
    "PATCH",
    `/api/schedule-templates/${id}`,
    data,
  );

  // Invalidate specific template cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/schedule-templates", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/schedule-templates"] });

  return response.json();
}

/**
 * Delete a schedule template
 */
export async function deleteScheduleTemplate(
  id: string,
  organizationId: string,
): Promise<void> {
  await apiRequest("DELETE", `/api/schedule-templates/${id}`);

  // Invalidate templates cache
  queryClient.invalidateQueries({ queryKey: ["/api/schedule-templates"] });
  queryClient.invalidateQueries({ queryKey: ["/api/schedule-templates", id] });
  queryClient.invalidateQueries({
    queryKey: ["/api/organizations", organizationId, "schedule-templates"],
  });
}

/**
 * Get shift templates for a schedule template
 */
export async function getShiftTemplates(
  templateId: string,
): Promise<ShiftTemplate[]> {
  const response = await apiRequest(
    "GET",
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
  const response = await apiRequest("POST", "/api/shift-templates", data);

  // Invalidate shift templates cache
  queryClient.invalidateQueries({
    queryKey: ["/api/schedule-templates", data.templateId, "shift-templates"],
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
    "PATCH",
    `/api/shift-templates/${id}`,
    data,
  );

  // Invalidate specific shift template cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/shift-templates", id] });
  queryClient.invalidateQueries({
    queryKey: ["/api/schedule-templates", templateId, "shift-templates"],
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
  await apiRequest("DELETE", `/api/shift-templates/${id}`);

  // Invalidate shift templates cache
  queryClient.invalidateQueries({ queryKey: ["/api/shift-templates", id] });
  queryClient.invalidateQueries({
    queryKey: ["/api/schedule-templates", templateId, "shift-templates"],
  });
}
