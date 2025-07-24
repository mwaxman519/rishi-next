/**
 * Events Service Models
 * These models define the core entities and types for event management
 */
import { z } from "zod";

/**
 * Event status enum
 */
export enum EventStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FINALIZED = "finalized",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

/**
 * Event type enum
 */
export enum EventType {
  CORPORATE = "corporate",
  EXHIBITION = "exhibition",
  CONFERENCE = "conference",
  FESTIVAL = "festival",
  SPORTING = "sporting",
  PRIVATE = "private",
  OTHER = "other",
}

/**
 * Event recurrence pattern enum
 */
export enum RecurrencePattern {
  NONE = "none",
  DAILY = "daily",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
  CUSTOM = "custom",
}

/**
 * Event entity
 */
export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  status: EventStatus;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  locationId?: string;
  locationName?: string;
  organizationId: string;
  organizationName?: string;
  createdById: string;
  createdByName?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewDate?: string; // ISO date string
  rejectionReason?: string;
  attendeeCapacity?: number;
  staffRequired?: number;
  budget?: number;
  isPublic: boolean;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: string; // ISO date string
  customRecurrenceRule?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Event staff assignment
 */
export interface EventStaffAssignment {
  id: string;
  eventId: string;
  userId: string;
  userName?: string;
  role: string;
  status: "pending" | "confirmed" | "declined" | "canceled";
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  checkedInAt?: string; // ISO date string
  checkedOutAt?: string; // ISO date string
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Event checklist item
 */
export interface EventChecklistItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string; // ISO date string
  assigneeId?: string;
  assigneeName?: string;
  completedAt?: string; // ISO date string
  completedById?: string;
  priority: "low" | "medium" | "high";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Event creation parameters
 */
export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventType: z.nativeEnum(EventType),
  startDate: z.string().datetime("Invalid date format"),
  endDate: z.string().datetime("Invalid date format"),
  locationId: z.string().optional(),
  organizationId: z.string(),
  attendeeCapacity: z.number().int().positive().optional(),
  staffRequired: z.number().int().positive().optional(),
  budget: z.number().positive().optional(),
  isPublic: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.nativeEnum(RecurrencePattern).optional(),
  recurrenceEndDate: z.string().datetime("Invalid date format").optional(),
  customRecurrenceRule: z.string().optional(),
});

/**
 * Event update parameters
 */
export const updateEventSchema = createEventSchema.partial().extend({
  status: z.nativeEnum(EventStatus).optional(),
  rejectionReason: z.string().optional(),
});

/**
 * Staff assignment creation parameters
 */
export const createStaffAssignmentSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  role: z.string(),
  startTime: z.string().datetime("Invalid date format"),
  endTime: z.string().datetime("Invalid date format"),
  notes: z.string().optional(),
});

/**
 * Staff assignment update parameters
 */
export const updateStaffAssignmentSchema = z
  .object({
    status: z.enum(["pending", "confirmed", "declined", "canceled"]).optional(),
    role: z.string().optional(),
    startTime: z.string().datetime("Invalid date format").optional(),
    endTime: z.string().datetime("Invalid date format").optional(),
    checkedInAt: z.string().datetime("Invalid date format").optional(),
    checkedOutAt: z.string().datetime("Invalid date format").optional(),
    notes: z.string().optional(),
  })
  .partial();

/**
 * Event checklist item creation parameters
 */
export const createChecklistItemSchema = z.object({
  eventId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().datetime("Invalid date format").optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

/**
 * Event checklist item update parameters
 */
export const updateChecklistItemSchema = createChecklistItemSchema
  .partial()
  .extend({
    isCompleted: z.boolean().optional(),
    completedAt: z.string().datetime("Invalid date format").optional(),
    completedById: z.string().optional(),
  });

/**
 * Event approval parameters
 */
export interface ApproveEventParams {
  id: string;
}

/**
 * Event rejection parameters
 */
export interface RejectEventParams {
  id: string;
  reason: string;
}

/**
 * Event search filters
 */
export interface EventFilters {
  organizationId?: string;
  locationId?: string;
  status?: EventStatus | EventStatus[];
  eventType?: EventType | EventType[];
  startDate?: string; // ISO date string for start of range
  endDate?: string; // ISO date string for end of range
  createdById?: string;
  isPublic?: boolean;
  q?: string; // Search term for title/description
}

// Types derived from schemas
export type CreateEventParams = z.infer<typeof createEventSchema>;
export type UpdateEventParams = z.infer<typeof updateEventSchema>;
export type CreateStaffAssignmentParams = z.infer<
  typeof createStaffAssignmentSchema
>;
export type UpdateStaffAssignmentParams = z.infer<
  typeof updateStaffAssignmentSchema
>;
export type CreateChecklistItemParams = z.infer<
  typeof createChecklistItemSchema
>;
export type UpdateChecklistItemParams = z.infer<
  typeof updateChecklistItemSchema
>;
