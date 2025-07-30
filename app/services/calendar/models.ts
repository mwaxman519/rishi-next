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

import { z } from &quot;zod&quot;;

/**
 * Calendar Event Types
 * Defines the different types of calendar entries supported
 */
export enum CalendarEventType {
  SHIFT = &quot;shift&quot;,
  EVENT = &quot;event&quot;,
  AVAILABILITY_BLOCK = &quot;availability_block&quot;,
  TIME_OFF = &quot;time_off&quot;,
  MEETING = &quot;meeting&quot;,
  TRAINING = &quot;training&quot;,
}

/**
 * Calendar Event Status
 * Tracks the current state of calendar events
 */
export enum CalendarEventStatus {
  DRAFT = &quot;draft&quot;,
  SCHEDULED = &quot;scheduled&quot;,
  CONFIRMED = &quot;confirmed&quot;,
  IN_PROGRESS = &quot;in_progress&quot;,
  COMPLETED = &quot;completed&quot;,
  CANCELLED = &quot;cancelled&quot;,
  POSTPONED = &quot;postponed&quot;,
}

/**
 * Availability Status
 * Defines agent availability states
 */
export enum AvailabilityStatus {
  AVAILABLE = &quot;available&quot;,
  BUSY = &quot;busy&quot;,
  TENTATIVE = &quot;tentative&quot;,
  OUT_OF_OFFICE = &quot;out_of_office&quot;,
}

/**
 * Core Calendar Event Model
 * Unified representation for all calendar entries
 */
export const CalendarEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, &quot;Title is required&quot;),
  description: z.string().optional(),
  type: z.nativeEnum(CalendarEventType),
  status: z.nativeEnum(CalendarEventStatus),

  // Temporal properties
  startDateTime: z.date(),
  endDateTime: z.date(),
  timezone: z.string().default(&quot;UTC&quot;),
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
  priority: z.enum([&quot;low&quot;, &quot;medium&quot;, &quot;high&quot;, &quot;urgent&quot;]).default(&quot;medium&quot;),
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
  timezone: z.string().default(&quot;UTC&quot;),

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
    &quot;overlap&quot;,
    &quot;double_booking&quot;,
    &quot;availability_conflict&quot;,
    &quot;travel_time&quot;,
  ]),
  severity: z.enum([&quot;warning&quot;, &quot;error&quot;, &quot;critical&quot;]),

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
