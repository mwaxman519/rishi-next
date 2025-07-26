/**
 * Staff Service Models
 * These models define the core entities and types for staff management
 */
import { z } from "zod";

/**
 * Staff member status
 */
export enum StaffStatus {
  PENDING = "pending", // New staff member pending approval
  ACTIVE = "active", // Active and available for assignments
  INACTIVE = "inactive", // Temporarily unavailable
  SUSPENDED = "suspended", // Suspended due to policy violation
  TERMINATED = "terminated", // Employment terminated
}

/**
 * Staff member type
 */
export enum StaffType {
  FULL_TIME = "full_time", // Full-time staff
  PART_TIME = "part_time", // Part-time staff
  CONTRACTOR = "contractor", // Independent contractor
  VOLUNTEER = "volunteer", // Volunteer staff
  SEASONAL = "seasonal", // Seasonal worker
  TEMP = "temp", // Temporary worker
}

/**
 * Staff skill level
 */
export enum SkillLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert",
}

/**
 * Staff member entity
 */
export interface StaffMember {
  id: string;
  userId: string; // References user account
  fullName: string; // Name displayed in staff listings
  email: string; // Primary contact email
  phone?: string; // Contact phone
  type: StaffType; // Employment type
  status: StaffStatus; // Current status
  organizationId: string; // Organization this staff belongs to
  title?: string; // Job title
  department?: string; // Department
  manager?: string; // Manager or supervisor ID
  hireDate: string; // ISO date string
  terminationDate?: string; // ISO date string
  notes?: string; // Administrative notes
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Staff skill entity
 */
export interface StaffSkill {
  id: string;
  staffId: string;
  skillId: string;
  skillName?: string; // Denormalized for convenience
  level: SkillLevel;
  certified: boolean; // Whether formally certified
  certificationDate?: string; // ISO date string
  certificationExpiry?: string; // ISO date string
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Staff availability entity
 */
export interface StaffAvailability {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // Format: "HH:MM" in 24-hour
  endTime: string; // Format: "HH:MM" in 24-hour
  isAvailable: boolean; // Whether available during this time slot
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Staff time off request entity
 */
export interface TimeOffRequest {
  id: string;
  staffId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  type: "vacation" | "sick" | "personal" | "bereavement" | "other";
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason?: string;
  notes?: string;
  reviewerId?: string;
  reviewDate?: string; // ISO date string
  rejectionReason?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Create staff member schema
 */
export const createStaffMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  type: z.nativeEnum(StaffType),
  organizationId: z.string().min(1, "Organization ID is required"),
  title: z.string().optional(),
  department: z.string().optional(),
  manager: z.string().optional(),
  hireDate: z.string().datetime("Invalid date format"),
  notes: z.string().optional(),
});

/**
 * Update staff member schema
 */
export const updateStaffMemberSchema = createStaffMemberSchema
  .partial()
  .extend({
    status: z.nativeEnum(StaffStatus).optional(),
    terminationDate: z.string().datetime("Invalid date format").optional(),
  });

/**
 * Create staff skill schema
 */
export const createStaffSkillSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  skillId: z.string().min(1, "Skill ID is required"),
  level: z.nativeEnum(SkillLevel),
  certified: z.boolean().default(false),
  certificationDate: z.string().datetime("Invalid date format").optional(),
  certificationExpiry: z.string().datetime("Invalid date format").optional(),
  notes: z.string().optional(),
});

/**
 * Update staff skill schema
 */
export const updateStaffSkillSchema = createStaffSkillSchema
  .omit({ staffId: true, skillId: true })
  .partial();

/**
 * Create availability schema
 */
export const createAvailabilitySchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  dayOfWeek: z.number().min(0).max(6),
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
  isAvailable: z.boolean().default(true),
  notes: z.string().optional(),
});

/**
 * Update availability schema
 */
export const updateAvailabilitySchema = createAvailabilitySchema
  .omit({ staffId: true })
  .partial();

/**
 * Create time off request schema
 */
export const createTimeOffRequestSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  startDate: z.string().datetime("Invalid date format"),
  endDate: z.string().datetime("Invalid date format"),
  type: z.enum(["vacation", "sick", "personal", "bereavement", "other"]),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Update time off request schema
 */
export const updateTimeOffRequestSchema = createTimeOffRequestSchema
  .omit({ staffId: true })
  .partial();

/**
 * Approve time off request schema
 */
export const approveTimeOffRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  notes: z.string().optional(),
});

/**
 * Reject time off request schema
 */
export const rejectTimeOffRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  rejectionReason: z.string().min(1, "Rejection reason is required"),
  notes: z.string().optional(),
});

/**
 * Staff search filters
 */
export interface StaffFilters {
  organizationId?: string;
  status?: StaffStatus | StaffStatus[];
  type?: StaffType | StaffType[];
  department?: string;
  skillId?: string;
  skillLevel?: SkillLevel;
  q?: string; // Search term for name/email
  availableOn?: string; // ISO date string to check availability
  availableStartTime?: string; // Format: "HH:MM" in 24-hour
  availableEndTime?: string; // Format: "HH:MM" in 24-hour
}

// Types derived from schemas
export type CreateStaffMemberParams = z.infer<typeof createStaffMemberSchema>;
export type UpdateStaffMemberParams = z.infer<typeof updateStaffMemberSchema>;
export type CreateStaffSkillParams = z.infer<typeof createStaffSkillSchema>;
export type UpdateStaffSkillParams = z.infer<typeof updateStaffSkillSchema>;
export type CreateAvailabilityParams = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityParams = z.infer<typeof updateAvailabilitySchema>;
export type CreateTimeOffRequestParams = z.infer<
  typeof createTimeOffRequestSchema
>;
export type UpdateTimeOffRequestParams = z.infer<
  typeof updateTimeOffRequestSchema
>;
export type ApproveTimeOffRequestParams = z.infer<
  typeof approveTimeOffRequestSchema
>;
export type RejectTimeOffRequestParams = z.infer<
  typeof rejectTimeOffRequestSchema
>;
