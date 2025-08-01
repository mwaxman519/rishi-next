/**
 * BA Roster Management Service
 *
 * Core business logic for managing brand agent assignments, skills tracking,
 * and roster optimization. Implements microservices pattern with event-driven
 * architecture for scalable workforce management.
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 */

import { eq, and, desc, inArray, like, sql } from "drizzle-orm";
import { db } from "../../db";
import {
  brandAgentAssignments,
  agentSkills,
  users,
  brands,
  regions,
  userOrganizations,
  type BrandAgentAssignment,
  type InsertBrandAgentAssignment,
} from "../../../shared/schema";
import { EventBus } from "../core/EventBus";
import { AuditService } from "../core/AuditService";
import {
  RosterEvents,
  type AgentAssignedToBrandEvent,
  type RosterUpdatedEvent,
} from "./events";
import {
  validateBrandAgentAssignment,
  type AgentSearchCriteria,
  type BrandAgent,
} from "./types";

/**
 * Interface defining roster management operations
 */
export interface IRosterService {
  getBrandAgents(
    organizationId: string,
    brandId?: string,
  ): Promise<BrandAgent[]>;
  assignAgentToBrand(
    assignment: InsertBrandAgentAssignment,
    assignedBy: string,
  ): Promise<BrandAgentAssignment>;
  removeAgentFromBrand(assignmentId: string, removedBy: string): Promise<void>;
  getAgentAssignments(agentId: string): Promise<BrandAgentAssignment[]>;
  searchAvailableAgents(criteria: AgentSearchCriteria): Promise<BrandAgent[]>;
  getAgentSkills(agentId: string): Promise<any[]>;
  updateAgentSkills(
    agentId: string,
    skills: any[],
    updatedBy: string,
  ): Promise<void>;
}

/**
 * Roster Service Implementation
 */
export class RosterService implements IRosterService {
  constructor(
    private eventBus: EventBus,
    private auditService: AuditService,
  ) {}

  async getBrandAgents(
    organizationId: string,
    brandId?: string,
  ): Promise<BrandAgent[]> {
    try {
      const conditions = [
        eq(brands.organizationId, organizationId),
        eq(brandAgentAssignments.isActive, true),
      ];

      if (brandId) {
        conditions.push(eq(brandAgentAssignments.brandId, brandId));
      }

      const result = await db
        .select({
          assignmentId: brandAgentAssignments.id,
          agentId: users.id,
          agentEmail: users.email,
          agentFirstName: users.firstName,
          agentLastName: users.lastName,
          agentPhone: users.phone,
          brandId: brands.id,
          brandName: brands.name,
          assignmentRole: brandAgentAssignments.assignmentRole,
          startDate: brandAgentAssignments.startDate,
          endDate: brandAgentAssignments.endDate,
          skills: brandAgentAssignments.skills,
          territoryIds: brandAgentAssignments.territoryIds,
          isActive: brandAgentAssignments.isActive,
          createdAt: brandAgentAssignments.createdAt,
        })
        .from(brandAgentAssignments)
        .innerJoin(users, eq(brandAgentAssignments.userId, users.id))
        .innerJoin(brands, eq(brandAgentAssignments.brandId, brands.id))
        .where(and(...conditions))
        .orderBy(desc(brandAgentAssignments.createdAt));

      const agentMap = new Map<string, BrandAgent>();

      for (const row of result) {
        const agentId = row.agentId;

        if (!agentMap.has(agentId)) {
          const skills = await this.getAgentSkills(agentId);

          agentMap.set(agentId, {
            id: agentId,
            email: row.agentEmail,
            firstName: row.agentFirstName,
            lastName: row.agentLastName,
            phone: row.agentPhone,
            skills: skills,
            brandAssignments: [],
            isActive: true,
          });
        }

        const agent = agentMap.get(agentId)!;
        agent.brandAssignments.push({
          assignmentId: row.assignmentId,
          brandId: row.brandId,
          brandName: row.brandName,
          role: row.assignmentRole,
          startDate: row.startDate,
          endDate: row.endDate,
          territoryIds: row.territoryIds || [],
          isActive: row.isActive,
          createdAt: row.createdAt,
        });
      }

      return Array.from(agentMap.values());
    } catch (error) {
      console.error("Error retrieving brand agents:", error);
      throw new Error("Failed to retrieve brand agents");
    }
  }

