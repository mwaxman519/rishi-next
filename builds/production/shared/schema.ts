/**
 * Database Schema Types for Production Build
 * Simplified types for client-side use
 */

export interface User {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  role: string;
  organizationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Organization {
  id: string;
  name: string;
  tier: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Booking {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: string;
  organizationId: string;
  locationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  organizationId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface KitTemplate {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  items: KitItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KitItem {
  id: string;
  name: string;
  quantity: number;
  description?: string;
}

export interface Staff {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Permission types for RBAC
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type PermissionResource = 
  | 'users' 
  | 'organizations' 
  | 'bookings' 
  | 'locations' 
  | 'staff' 
  | 'inventory' 
  | 'reports'
  | 'admin';

export type PermissionString = `${PermissionAction}:${PermissionResource}`;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}