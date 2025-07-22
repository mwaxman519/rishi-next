/**
 * Event Types for Rishi Platform Event System
 * Defines all event types used throughout the application
 */

export interface BaseEvent {
  type: string;
  userId: string;
  organizationId: string;
  timestamp: Date;
  correlationId: string;
  metadata?: Record<string, any>;
}

// Location Events
export interface LocationEvent extends BaseEvent {
  type: 'location.created' | 'location.updated' | 'location.deleted' | 'location.approved' | 'location.rejected';
  locationId: string;
}

export interface LocationCreatedEvent extends LocationEvent {
  type: 'location.created';
  location: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    placeId?: string;
  };
}

export interface LocationUpdatedEvent extends LocationEvent {
  type: 'location.updated';
  changes: Record<string, any>;
}

// Booking Events
export interface BookingEvent extends BaseEvent {
  type: 'booking.created' | 'booking.updated' | 'booking.cancelled' | 'booking.confirmed' | 'booking.completed';
  bookingId: string;
}

export interface BookingCreatedEvent extends BookingEvent {
  type: 'booking.created';
  booking: {
    id: string;
    locationId: string;
    startTime: Date;
    endTime: Date;
    staffCount: number;
  };
}

// Staff Events
export interface StaffEvent extends BaseEvent {
  type: 'staff.assigned' | 'staff.unassigned' | 'staff.availability_updated' | 'staff.performance_updated';
  staffId: string;
}

export interface StaffAssignedEvent extends StaffEvent {
  type: 'staff.assigned';
  bookingId: string;
  role: string;
}

// User Events
export interface UserEvent extends BaseEvent {
  type: 'user.created' | 'user.updated' | 'user.deactivated' | 'user.role_changed';
  targetUserId: string;
}

export interface UserCreatedEvent extends UserEvent {
  type: 'user.created';
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

// Organization Events
export interface OrganizationEvent extends BaseEvent {
  type: 'organization.created' | 'organization.updated' | 'organization.member_added' | 'organization.member_removed';
}

export interface OrganizationMemberAddedEvent extends OrganizationEvent {
  type: 'organization.member_added';
  memberId: string;
  role: string;
}

// Inventory Events
export interface InventoryEvent extends BaseEvent {
  type: 'inventory.kit_created' | 'inventory.kit_updated' | 'inventory.kit_assigned' | 'inventory.kit_returned';
  kitId: string;
}

export interface InventoryKitCreatedEvent extends InventoryEvent {
  type: 'inventory.kit_created';
  kit: {
    id: string;
    templateId: string;
    name: string;
    items: Array<{ itemId: string; quantity: number }>;
  };
}

// System Events
export interface SystemEvent extends BaseEvent {
  type: 'system.health_check' | 'system.error' | 'system.performance_alert';
}

export interface SystemHealthCheckEvent extends SystemEvent {
  type: 'system.health_check';
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: Array<{ name: string; status: string; message?: string }>;
}

// Union type of all events
export type PlatformEvent = 
  | LocationCreatedEvent
  | LocationUpdatedEvent
  | LocationEvent
  | BookingCreatedEvent
  | BookingEvent
  | StaffAssignedEvent
  | StaffEvent
  | UserCreatedEvent
  | UserEvent
  | OrganizationMemberAddedEvent
  | OrganizationEvent
  | InventoryKitCreatedEvent
  | InventoryEvent
  | SystemHealthCheckEvent
  | SystemEvent;

// Export alias for backward compatibility
export type AppEvent = PlatformEvent;

// Event type constants
export const EVENT_TYPES = {
  LOCATION: {
    CREATED: 'location.created',
    UPDATED: 'location.updated',
    DELETED: 'location.deleted',
    APPROVED: 'location.approved',
    REJECTED: 'location.rejected'
  },
  BOOKING: {
    CREATED: 'booking.created',
    UPDATED: 'booking.updated',
    CANCELLED: 'booking.cancelled',
    CONFIRMED: 'booking.confirmed',
    COMPLETED: 'booking.completed'
  },
  STAFF: {
    ASSIGNED: 'staff.assigned',
    UNASSIGNED: 'staff.unassigned',
    AVAILABILITY_UPDATED: 'staff.availability_updated',
    PERFORMANCE_UPDATED: 'staff.performance_updated'
  },
  USER: {
    CREATED: 'user.created',
    UPDATED: 'user.updated',
    DEACTIVATED: 'user.deactivated',
    ROLE_CHANGED: 'user.role_changed'
  },
  ORGANIZATION: {
    CREATED: 'organization.created',
    UPDATED: 'organization.updated',
    MEMBER_ADDED: 'organization.member_added',
    MEMBER_REMOVED: 'organization.member_removed'
  },
  INVENTORY: {
    KIT_CREATED: 'inventory.kit_created',
    KIT_UPDATED: 'inventory.kit_updated',
    KIT_ASSIGNED: 'inventory.kit_assigned',
    KIT_RETURNED: 'inventory.kit_returned'
  },
  SYSTEM: {
    HEALTH_CHECK: 'system.health_check',
    ERROR: 'system.error',
    PERFORMANCE_ALERT: 'system.performance_alert'
  }
} as const;