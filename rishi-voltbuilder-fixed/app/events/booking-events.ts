/**
 * Booking Events Module
 *
 * This module defines all booking-related events that can be published
 * and subscribed to through the application's event bus. It implements
 * the event-driven architecture pattern for booking operations.
 *
 * By centralizing all booking events in this file, we ensure:
 * 1. Consistent event naming conventions
 * 2. Type safety for event payloads
 * 3. Documentation of event flows
 * 4. Discoverability of available events
 */

import { eventBus } from "./event-bus";

// Event name constants to prevent typos and enable refactoring
export const BookingEventTypes = {
  BOOKING_CREATED: "booking.created",
  BOOKING_UPDATED: "booking.updated",
  BOOKING_DELETED: "booking.deleted",
  BOOKING_STATUS_CHANGED: "booking.status.changed",
  BOOKING_APPROVED: "booking.approved",
  BOOKING_REJECTED: "booking.rejected",
  BOOKING_CANCELED: "booking.canceled",
  LOCATION_REQUESTED: "booking.location.requested",
  ACTIVITY_ADDED: "booking.activity.added",
  ACTIVITY_UPDATED: "booking.activity.updated",
  ACTIVITY_REMOVED: "booking.activity.removed",
  RECURRING_PATTERN_CHANGED: "booking.recurring.changed",
  BOOKING_ERROR: "booking.error",
} as const;

// Type definitions for event payloads
export interface BookingCreatedEvent {
  bookingId: string;
  clientId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  createdBy: string;
  isRecurring: boolean;
}

export interface BookingUpdatedEvent {
  bookingId: string;
  changes: Record<string, any>;
  updatedBy: string;
}

export interface BookingStatusChangedEvent {
  bookingId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  reason?: string;
}

export interface BookingLocationRequestedEvent {
  bookingId: string;
  locationName: string;
  locationAddress: string;
  locationDetails?: Record<string, any>;
  requestedBy: string;
}

export interface BookingErrorEvent {
  type: string;
  message: string;
  bookingId?: string;
  timestamp: string;
}

/**
 * The booking events service handles all booking-related event operations
 * including event subscription, publication, and common event handlers.
 */
export const bookingEvents = {
  /**
   * Publish a booking created event
   */
  publishBookingCreated(data: BookingCreatedEvent) {
    eventBus.emit(BookingEventTypes.BOOKING_CREATED, data);
  },

  /**
   * Publish a booking updated event
   */
  publishBookingUpdated(data: BookingUpdatedEvent) {
    eventBus.emit(BookingEventTypes.BOOKING_UPDATED, data);
  },

  /**
   * Publish a booking status changed event
   */
  publishStatusChanged(data: BookingStatusChangedEvent) {
    eventBus.emit(BookingEventTypes.BOOKING_STATUS_CHANGED, data);

    // Also publish to the specific status event
    switch (data.newStatus) {
      case "approved":
        eventBus.emit(BookingEventTypes.BOOKING_APPROVED, data);
        break;
      case "rejected":
        eventBus.emit(BookingEventTypes.BOOKING_REJECTED, data);
        break;
      case "canceled":
        eventBus.emit(BookingEventTypes.BOOKING_CANCELED, data);
        break;
    }
  },

  /**
   * Publish a location requested event from a booking
   */
  publishLocationRequested(data: BookingLocationRequestedEvent) {
    eventBus.emit(BookingEventTypes.LOCATION_REQUESTED, data);
  },

  /**
   * Publish a booking error event
   */
  publishError(data: BookingErrorEvent) {
    eventBus.emit(BookingEventTypes.BOOKING_ERROR, data);
  },

  /**
   * Subscribe to booking created events
   */
  onBookingCreated(handler: (data: BookingCreatedEvent) => void) {
    return eventBus.subscribe(BookingEventTypes.BOOKING_CREATED, handler);
  },

  /**
   * Subscribe to booking updated events
   */
  onBookingUpdated(handler: (data: BookingUpdatedEvent) => void) {
    return eventBus.subscribe(BookingEventTypes.BOOKING_UPDATED, handler);
  },

  /**
   * Subscribe to booking status changed events
   */
  onStatusChanged(handler: (data: BookingStatusChangedEvent) => void) {
    return eventBus.subscribe(
      BookingEventTypes.BOOKING_STATUS_CHANGED,
      handler,
    );
  },

  /**
   * Subscribe to booking approved events
   */
  onBookingApproved(handler: (data: BookingStatusChangedEvent) => void) {
    return eventBus.subscribe(BookingEventTypes.BOOKING_APPROVED, handler);
  },

  /**
   * Subscribe to booking rejected events
   */
  onBookingRejected(handler: (data: BookingStatusChangedEvent) => void) {
    return eventBus.subscribe(BookingEventTypes.BOOKING_REJECTED, handler);
  },

  /**
   * Subscribe to location requested events
   */
  onLocationRequested(handler: (data: BookingLocationRequestedEvent) => void) {
    return eventBus.subscribe(BookingEventTypes.LOCATION_REQUESTED, handler);
  },

  /**
   * Subscribe to booking error events
   */
  onBookingError(handler: (data: BookingErrorEvent) => void) {
    return eventBus.subscribe(BookingEventTypes.BOOKING_ERROR, handler);
  },
};

export default bookingEvents;
