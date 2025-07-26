/**
 * Roster Management Events
 *
 * Event definitions for brand agent roster management system
 * with type-safe event payloads and comprehensive tracking.
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 */

/**
 * Roster management event types
 */
export const RosterEvents = {
  AGENT_ASSIGNED_TO_BRAND: "roster.agent.assigned.brand",
  AGENT_REMOVED_FROM_BRAND: "roster.agent.removed.brand",
  AGENT_SKILLS_UPDATED: "roster.agent.skills.updated",
  ROSTER_UPDATED: "roster.updated",
  ROSTER_OPTIMIZED: "roster.optimized",
  COVERAGE_ANALYSIS_COMPLETED: "roster.coverage.analyzed",
} as const;

/**
 * Agent assigned to brand event payload
 */
export interface AgentAssignedToBrandEvent {
  assignmentId: string;
  agentId: string;
  agentEmail: string;
  brandId: string;
  brandName: string;
  role: string;
  territoryIds?: string[];
  assignedBy: string;
  timestamp: string;
  action?: "assigned" | "removed";
}

/**
 * Agent skills updated event payload
 */
export interface AgentSkillsUpdatedEvent {
  agentId: string;
  agentEmail: string;
  skillsAdded: Array<{
    skillType: string;
    skillName: string;
    proficiencyLevel?: string;
  }>;
  skillsRemoved: Array<{
    skillId: string;
    skillName: string;
  }>;
  skillsModified: Array<{
    skillId: string;
    skillName: string;
    oldProficiency?: string;
    newProficiency?: string;
  }>;
  updatedBy: string;
  timestamp: string;
}

/**
 * General roster updated event payload
 */
export interface RosterUpdatedEvent {
  agentId?: string;
  brandId?: string;
  updateType: "assignment" | "skills" | "territory" | "status";
  details?: Record<string, any>;
  updatedBy: string;
  timestamp: string;
}

/**
 * Roster optimization event payload
 */
export interface RosterOptimizedEvent {
  organizationId: string;
  optimizationType: "coverage" | "skills" | "territory" | "workload";
  recommendations: Array<{
    type: string;
    priority: "high" | "medium" | "low";
    description: string;
    affectedAgents: string[];
  }>;
  metricsImproved: Record<string, number>;
  generatedBy: string;
  timestamp: string;
}

/**
 * Coverage analysis completed event payload
 */
export interface CoverageAnalysisEvent {
  organizationId: string;
  analysisType: "territory" | "skills" | "time" | "comprehensive";
  coverageMetrics: {
    overallCoverage: number;
    criticalGaps: number;
    redundancies: number;
    efficiency: number;
  };
  territoryAnalysis: Array<{
    territoryId: string;
    territoryName: string;
    coveragePercentage: number;
    requiredAgents: number;
    assignedAgents: number;
    skillGaps: string[];
  }>;
  skillAnalysis: Array<{
    skillName: string;
    demandLevel: "high" | "medium" | "low";
    availableAgents: number;
    requiredAgents: number;
    gapPercentage: number;
  }>;
  recommendations: Array<{
    type: string;
    priority: "high" | "medium" | "low";
    description: string;
    estimatedImpact: string;
  }>;
  analyzedBy: string;
  timestamp: string;
}