  async assignAgentToBrand(
    assignment: InsertBrandAgentAssignment,
    assignedBy: string,
  ): Promise<BrandAgentAssignment> {
    try {
      const validatedAssignment = validateBrandAgentAssignment(assignment);

      const existingAssignment = await db
        .select()
        .from(brandAgentAssignments)
        .where(
          and(
            eq(brandAgentAssignments.userId, validatedAssignment.userId),
            eq(brandAgentAssignments.brandId, validatedAssignment.brandId),
            eq(
              brandAgentAssignments.assignmentRole,
              validatedAssignment.assignmentRole,
            ),
            eq(brandAgentAssignments.isActive, true),
          ),
        )
        .limit(1);

      if (existingAssignment.length > 0) {
        throw new Error(
          `Agent is already assigned to this brand as ${validatedAssignment.assignmentRole}`,
        );
      }

      const agent = await db
        .select({
          id: users.id,
          email: users.email,
          role: userOrganizations.role,
        })
        .from(users)
        .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
        .where(
          and(
            eq(users.id, validatedAssignment.userId),
            eq(users.isActive, true),
          ),
        )
        .limit(1);

      if (agent.length === 0) {
        throw new Error("Agent not found or not active");
      }

      const brand = await db
        .select()
        .from(brands)
        .where(
          and(
            eq(brands.id, validatedAssignment.brandId),
            eq(brands.isActive, true),
          ),
        )
        .limit(1);

      if (brand.length === 0) {
        throw new Error("Brand not found or not active");
      }

      const [createdAssignment] = await db
        .insert(brandAgentAssignments)
        .values({
          ...validatedAssignment,
          createdBy: assignedBy,
        })
        .returning();

      const assignmentEvent: AgentAssignedToBrandEvent = {
        assignmentId: createdAssignment.id,
        agentId: validatedAssignment.userId,
        agentEmail: agent[0].email,
        brandId: validatedAssignment.brandId,
        brandName: brand[0].name,
        role: validatedAssignment.assignmentRole,
        assignedBy,
        timestamp: new Date().toISOString(),
      };

      await this.eventBus.publish(
        RosterEvents.AGENT_ASSIGNED_TO_BRAND,
        assignmentEvent,
      );

      await this.auditService.log({
        action: "AGENT_ASSIGNED_TO_BRAND",
        entityType: "BRAND_AGENT_ASSIGNMENT",
        entityId: createdAssignment.id,
        userId: assignedBy,
        details: {
          agentId: validatedAssignment.userId,
          brandId: validatedAssignment.brandId,
          role: validatedAssignment.assignmentRole,
          territoryIds: validatedAssignment.territoryIds,
        },
      });

      return createdAssignment;
    } catch (error) {
      console.error("Error assigning agent to brand:", error);
      throw error;
    }
  }

  async removeAgentFromBrand(
    assignmentId: string,
    removedBy: string,
  ): Promise<void> {
    try {
      const assignment = await db
        .select({
          id: brandAgentAssignments.id,
          userId: brandAgentAssignments.userId,
          brandId: brandAgentAssignments.brandId,
          role: brandAgentAssignments.assignmentRole,
          agentEmail: users.email,
          brandName: brands.name,
        })
        .from(brandAgentAssignments)
        .innerJoin(users, eq(brandAgentAssignments.userId, users.id))
        .innerJoin(brands, eq(brandAgentAssignments.brandId, brands.id))
        .where(eq(brandAgentAssignments.id, assignmentId))
        .limit(1);

      if (assignment.length === 0) {
        throw new Error("Assignment not found");
      }

      await db
        .update(brandAgentAssignments)
        .set({
          isActive: false,
          updated_at: new Date(),
        })
        .where(eq(brandAgentAssignments.id, assignmentId));

      const removalEvent: AgentAssignedToBrandEvent = {
        assignmentId,
        agentId: assignment[0].userId,
        agentEmail: assignment[0].agentEmail,
        brandId: assignment[0].brandId,
        brandName: assignment[0].brandName,
        role: assignment[0].role,
        assignedBy: removedBy,
        timestamp: new Date().toISOString(),
        action: "removed",
      };

      await this.eventBus.publish(
        RosterEvents.AGENT_REMOVED_FROM_BRAND,
        removalEvent,
      );

      await this.auditService.log({
        action: "AGENT_REMOVED_FROM_BRAND",
        entityType: "BRAND_AGENT_ASSIGNMENT",
        entityId: assignmentId,
        userId: removedBy,
        details: {
          agentId: assignment[0].userId,
          brandId: assignment[0].brandId,
          role: assignment[0].role,
        },
      });
    } catch (error) {
      console.error("Error removing agent from brand:", error);
      throw error;
    }
  }

