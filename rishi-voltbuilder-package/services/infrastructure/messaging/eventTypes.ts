/**
 * Application Event Types
 * Defines all possible event types that can be published throughout the application
 */
export enum AppEvent {
  // System events
  SYSTEM_NOTIFICATION = "system.notification",
  SYSTEM_ERROR = "system.error",

  // Location events
  LOCATION_CREATED = "location.created",
  LOCATION_UPDATED = "location.updated",
  LOCATION_DELETED = "location.deleted",
  LOCATION_APPROVED = "location.approved",
  LOCATION_REJECTED = "location.rejected",

  // Organization events
  ORGANIZATION_CREATED = "organization.created",
  ORGANIZATION_UPDATED = "organization.updated",
  ORGANIZATION_DELETED = "organization.deleted",

  // User events
  USER_CREATED = "user.created",
  USER_UPDATED = "user.updated",
  USER_DELETED = "user.deleted",
  USER_ROLE_CHANGED = "user.role_changed",

  // Kit events
  KIT_CREATED = "kit.created",
  KIT_UPDATED = "kit.updated",
  KIT_DELETED = "kit.deleted",
  KIT_ASSIGNED = "kit.assigned",
  KIT_UNASSIGNED = "kit.unassigned",

  // Booking/Event events
  EVENT_CREATED = "event.created",
  EVENT_UPDATED = "event.updated",
  EVENT_DELETED = "event.deleted",
  EVENT_STATUS_CHANGED = "event.status_changed",
  EVENT_COMPLETED = "event.completed",
  EVENT_CANCELLED = "event.cancelled",

  // Staff events
  STAFF_ASSIGNED = "staff.assigned",
  STAFF_UNASSIGNED = "staff.unassigned",
}

/**
 * Event Payload Types
 * Defines the shape of payloads for different event types
 */

// System notification payload
export interface SystemNotificationPayload {
  title: string;
  message: string;
  level: "info" | "warning" | "error" | "success";
  timestamp: string;
  metadata?: Record<string, any>;
}

// Location approval payload
export interface LocationApprovalPayload {
  locationId: string;
  name: string;
  approvedById: string;
  approvedByName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Location rejection payload
export interface LocationRejectionPayload {
  locationId: string;
  name: string;
  rejectionReason: string;
  rejectedById: string;
  rejectedByName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Generic event payload
export interface GenericEventPayload {
  [key: string]: any;
}

// Union type for all possible payloads
export type EventPayload =
  | SystemNotificationPayload
  | LocationApprovalPayload
  | LocationRejectionPayload
  | GenericEventPayload;

// Event message structure
export interface EventMessage {
  type: AppEvent;
  payload: EventPayload;
  source?: string;
  timestamp: string;
}
