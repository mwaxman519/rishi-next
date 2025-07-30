/**
 * Roster Service Types
 *
 * Type definitions for brand agent roster management system
 * with comprehensive validation and business logic types.
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 */

import { z } from "zod";
import { InsertBrandAgentAssignment } from "@shared/schema";

/**
 * Brand Agent representation with assignments and skills
 */
export interface BrandAgent {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  skills: AgentSkill[];
  brandAssignments: BrandAssignmentSummary[];
  isActive: boolean;
}

/**
 * Agent skill information
 */
export interface AgentSkill {
  id: string;
  skillType: string;
  skillName: string;
  proficiencyLevel: string | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * Brand assignment summary for roster display
 */
export interface BrandAssignmentSummary {
  assignmentId: string;
  brandId: string;
  brandName: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  territoryIds: string[];
  isActive: boolean;
  createdAt: Date;
}

/**
 * Search criteria for finding available agents
 */
export interface AgentSearchCriteria {
  organizationId?: string;
  searchTerm?: string;
  skills?: string[];
  availableFrom?: Date;
  availableTo?: Date;
  territoryIds?: string[];
  excludeAssignedTo?: string; // Exclude agents already assigned to this brand
}

/**
 * Roster statistics and metrics
 */
export interface RosterMetrics {
  totalAgents: number;
  activeAssignments: number;
  availableAgents: number;
  skillsCoverage: Record<string, number>;
  territoryCoverage: Record<string, number>;
  averageAssignmentsPerAgent: number;
}

/**
 * Assignment role types
 */
export const AssignmentRoles = {
  PRIMARY: "primary",
  BACKUP: "backup",
  SEASONAL: "seasonal",
  TEMPORARY: "temporary",
} as const;

export type AssignmentRole =
  (typeof AssignmentRoles)[keyof typeof AssignmentRoles];

/**
 * Validation schema for brand agent assignment
 */
export const brandAgentAssignmentSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID"),
    brandId: z.string().uuid("Invalid brand ID"),
    assignmentRole: z.enum(["primary", "backup", "seasonal", "temporary"], {
      errorMap: () => ({
        message: "Role must be primary, backup, seasonal, or temporary",
      }),
    }),
    startDate: z.date().min(new Date(), "Start date cannot be in the past"),
    endDate: z.date().optional(),
    skills: z.record(z.any()).optional(),
    territoryIds: z.array(z.string().uuid()).optional().default([]),
  })
  .refine(
    (data) => {
      if (data.endDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

/**
 * Validation function for brand agent assignments
 */
export function validateBrandAgentAssignment(
  assignment: any,
): InsertBrandAgentAssignment {
  const result = brandAgentAssignmentSchema.parse(assignment);

  return {
    userId: result.userId,
    brandId: result.brandId,
    assignmentRole: result.assignmentRole,
    startDate: result.startDate,
    endDate: result.endDate || null,
    skills: result.skills || null,
    territoryIds: result.territoryIds || null,
    isActive: true,
  };
}

/**
 * Agent skill validation schema
 */
export const agentSkillSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  skillType: z.enum(["certification", "language", "specialty", "equipment"], {
    errorMap: () => ({
      message:
        "Skill type must be certification, language, specialty, or equipment",
    }),
  }),
  skillName: z
    .string()
    .min(1, "Skill name is required")
    .max(200, "Skill name too long"),
  proficiencyLevel: z.enum(["beginner", "intermediate", "expert"]).optional(),
  expiresAt: z.date().optional(),
});

/**
 * Bulk assignment operation type
 */
export interface BulkAssignmentOperation {
  agentIds: string[];
  brandId: string;
  role: AssignmentRole;
  startDate: Date;
  endDate?: Date;
  territoryIds?: string[];
}

/**
 * Assignment conflict information
 */
export interface AssignmentConflict {
  agentId: string;
  agentName: string;
  conflictType:
    | "existing_assignment"
    | "skill_mismatch"
    | "territory_unavailable";
  conflictDetails: string;
  existingAssignment?: {
    brandId: string;
    brandName: string;
    role: string;
    startDate: Date;
    endDate?: Date;
  };
}

/**
 * Roster optimization suggestion
 */
export interface RosterOptimizationSuggestion {
  type:
    | "coverage_gap"
    | "overallocation"
    | "skill_improvement"
    | "territory_rebalance";
  priority: "high" | "medium" | "low";
  description: string;
  affectedAgents: string[];
  suggestedActions: string[];
  estimatedImpact: string;
}

/**
 * Territory coverage analysis
 */
export interface TerritoryCoverage {
  territoryId: string;
  territoryName: string;
  assignedAgents: number;
  requiredAgents: number;
  coveragePercentage: number;
  skillGaps: string[];
  recommendations: string[];
}
