/**
 * Shift Management Models
 * Type definitions and validation schemas for shift management
 */

import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { shifts, shiftAssignments } from "../../../shared/schema";

// Database Types
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = typeof shifts.$inferInsert;
export type ShiftAssignment = typeof shiftAssignments.$inferSelect;
export type InsertShiftAssignment = typeof shiftAssignments.$inferInsert;

// Enums
export enum ShiftStatus {
  DRAFT = "draft",
  OPEN = "open",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum AssignmentStatus {
  ASSIGNED = "assigned",
  CONFIRMED = "confirmed",
  CHECKED_IN = "checked_in",
  COMPLETED = "completed",
  NO_SHOW = "no_show",
}

// Validation Schemas
export const createShiftSchema = createInsertSchema(shifts, {
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  requiredAgents: z
    .number()
    .min(1, "At least 1 agent required")
    .max(50, "Too many agents"),
  hourlyRate: z.number().positive("Hourly rate must be positive").optional(),
  totalBudget: z.number().positive("Budget must be positive").optional(),
  status: z
    .enum([
      "draft",
      "open",
      "assigned",
      "in_progress",
      "completed",
      "cancelled",
    ])
    .default("draft"),
})
  .omit({
    id: true,
    createdAt: true,
  })
  .refine((data) => new Date(data.endDateTime) > new Date(data.startDateTime), {
    message: "End time must be after start time",
    path: ["endDateTime"],
  });

export const updateShiftSchema = createInsertSchema(shifts, {
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .optional(),
  startDateTime: z.coerce.date().optional(),
  endDateTime: z.coerce.date().optional(),
  requiredAgents: z
    .number()
    .min(1, "At least 1 agent required")
    .max(50, "Too many agents")
    .optional(),
  hourlyRate: z.number().positive("Hourly rate must be positive").optional(),
  totalBudget: z.number().positive("Budget must be positive").optional(),
  status: z
    .enum([
      "draft",
      "open",
      "assigned",
      "in_progress",
      "completed",
      "cancelled",
    ])
    .optional(),
})
  .omit({
    id: true,
    createdAt: true,
    createdBy: true,
    organizationId: true,
  })
  .partial();

export const assignShiftSchema = createInsertSchema(shiftAssignments, {
  shiftId: z.string().uuid("Invalid shift ID"),
  agentId: z.string().uuid("Invalid agent ID"),
  assignmentStatus: z
    .enum(["assigned", "confirmed", "checked_in", "completed", "no_show"])
    .default("assigned"),
}).omit({
  id: true,
  assignedAt: true,
});

// Service DTOs
export interface ShiftDTO extends Shift {
  assignments?: ShiftAssignmentDTO[];
  event?: {
    id: string;
    title: string;
  };
  location?: {
    id: string;
    name: string;
    address: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ShiftAssignmentDTO extends ShiftAssignment {
  shift?: {
    id: string;
    title: string;
    startDateTime: Date;
    endDateTime: Date;
  };
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Request Parameters
export interface CreateShiftParams {
  title: string;
  description?: string;
  eventId?: string;
  locationId?: string;
  brandId?: string;
  organizationId: string;
  startDateTime: Date;
  endDateTime: Date;
  requiredAgents?: number;
  requiredSkills?: any;
  hourlyRate?: number;
  totalBudget?: number;
  notes?: string;
}

export interface UpdateShiftParams {
  title?: string;
  description?: string;
  eventId?: string;
  locationId?: string;
  brandId?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  requiredAgents?: number;
  requiredSkills?: any;
  hourlyRate?: number;
  totalBudget?: number;
  notes?: string;
  status?: ShiftStatus;
}

export interface ShiftAssignmentParams {
  shiftId: string;
  agentId: string;
  assignmentStatus?: AssignmentStatus;
  notes?: string;
}

export interface ShiftFilters {
  organizationId?: string;
  eventId?: string;
  locationId?: string;
  brandId?: string;
  status?: ShiftStatus;
  agentId?: string;
  startDate?: Date;
  endDate?: Date;
  requiredSkills?: string[];
}

export interface AvailabilityCheck {
  agentId: string;
  startDateTime: Date;
  endDateTime: Date;
}

export interface AvailabilityResult {
  available: boolean;
  conflicts: {
    type: "shift" | "event" | "unavailable";
    id: string;
    title: string;
    startDateTime: Date;
    endDateTime: Date;
  }[];
}

export interface ShiftMetrics {
  totalShifts: number;
  completedShifts: number;
  cancelledShifts: number;
  avgHours: number;
  totalHours: number;
  totalCost: number;
  fillRate: number; // Percentage of shifts with full assignment
}

export interface WorkforceMetrics {
  totalAgents: number;
  activeAgents: number;
  avgShiftsPerAgent: number;
  topPerformers: {
    agentId: string;
    agentName: string;
    completedShifts: number;
    totalHours: number;
    avgRating: number;
  }[];
}

// Type exports
export type { Shift as ShiftData };
export type { ShiftAssignment as ShiftAssignmentData };
