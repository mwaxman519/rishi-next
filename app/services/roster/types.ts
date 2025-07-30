/**
 * Roster Service Types
 *
 * Type definitions for brand agent roster management system
 * with comprehensive validation and business logic types.
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 */

import { z } from &quot;zod&quot;;
import { InsertBrandAgentAssignment } from &quot;@shared/schema&quot;;

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
  PRIMARY: &quot;primary&quot;,
  BACKUP: &quot;backup&quot;,
  SEASONAL: &quot;seasonal&quot;,
  TEMPORARY: &quot;temporary&quot;,
} as const;

export type AssignmentRole =
  (typeof AssignmentRoles)[keyof typeof AssignmentRoles];

/**
 * Validation schema for brand agent assignment
 */
export const brandAgentAssignmentSchema = z
  .object({
    userId: z.string().uuid(&quot;Invalid user ID&quot;),
    brandId: z.string().uuid(&quot;Invalid brand ID&quot;),
    assignmentRole: z.enum([&quot;primary&quot;, &quot;backup&quot;, &quot;seasonal&quot;, &quot;temporary&quot;], {
      errorMap: () => ({
        message: &quot;Role must be primary, backup, seasonal, or temporary&quot;,
      }),
    }),
    startDate: z.date().min(new Date(), &quot;Start date cannot be in the past&quot;),
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
      message: &quot;End date must be after start date&quot;,
      path: [&quot;endDate&quot;],
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
  userId: z.string().uuid(&quot;Invalid user ID&quot;),
  skillType: z.enum([&quot;certification&quot;, &quot;language&quot;, &quot;specialty&quot;, &quot;equipment&quot;], {
    errorMap: () => ({
      message:
        &quot;Skill type must be certification, language, specialty, or equipment&quot;,
    }),
  }),
  skillName: z
    .string()
    .min(1, &quot;Skill name is required&quot;)
    .max(200, &quot;Skill name too long&quot;),
  proficiencyLevel: z.enum([&quot;beginner&quot;, &quot;intermediate&quot;, &quot;expert&quot;]).optional(),
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
    | &quot;existing_assignment&quot;
    | &quot;skill_mismatch&quot;
    | &quot;territory_unavailable&quot;;
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
    | &quot;coverage_gap&quot;
    | &quot;overallocation&quot;
    | &quot;skill_improvement&quot;
    | &quot;territory_rebalance&quot;;
  priority: &quot;high&quot; | &quot;medium&quot; | &quot;low&quot;;
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
