/**
 * Client-side adapter for the Events service API
 */
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Event,
  EventStaffAssignment,
  EventChecklistItem,
  CreateEventParams,
  UpdateEventParams,
  CreateStaffAssignmentParams,
  UpdateStaffAssignmentParams,
  CreateChecklistItemParams,
  UpdateChecklistItemParams,
  EventFilters,
  EventStatus,
} from "@/services/events/models";

/**
 * Get all events with optional filtering
 */
export async function getAllEvents(
  filters: EventFilters = {},
): Promise<Event[]> {
  // Convert filters to query params
  const params = new URLSearchParams();

  if (filters.organizationId)
    params.append("organizationId", filters.organizationId);
  if (filters.locationId) params.append("locationId", filters.locationId);
  if (filters.createdById) params.append("createdById", filters.createdById);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.isPublic !== undefined)
    params.append("isPublic", String(filters.isPublic));
  if (filters.q) params.append("q", filters.q);

  // Handle status filter which can be single value or array
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((status) => params.append("status", status));
    } else {
      params.append("status", filters.status);
    }
  }

  // Handle eventType filter which can be single value or array
  if (filters.eventType) {
    if (Array.isArray(filters.eventType)) {
      filters.eventType.forEach((type) => params.append("eventType", type));
    } else {
      params.append("eventType", filters.eventType);
    }
  }

  const response = await apiRequest("GET", `/api/events?${params.toString()}`);
  return response.json();
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<Event> {
  const response = await apiRequest("GET", `/api/events/${id}`);
  return response.json();
}

/**
 * Create a new event
 */
export async function createEvent(data: CreateEventParams): Promise<Event> {
  const response = await apiRequest("POST", "/api/events", data);

  // Invalidate events cache
  queryClient.invalidateQueries({ queryKey: ["/api/events"] });

  return response.json();
}

/**
 * Update an existing event
 */
export async function updateEvent(
  id: string,
  data: UpdateEventParams,
): Promise<Event> {
  const response = await apiRequest("PATCH", `/api/events/${id}`, data);

  // Invalidate specific event cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/events"] });

  return response.json();
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/events/${id}`);

  // Invalidate events cache
  queryClient.invalidateQueries({ queryKey: ["/api/events"] });
  queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
}

/**
 * Submit an event for approval
 */
export async function submitEventForApproval(id: string): Promise<Event> {
  const response = await apiRequest("POST", `/api/events/${id}/submit`);

  // Invalidate specific event cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/events"] });

  return response.json();
}

/**
 * Approve an event
 */
export async function approveEvent(id: string): Promise<Event> {
  const response = await apiRequest("POST", `/api/events/${id}/approve`);

  // Invalidate specific event cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/events"] });

  return response.json();
}

/**
 * Reject an event
 */
export async function rejectEvent(id: string, reason: string): Promise<Event> {
  const response = await apiRequest("POST", `/api/events/${id}/reject`, {
    reason,
  });

  // Invalidate specific event cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/events"] });

  return response.json();
}

/**
 * Cancel an event
 */
export async function cancelEvent(id: string, reason?: string): Promise<Event> {
  const response = await apiRequest("POST", `/api/events/${id}/cancel`, {
    reason,
  });

  // Invalidate specific event cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/events"] });

  return response.json();
}

/**
 * Start an event (mark as in progress)
 */
export async function startEvent(id: string): Promise<Event> {
  const response = await apiRequest("POST", `/api/events/${id}/start`);

  // Invalidate specific event cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/events"] });

  return response.json();
}

/**
 * Complete an event
 */
export async function completeEvent(id: string): Promise<Event> {
  const response = await apiRequest("POST", `/api/events/${id}/complete`);

  // Invalidate specific event cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/events"] });

  return response.json();
}

/**
 * Finalize an event
 */
export async function finalizeEvent(id: string): Promise<Event> {
  const response = await apiRequest("POST", `/api/events/${id}/finalize`);

  // Invalidate specific event cache and the list
  queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/events"] });

  return response.json();
}

/**
 * Staff assignment methods
 */
export async function createStaffAssignment(
  data: CreateStaffAssignmentParams,
): Promise<EventStaffAssignment> {
  const response = await apiRequest("POST", "/api/event-staff", data);

  // Invalidate event staff cache
  queryClient.invalidateQueries({
    queryKey: ["/api/events", data.eventId, "staff"],
  });

  return response.json();
}

export async function updateStaffAssignment(
  id: string,
  data: UpdateStaffAssignmentParams,
): Promise<EventStaffAssignment> {
  const response = await apiRequest("PATCH", `/api/event-staff/${id}`, data);

  // Since we don't know the event ID here, we'll have to invalidate all staff queries
  queryClient.invalidateQueries({ queryKey: ["/api/event-staff"] });

  return response.json();
}

export async function deleteStaffAssignment(
  id: string,
  eventId: string,
): Promise<void> {
  await apiRequest("DELETE", `/api/event-staff/${id}`);

  // Invalidate event staff cache
  queryClient.invalidateQueries({
    queryKey: ["/api/events", eventId, "staff"],
  });
}

export async function getStaffAssignmentsForEvent(
  eventId: string,
): Promise<EventStaffAssignment[]> {
  const response = await apiRequest("GET", `/api/events/${eventId}/staff`);
  return response.json();
}

/**
 * Checklist item methods
 */
export async function createChecklistItem(
  data: CreateChecklistItemParams,
): Promise<EventChecklistItem> {
  const response = await apiRequest("POST", "/api/event-checklist", data);

  // Invalidate event checklist cache
  queryClient.invalidateQueries({
    queryKey: ["/api/events", data.eventId, "checklist"],
  });

  return response.json();
}

export async function updateChecklistItem(
  id: string,
  data: UpdateChecklistItemParams,
): Promise<EventChecklistItem> {
  const response = await apiRequest(
    "PATCH",
    `/api/event-checklist/${id}`,
    data,
  );

  // Since we don't know the event ID here, we'll have to invalidate all checklist queries
  queryClient.invalidateQueries({ queryKey: ["/api/event-checklist"] });

  return response.json();
}

export async function deleteChecklistItem(
  id: string,
  eventId: string,
): Promise<void> {
  await apiRequest("DELETE", `/api/event-checklist/${id}`);

  // Invalidate event checklist cache
  queryClient.invalidateQueries({
    queryKey: ["/api/events", eventId, "checklist"],
  });
}

export async function getChecklistItemsForEvent(
  eventId: string,
): Promise<EventChecklistItem[]> {
  const response = await apiRequest("GET", `/api/events/${eventId}/checklist`);
  return response.json();
}

/**
 * Calendar view helper that returns events in a date range
 */
export async function getEventsInRange(
  startDate: string,
  endDate: string,
  organizationId?: string,
): Promise<Event[]> {
  const filters: EventFilters = {
    startDate,
    endDate,
    status: [
      EventStatus.APPROVED,
      EventStatus.IN_PROGRESS,
      EventStatus.PENDING_APPROVAL,
    ],
  };

  if (organizationId) {
    filters.organizationId = organizationId;
  }

  return getAllEvents(filters);
}
