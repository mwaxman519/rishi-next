/**
 * Client-safe AvailabilityDTO model
 * This file is specifically for client-side use to avoid importing server-side code
 */
export interface AvailabilityDTO {
  id: number;
  userId: number;
  title: string;
  startDate: Date | string;
  endDate: Date | string;
  status: "available" | "unavailable" | "tentative";
  isRecurring: boolean;
  recurrencePattern?: string;
  dayOfWeek?: number;
  recurrenceGroup?: string;
  recurrenceEndType?: "never" | "count" | "date";
  recurrenceCount?: number;
  recurrenceEndDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * CreateAvailabilityRequest - Used for creating a new availability block
 */
export interface CreateAvailabilityRequest {
  userId: number;
  title?: string;
  startDate: Date | string;
  endDate: Date | string;
  status?: "available" | "unavailable" | "tentative";
  isRecurring?: boolean;
  recurrencePattern?: string;
  dayOfWeek?: number;
  recurrenceEndType?: "never" | "count" | "date";
  recurrenceCount?: number;
  recurrenceEndDate?: Date | string;
}

/**
 * UpdateAvailabilityRequest - Used for updating an existing availability block
 */
export interface UpdateAvailabilityRequest {
  title?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: "available" | "unavailable" | "tentative";
  isRecurring?: boolean;
  recurrencePattern?: string;
  dayOfWeek?: number;
  recurrenceEndType?: "never" | "count" | "date";
  recurrenceCount?: number;
  recurrenceEndDate?: Date | string;
}

/**
 * AvailabilityQueryOptions - Used for querying availability blocks
 */
export interface AvailabilityQueryOptions {
  userId: number;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: "available" | "unavailable" | "tentative";
}

/**
 * ServiceResponse - Generic response type for all service methods
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * AvailabilityResponse - Specific response type for availability operations
 */
export type AvailabilityResponse = ServiceResponse<AvailabilityDTO>;

/**
 * AvailabilitiesResponse - Response for multiple availability blocks
 */
export type AvailabilitiesResponse = ServiceResponse<AvailabilityDTO[]>;