  async getAgentAssignments(agentId: string): Promise<BrandAgentAssignment[]> {
    try {
      const assignments = await db
        .select()
        .from(brandAgentAssignments)
        .where(
          and(
            eq(brandAgentAssignments.userId, agentId),
            eq(brandAgentAssignments.isActive, true),
          ),
        )
        .orderBy(desc(brandAgentAssignments.createdAt));

      return assignments;
    } catch (error) {
      console.error("Error retrieving agent assignments:", error);
      throw new Error("Failed to retrieve agent assignments");
    }
  }

  async searchAvailableAgents(
    criteria: AgentSearchCriteria,
  ): Promise<BrandAgent[]> {
    try {
      let query = db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
        })
        .from(users)
        .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
        .where(
          and(
            eq(users.isActive, true),
            eq(userOrganizations.isActive, true),
            eq(userOrganizations.role, "brand_agent"),
          ),
        );

      if (criteria.organizationId) {
        query = query.where(
          eq(userOrganizations.organizationId, criteria.organizationId),
        );
      }

      if (criteria.searchTerm) {
        const searchCondition = sql`LOWER(${users.firstName}) LIKE ${"%" + criteria.searchTerm.toLowerCase() + "%"} OR LOWER(${users.lastName}) LIKE ${"%" + criteria.searchTerm.toLowerCase() + "%"} OR LOWER(${users.email}) LIKE ${"%" + criteria.searchTerm.toLowerCase() + "%"}`;
        query = query.where(searchCondition);
      }

      const result = await query.orderBy(users.firstName, users.lastName);

      const agents: BrandAgent[] = [];
      for (const user of result) {
        const skills = await this.getAgentSkills(user.id);
        const assignments = await this.getAgentAssignments(user.id);

        agents.push({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          skills,
          brandAssignments: assignments.map((a) => ({
            assignmentId: a.id,
            brandId: a.brandId,
            brandName: "",
            role: a.assignmentRole,
            startDate: a.startDate,
            endDate: a.endDate,
            territoryIds: a.territoryIds || [],
            isActive: a.isActive,
            createdAt: a.createdAt,
          })),
          isActive: true,
        });
      }

      return agents;
    } catch (error) {
      console.error("Error searching available agents:", error);
      throw new Error("Failed to search available agents");
    }
  }

  async getAgentSkills(agentId: string): Promise<any[]> {
    try {
      const skills = await db
        .select()
        .from(agentSkills)
        .where(eq(agentSkills.userId, agentId))
        .orderBy(agentSkills.skillType, agentSkills.skillName);

      return skills;
    } catch (error) {
      console.error("Error retrieving agent skills:", error);
      return [];
    }
  }

  async updateAgentSkills(
    agentId: string,
    skills: any[],
    updatedBy: string,
  ): Promise<void> {
    try {
      await this.auditService.log({
        action: "AGENT_SKILLS_UPDATED",
        entityType: "AGENT_SKILLS",
        entityId: agentId,
        userId: updatedBy,
        details: { skillsCount: skills.length },
      });

      const rosterEvent: RosterUpdatedEvent = {
        agentId,
        updateType: "skills",
        updatedBy,
        timestamp: new Date().toISOString(),
      };

      await this.eventBus.publish(RosterEvents.ROSTER_UPDATED, rosterEvent);
    } catch (error) {
      console.error("Error updating agent skills:", error);
      throw error;
    }
  }
}

export const rosterService = new RosterService(
  new EventBus(),
  new AuditService(),
);
