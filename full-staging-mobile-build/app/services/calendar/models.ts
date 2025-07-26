/**
 * Calendar & Scheduling Models
 *
 * Comprehensive type definitions for calendar integration, scheduling coordination,
 * and availability management across the Rishi platform.
 *
 * FEATURES:
 * - Unified calendar events for shifts and events
 * - Multi-timezone support with proper handling
 * - Availability blocking and conflict detection
 * - Schedule coordination across services
 * - Integration with external calendar systems
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 * @since Phase 6 Implementation
 */

import { z } from "zod";

/**
 * Calendar Event Types
 * Defines the different types of calendar entries supported
 */
export enum CalendarEventType {
  SHIFT = "shift",
  EVENT = "event",
  AVAILABILITY_BLOCK = "availability_block",
  TIME_OFF = "time_off",
  MEETING = "meeting",
  TRAINING = "training",
}

/**
 * Calendar Event Status
 * Tracks the current state of calendar events
 */
export enum CalendarEventStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  POSTPONED = "postponed",
}

/**
 * Availability Status
 * Defines agent availability states
 */
export enum AvailabilityStatus {
  AVAILABLE = "available",
  BUSY = "busy",
  TENTATIVE = "tentative",
  OUT_OF_OFFICE = "out_of_office",
}

/**
 * Core Calendar Event Model
 * Unified representation for all calendar entries
 */
export const CalendarEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.nativeEnum(CalendarEventType),
  status: z.nativeEnum(CalendarEventStatus),

  // Temporal properties
  startDateTime: z.date(),
  endDateTime: z.date(),
  timezone: z.string().default("UTC"),
  isAllDay: z.boolean().default(false),

  // Organizational context
  organizationId: z.string().uuid(),
  createdBy: z.string().uuid(),
  assignedTo: z.array(z.string().uuid()).optional(),

  // Location and venue
  locationId: z.string().uuid().optional(),

  // Related entities
  shiftId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),

  // Metadata
  color: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),

  // Audit fields
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Availability Block Model
 * Defines time periods when agents are available or unavailable
 */
export const AvailabilityBlockSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  organizationId: z.string().uuid(),

  // Time period
  startDateTime: z.date(),
  endDateTime: z.date(),
  timezone: z.string().default("UTC"),

  // Availability details
  status: z.nativeEnum(AvailabilityStatus),
  reason: z.string().optional(),
  notes: z.string().optional(),

  // Audit
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schedule Conflict Model
 * Represents scheduling conflicts between calendar events
 */
export const ScheduleConflictSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    "overlap",
    "double_booking",
    "availability_conflict",
    "travel_time",
  ]),
  severity: z.enum(["warning", "error", "critical"]),

  // Conflicting events
  primaryEventId: z.string().uuid(),
  conflictingEventId: z.string().uuid(),

  // Conflict details
  overlapStartTime: z.date(),
  overlapEndTime: z.date(),
  description: z.string(),

  // Resolution information
  isResolved: z.boolean().default(false),
  resolutionNotes: z.string().optional(),
  resolvedBy: z.string().uuid().optional(),
  resolvedAt: z.date().optional(),

  // Audit
  detectedAt: z.date(),
  organizationId: z.string().uuid(),
});

// Type exports
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type AvailabilityBlock = z.infer<typeof AvailabilityBlockSchema>;
export type ScheduleConflict = z.infer<typeof ScheduleConflictSchema>;

// Create schemas for API operations
export const CreateCalendarEventSchema = CalendarEventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCalendarEventSchema = CreateCalendarEventSchema.partial();

// Input types for API
export type CreateCalendarEventInput = z.infer<
  typeof CreateCalendarEventSchema
>;
export type UpdateCalendarEventInput = z.infer<
  typeof UpdateCalendarEventSchema
>;

/**
 * Service Response Interface
 * Standardized response format for calendar operations
 */
export interface CalendarServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  conflicts?: ScheduleConflict[];
}
