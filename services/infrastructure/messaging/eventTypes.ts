// Event Types for VoltBuilder compatibility
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  data: any;
}

export interface LocationEvent extends BaseEvent {
  type: 'location.created' | 'location.updated' | 'location.deleted';
  locationId: string;
}

export interface BookingEvent extends BaseEvent {
  type: 'booking.created' | 'booking.updated' | 'booking.cancelled';
  bookingId: string;
}

export interface StaffEvent extends BaseEvent {
  type: 'staff.assigned' | 'staff.unassigned' | 'staff.updated';
  staffId: string;
}

export type EventType = LocationEvent | BookingEvent | StaffEvent;

export const EventTypes = {
  LOCATION_CREATED: 'location.created',
  LOCATION_UPDATED: 'location.updated', 
  LOCATION_DELETED: 'location.deleted',
  BOOKING_CREATED: 'booking.created',
  BOOKING_UPDATED: 'booking.updated',
  BOOKING_CANCELLED: 'booking.cancelled',
  STAFF_ASSIGNED: 'staff.assigned',
  STAFF_UNASSIGNED: 'staff.unassigned',
  STAFF_UPDATED: 'staff.updated'
} as const;