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
  status: &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;;
  isRecurring: boolean;
  recurrencePattern?: string;
  dayOfWeek?: number;
  recurrenceGroup?: string;
  recurrenceEndType?: &quot;never&quot; | &quot;count&quot; | &quot;date&quot;;
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
  status?: &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;;
  isRecurring?: boolean;
  recurrencePattern?: string;
  dayOfWeek?: number;
  recurrenceEndType?: &quot;never&quot; | &quot;count&quot; | &quot;date&quot;;
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
  status?: &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;;
  isRecurring?: boolean;
  recurrencePattern?: string;
  dayOfWeek?: number;
  recurrenceEndType?: &quot;never&quot; | &quot;count&quot; | &quot;date&quot;;
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
  status?: &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;;
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
