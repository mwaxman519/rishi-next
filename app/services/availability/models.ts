import {
  AvailabilityBlock,
  InsertAvailabilityBlock,
} from &quot;../../../shared/schema&quot;;

/**
 * AvailabilityDTO - Used for transferring availability data between services
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
  startDate?: Date | string | undefined;
  endDate?: Date | string | undefined;
  status?: &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot; | undefined;
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
 * AvailabilityConflict - Represents a conflict between availability blocks
 */
export interface AvailabilityConflict {
  existingBlock: AvailabilityDTO;
  conflictType: &quot;overlap&quot; | &quot;adjacent&quot; | &quot;contained&quot;;
}

/**
 * AvailabilityResponse - Specific response type for availability operations
 */
export type AvailabilityResponse = ServiceResponse<AvailabilityDTO>;

/**
 * AvailabilitiesResponse - Response for multiple availability blocks
 */
export type AvailabilitiesResponse = ServiceResponse<AvailabilityDTO[]>;

/**
 * ConflictCheckResponse - Response for conflict checking operations
 */
export type ConflictCheckResponse = ServiceResponse<{
  hasConflicts: boolean;
  conflicts?: AvailabilityConflict[];
}>;
