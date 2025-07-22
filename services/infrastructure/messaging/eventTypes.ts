/**
 * Event Types for Infrastructure Messaging
 * Defines event interfaces for the distributed event system
 */

export interface BaseEvent {
  type: string;
  timestamp: Date;
  correlationId: string;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
}

export interface AppEvent extends BaseEvent {
  source: string;
  version: string;
  payload?: any;
}

export interface LocationEvent extends BaseEvent {
  type: 'location.created' | 'location.updated' | 'location.deleted' | 'location.approved' | 'location.pending';
  locationId: string;
  changes?: Record<string, any>;
}

export interface BookingEvent extends BaseEvent {
  type: 'booking.created' | 'booking.updated' | 'booking.cancelled' | 'booking.completed';
  bookingId: string;
  status?: string;
}

export interface UserEvent extends BaseEvent {
  type: 'user.login' | 'user.logout' | 'user.created' | 'user.updated';
  userId: string;
  role?: string;
}

export interface SystemEvent extends BaseEvent {
  type: 'system.health' | 'system.error' | 'system.performance';
  severity: 'info' | 'warning' | 'error' | 'critical';
  details?: any;
}

// Export all event types
export type EventType = AppEvent | LocationEvent | BookingEvent | UserEvent | SystemEvent;

// Event handler interface
export interface EventHandler<T extends BaseEvent = BaseEvent> {
  handle(event: T): Promise<void>;
  canHandle(eventType: string): boolean;
}

// Event bus subscription interface
export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  isActive: boolean;
}