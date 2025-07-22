import {
  AvailabilityBlock,
  InsertAvailabilityBlock,
} from "../../../shared/schema";

/**
 * AvailabilityDTO - Used for transferring availability data between services
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
  startDate?: Date | string | undefined;
  endDate?: Date | string | undefined;
  status?: "available" | "unavailable" | "tentative" | undefined;
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
  conflictType: "overlap" | "adjacent" | "contained";
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
