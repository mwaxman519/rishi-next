/**
 * Application Event Types and Definitions
 *
 * This module defines the event types and their payload structures
 * for the application's event-driven communication.
 */

/**
 * Available event types in the system
 */
export enum AppEvent {
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
  USER_PERMISSION_CHANGED = "user.permission_changed",

  // System events
  SYSTEM_STARTED = "system.started",
  SYSTEM_ERROR = "system.error",

  // Infrastructure events
  CIRCUIT_BREAKER_OPENED = "infrastructure.circuit_breaker_opened",
  CIRCUIT_BREAKER_CLOSED = "infrastructure.circuit_breaker_closed",
  CIRCUIT_BREAKER_HALF_OPEN = "infrastructure.circuit_breaker_half_open",
}

/**
 * Event metadata included with each event
 */
export interface EventMetadata {
  eventId: string;
  timestamp: string;
  priority: "low" | "normal" | "high";
  source?: string;
  correlationId?: string;
  userId?: string;
  organizationId?: string;
}

/**
 * Location event payloads
 */
export interface LocationCreatedPayload {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  organizationId: string;
  createdBy: string;
  status: "pending" | "approved" | "rejected";
}

export interface LocationUpdatedPayload {
  id: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  updatedBy: string;
  updatedFields: string[];
}

export interface LocationDeletedPayload {
  id: string;
  deletedBy: string;
  reason?: string;
}

export interface LocationApprovalPayload {
  id: string;
  approvedBy: string;
  comments?: string;
}

export interface LocationRejectionPayload {
  id: string;
  rejectedBy: string;
  reason: string;
}

/**
 * Organization event payloads
 */
export interface OrganizationCreatedPayload {
  id: string;
  name: string;
  createdBy: string;
}

export interface OrganizationUpdatedPayload {
  id: string;
  name?: string;
  updatedBy: string;
  updatedFields: string[];
}

export interface OrganizationDeletedPayload {
  id: string;
  deletedBy: string;
  reason?: string;
}

/**
 * User event payloads
 */
export interface UserCreatedPayload {
  id: string;
  username: string;
  organizationId: string;
  role: string;
}

export interface UserUpdatedPayload {
  id: string;
  updatedFields: string[];
  updatedBy: string;
}

export interface UserDeletedPayload {
  id: string;
  deletedBy: string;
  reason?: string;
}

export interface UserPermissionChangedPayload {
  id: string;
  oldRole: string;
  newRole: string;
  changedBy: string;
}

/**
 * System event payloads
 */
export interface SystemStartedPayload {
  version: string;
  environment: string;
  startTime: string;
}

export interface SystemErrorPayload {
  message: string;
  stack?: string;
  code?: string;
  component?: string;
}

/**
 * Infrastructure event payloads
 */
export interface CircuitBreakerStateChangedPayload {
  name: string;
  previousState: string;
  newState: string;
  failureCount: number;
  timestamp: string;
}

/**
 * Map of event types to their payload types
 */
export interface EventPayload {
  [AppEvent.LOCATION_CREATED]: LocationCreatedPayload;
  [AppEvent.LOCATION_UPDATED]: LocationUpdatedPayload;
  [AppEvent.LOCATION_DELETED]: LocationDeletedPayload;
  [AppEvent.LOCATION_APPROVED]: LocationApprovalPayload;
  [AppEvent.LOCATION_REJECTED]: LocationRejectionPayload;

  [AppEvent.ORGANIZATION_CREATED]: OrganizationCreatedPayload;
  [AppEvent.ORGANIZATION_UPDATED]: OrganizationUpdatedPayload;
  [AppEvent.ORGANIZATION_DELETED]: OrganizationDeletedPayload;

  [AppEvent.USER_CREATED]: UserCreatedPayload;
  [AppEvent.USER_UPDATED]: UserUpdatedPayload;
  [AppEvent.USER_DELETED]: UserDeletedPayload;
  [AppEvent.USER_PERMISSION_CHANGED]: UserPermissionChangedPayload;

  [AppEvent.SYSTEM_STARTED]: SystemStartedPayload;
  [AppEvent.SYSTEM_ERROR]: SystemErrorPayload;

  [AppEvent.CIRCUIT_BREAKER_OPENED]: CircuitBreakerStateChangedPayload;
  [AppEvent.CIRCUIT_BREAKER_CLOSED]: CircuitBreakerStateChangedPayload;
  [AppEvent.CIRCUIT_BREAKER_HALF_OPEN]: CircuitBreakerStateChangedPayload;
}
