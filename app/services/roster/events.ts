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
  AGENT_ASSIGNED_TO_BRAND: &quot;roster.agent.assigned.brand&quot;,
  AGENT_REMOVED_FROM_BRAND: &quot;roster.agent.removed.brand&quot;,
  AGENT_SKILLS_UPDATED: &quot;roster.agent.skills.updated&quot;,
  ROSTER_UPDATED: &quot;roster.updated&quot;,
  ROSTER_OPTIMIZED: &quot;roster.optimized&quot;,
  COVERAGE_ANALYSIS_COMPLETED: &quot;roster.coverage.analyzed&quot;,
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
  action?: &quot;assigned&quot; | &quot;removed&quot;;
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
  updateType: &quot;assignment&quot; | &quot;skills&quot; | &quot;territory&quot; | &quot;status&quot;;
  details?: Record<string, any>;
  updatedBy: string;
  timestamp: string;
}

/**
 * Roster optimization event payload
 */
export interface RosterOptimizedEvent {
  organizationId: string;
  optimizationType: &quot;coverage&quot; | &quot;skills&quot; | &quot;territory&quot; | &quot;workload&quot;;
  recommendations: Array<{
    type: string;
    priority: &quot;high&quot; | &quot;medium&quot; | &quot;low&quot;;
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
  analysisType: &quot;territory&quot; | &quot;skills&quot; | &quot;time&quot; | &quot;comprehensive&quot;;
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
    demandLevel: &quot;high&quot; | &quot;medium&quot; | &quot;low&quot;;
    availableAgents: number;
    requiredAgents: number;
    gapPercentage: number;
  }>;
  recommendations: Array<{
    type: string;
    priority: &quot;high&quot; | &quot;medium&quot; | &quot;low&quot;;
    description: string;
    estimatedImpact: string;
  }>;
  analyzedBy: string;
  timestamp: string;
}
