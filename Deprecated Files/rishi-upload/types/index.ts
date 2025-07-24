/**
 * Global type definitions
 * This file contains shared type definitions used throughout the application
 */

// Permission structure for RBAC system
export interface Permission {
  action: string;
  resource: string;
}

// Location type
export interface Location {
  id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  locationType?: string;
  status?: string;
}

// User type
export interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  role: string;
  organizationId?: string;
}

// Booking type
export interface Booking {
  id?: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status?: string;
  activityType?: string;
  budget?: number;
  priority?: string;
  locationId: string;
  userId: string;
  promotionType?: string;
}

// Organization type
export interface Organization {
  id: string;
  name: string;
  type?: string;
  status?: string;
}

// Event type for websocket communication
export interface Event {
  type: string;
  payload: any;
  timestamp: number;
}
