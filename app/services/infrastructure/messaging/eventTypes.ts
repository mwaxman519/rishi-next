/**
 * Application Event Types
 * Defines all possible event types that can be published throughout the application
 */
export enum AppEvent {
  // System events
  SYSTEM_NOTIFICATION = &quot;system.notification&quot;,
  SYSTEM_ERROR = &quot;system.error&quot;,

  // Location events
  LOCATION_CREATED = &quot;location.created&quot;,
  LOCATION_UPDATED = &quot;location.updated&quot;,
  LOCATION_DELETED = &quot;location.deleted&quot;,
  LOCATION_APPROVED = &quot;location.approved&quot;,
  LOCATION_REJECTED = &quot;location.rejected&quot;,

  // Organization events
  ORGANIZATION_CREATED = &quot;organization.created&quot;,
  ORGANIZATION_UPDATED = &quot;organization.updated&quot;,
  ORGANIZATION_DELETED = &quot;organization.deleted&quot;,

  // User events
  USER_CREATED = &quot;user.created&quot;,
  USER_UPDATED = &quot;user.updated&quot;,
  USER_DELETED = &quot;user.deleted&quot;,
  USER_ROLE_CHANGED = &quot;user.role_changed&quot;,

  // Kit events
  KIT_CREATED = &quot;kit.created&quot;,
  KIT_UPDATED = &quot;kit.updated&quot;,
  KIT_DELETED = &quot;kit.deleted&quot;,
  KIT_ASSIGNED = &quot;kit.assigned&quot;,
  KIT_UNASSIGNED = &quot;kit.unassigned&quot;,

  // Booking/Event events
  EVENT_CREATED = &quot;event.created&quot;,
  EVENT_UPDATED = &quot;event.updated&quot;,
  EVENT_DELETED = &quot;event.deleted&quot;,
  EVENT_STATUS_CHANGED = &quot;event.status_changed&quot;,
  EVENT_COMPLETED = &quot;event.completed&quot;,
  EVENT_CANCELLED = &quot;event.cancelled&quot;,

  // Staff events
  STAFF_ASSIGNED = &quot;staff.assigned&quot;,
  STAFF_UNASSIGNED = &quot;staff.unassigned&quot;,
}

/**
 * Event Payload Types
 * Defines the shape of payloads for different event types
 */

// System notification payload
export interface SystemNotificationPayload {
  title: string;
  message: string;
  level: &quot;info&quot; | &quot;warning&quot; | &quot;error&quot; | &quot;success&quot;;
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
