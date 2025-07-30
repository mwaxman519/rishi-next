/**
 * Shift Management Models
 * Type definitions and validation schemas for shift management
 */

import { z } from &quot;zod&quot;;
import { createInsertSchema, createSelectSchema } from &quot;drizzle-zod&quot;;
import { shifts, shiftAssignments } from &quot;../../../shared/schema&quot;;

// Database Types
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = typeof shifts.$inferInsert;
export type ShiftAssignment = typeof shiftAssignments.$inferSelect;
export type InsertShiftAssignment = typeof shiftAssignments.$inferInsert;

// Enums
export enum ShiftStatus {
  DRAFT = &quot;draft&quot;,
  OPEN = &quot;open&quot;,
  ASSIGNED = &quot;assigned&quot;,
  IN_PROGRESS = &quot;in_progress&quot;,
  COMPLETED = &quot;completed&quot;,
  CANCELLED = &quot;cancelled&quot;,
}

export enum AssignmentStatus {
  ASSIGNED = &quot;assigned&quot;,
  CONFIRMED = &quot;confirmed&quot;,
  CHECKED_IN = &quot;checked_in&quot;,
  COMPLETED = &quot;completed&quot;,
  NO_SHOW = &quot;no_show&quot;,
}

// Validation Schemas
export const createShiftSchema = createInsertSchema(shifts, {
  title: z.string().min(1, &quot;Title is required&quot;).max(200, &quot;Title too long&quot;),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  requiredAgents: z
    .number()
    .min(1, &quot;At least 1 agent required&quot;)
    .max(50, &quot;Too many agents&quot;),
  hourlyRate: z.number().positive(&quot;Hourly rate must be positive&quot;).optional(),
  totalBudget: z.number().positive(&quot;Budget must be positive&quot;).optional(),
  status: z
    .enum([
      &quot;draft&quot;,
      &quot;open&quot;,
      &quot;assigned&quot;,
      &quot;in_progress&quot;,
      &quot;completed&quot;,
      &quot;cancelled&quot;,
    ])
    .default(&quot;draft&quot;),
})
  .omit({
    id: true,
    createdAt: true,
  })
  .refine((data) => new Date(data.endDateTime) > new Date(data.startDateTime), {
    message: &quot;End time must be after start time&quot;,
    path: [&quot;endDateTime&quot;],
  });

export const updateShiftSchema = createInsertSchema(shifts, {
  title: z
    .string()
    .min(1, &quot;Title is required&quot;)
    .max(200, &quot;Title too long&quot;)
    .optional(),
  startDateTime: z.coerce.date().optional(),
  endDateTime: z.coerce.date().optional(),
  requiredAgents: z
    .number()
    .min(1, &quot;At least 1 agent required&quot;)
    .max(50, &quot;Too many agents&quot;)
    .optional(),
  hourlyRate: z.number().positive(&quot;Hourly rate must be positive&quot;).optional(),
  totalBudget: z.number().positive(&quot;Budget must be positive&quot;).optional(),
  status: z
    .enum([
      &quot;draft&quot;,
      &quot;open&quot;,
      &quot;assigned&quot;,
      &quot;in_progress&quot;,
      &quot;completed&quot;,
      &quot;cancelled&quot;,
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
  shiftId: z.string().uuid(&quot;Invalid shift ID&quot;),
  agentId: z.string().uuid(&quot;Invalid agent ID&quot;),
  assignmentStatus: z
    .enum([&quot;assigned&quot;, &quot;confirmed&quot;, &quot;checked_in&quot;, &quot;completed&quot;, &quot;no_show&quot;])
    .default(&quot;assigned&quot;),
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
    type: &quot;shift&quot; | &quot;event&quot; | &quot;unavailable&quot;;
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
