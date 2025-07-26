/**
 * Scheduling Service Models
 * These models define the core entities and types for scheduling management
 */
import { z } from "zod";
import { EventStatus } from "../events/models";
import { StaffStatus } from "../staff/models";

/**
 * Schedule status enum
 */
export enum ScheduleStatus {
  DRAFT = "draft", // Initial schedule creation
  PUBLISHED = "published", // Published to staff
  FINALIZED = "finalized", // Confirmed and locked
  CANCELLED = "cancelled", // Schedule cancelled
}

/**
 * Schedule entity
 */
export interface Schedule {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  status: ScheduleStatus;
  createdById: string;
  createdByName?: string;
  publishedById?: string;
  publishedByName?: string;
  publishedAt?: string; // ISO date string
  finalizedById?: string;
  finalizedByName?: string;
  finalizedAt?: string; // ISO date string
  organizationId: string;
  organizationName?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  notesForStaff?: string;
  notesInternal?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Schedule shift entity
 */
export interface ScheduleShift {
  id: string;
  scheduleId: string;
  title: string;
  description?: string;
  locationId?: string;
  locationName?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // Format: "HH:MM" in 24-hour
  endTime: string; // Format: "HH:MM" in 24-hour
  requiredStaffCount: number;
  assignedStaffCount: number;
  skillRequirements?: string[]; // Array of skill IDs required
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Schedule shift assignment entity
 */
export interface ShiftAssignment {
  id: string;
  shiftId: string;
  scheduleId: string;
  staffId: string;
  staffName?: string;
  role: string;
  status: "pending" | "confirmed" | "declined" | "removed";
  confirmedAt?: string; // ISO date string
  declinedAt?: string; // ISO date string
  declineReason?: string;
  checkedInAt?: string; // ISO date string
  checkedOutAt?: string; // ISO date string
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Schedule template entity
 */
export interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdById: string;
  shiftTemplates: ShiftTemplate[];
  isDefault: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Shift template entity
 */
export interface ShiftTemplate {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  locationId?: string;
  dayOffset: number; // Days from event start (0 = same day)
  startTime: string; // Format: "HH:MM" in 24-hour
  endTime: string; // Format: "HH:MM" in 24-hour
  requiredStaffCount: number;
  skillRequirements?: string[]; // Array of skill IDs required
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Create schedule schema
 */
export const createScheduleSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  startDate: z.string().datetime("Invalid date format"),
  endDate: z.string().datetime("Invalid date format"),
  notesForStaff: z.string().optional(),
  notesInternal: z.string().optional(),
  templateId: z.string().optional(), // If using a template
});

/**
 * Update schedule schema
 */
export const updateScheduleSchema = createScheduleSchema.partial().extend({
  status: z.nativeEnum(ScheduleStatus).optional(),
});

/**
 * Create shift schema
 */
export const createShiftSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  locationId: z.string().optional(),
  date: z.string().datetime("Invalid date format"),
  startTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in 24-hour format (HH:MM)",
    ),
  endTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in 24-hour format (HH:MM)",
    ),
  requiredStaffCount: z.number().int().positive(),
  skillRequirements: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

/**
 * Update shift schema
 */
export const updateShiftSchema = createShiftSchema
  .omit({ scheduleId: true })
  .partial();

/**
 * Create shift assignment schema
 */
export const createShiftAssignmentSchema = z.object({
  shiftId: z.string().min(1, "Shift ID is required"),
  scheduleId: z.string().min(1, "Schedule ID is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  role: z.string().min(1, "Role is required"),
  notes: z.string().optional(),
});

/**
 * Update shift assignment schema
 */
export const updateShiftAssignmentSchema = z
  .object({
    role: z.string().optional(),
    status: z.enum(["pending", "confirmed", "declined", "removed"]).optional(),
    declineReason: z.string().optional(),
    checkedInAt: z.string().datetime("Invalid date format").optional(),
    checkedOutAt: z.string().datetime("Invalid date format").optional(),
    notes: z.string().optional(),
  })
  .partial();

/**
 * Create schedule template schema
 */
export const createScheduleTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  organizationId: z.string().min(1, "Organization ID is required"),
  isDefault: z.boolean().default(false),
});

/**
 * Update schedule template schema
 */
export const updateScheduleTemplateSchema =
  createScheduleTemplateSchema.partial();

/**
 * Create shift template schema
 */
export const createShiftTemplateSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  locationId: z.string().optional(),
  dayOffset: z.number().int().min(0),
  startTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in 24-hour format (HH:MM)",
    ),
  endTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in 24-hour format (HH:MM)",
    ),
  requiredStaffCount: z.number().int().positive(),
  skillRequirements: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

/**
 * Update shift template schema
 */
export const updateShiftTemplateSchema = createShiftTemplateSchema
  .omit({ templateId: true })
  .partial();

/**
 * Publish schedule params
 */
export interface PublishScheduleParams {
  id: string;
  notifyStaff?: boolean;
}

/**
 * Finalize schedule params
 */
export interface FinalizeScheduleParams {
  id: string;
}

/**
 * Schedule search filters
 */
export interface ScheduleFilters {
  organizationId?: string;
  eventId?: string;
  status?: ScheduleStatus | ScheduleStatus[];
  startDate?: string; // ISO date string for start of range
  endDate?: string; // ISO date string for end of range
  createdById?: string;
  q?: string; // Search term for name/description
}

/**
 * Shift search filters
 */
export interface ShiftFilters {
  scheduleId?: string;
  date?: string; // ISO date string
  startDateRange?: string; // ISO date string for start of range
  endDateRange?: string; // ISO date string for end of range
  locationId?: string;
  requiredSkillId?: string;
  q?: string; // Search term for title/description
}

/**
 * Assignment search filters
 */
export interface AssignmentFilters {
  scheduleId?: string;
  shiftId?: string;
  staffId?: string;
  status?: "pending" | "confirmed" | "declined" | "removed";
  date?: string; // ISO date string
  startDateRange?: string; // ISO date string for start of range
  endDateRange?: string; // ISO date string for end of range
}

// Types derived from schemas
export type CreateScheduleParams = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleParams = z.infer<typeof updateScheduleSchema>;
export type CreateShiftParams = z.infer<typeof createShiftSchema>;
export type UpdateShiftParams = z.infer<typeof updateShiftSchema>;
export type CreateShiftAssignmentParams = z.infer<
  typeof createShiftAssignmentSchema
>;
export type UpdateShiftAssignmentParams = z.infer<
  typeof updateShiftAssignmentSchema
>;
export type CreateScheduleTemplateParams = z.infer<
  typeof createScheduleTemplateSchema
>;
export type UpdateScheduleTemplateParams = z.infer<
  typeof updateScheduleTemplateSchema
>;
export type CreateShiftTemplateParams = z.infer<
  typeof createShiftTemplateSchema
>;
export type UpdateShiftTemplateParams = z.infer<
  typeof updateShiftTemplateSchema
>;
