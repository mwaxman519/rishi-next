/**
 * Shift Management Repository
 * Database access layer for shift management operations
 */

import { db } from "../../db";
import {
  shifts,
  shiftAssignments,
  systemEvents,
  users,
  locations,
  brands,
  organizations,
} from "@shared/schema";
import {
  eq,
  and,
  gte,
  lte,
  or,
  desc,
  asc,
  inArray,
  isNull,
  isNotNull,
} from "drizzle-orm";
import {
  ShiftDTO,
  ShiftAssignmentDTO,
  CreateShiftParams,
  UpdateShiftParams,
  ShiftFilters,
  AvailabilityCheck,
  AvailabilityResult,
  ShiftAssignmentParams,
} from "./models";

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export class ShiftRepository {
  /**
   * Find many shifts with optional filters and joins
   */
  async findMany(filters: ShiftFilters = {}): Promise<ShiftDTO[]> {
    try {
      const conditions = [];

      if (filters.organizationId) {
        conditions.push(eq(shifts.organizationId, filters.organizationId));
      }

      if (filters.eventId) {
        conditions.push(eq(shifts.eventId, filters.eventId));
      }

      if (filters.locationId) {
        conditions.push(eq(shifts.locationId, filters.locationId));
      }

      if (filters.brandId) {
        conditions.push(eq(shifts.brandId, filters.brandId));
      }

      if (filters.status) {
        conditions.push(eq(shifts.status, filters.status));
      }

      if (filters.startDate && filters.endDate) {
        conditions.push(
          and(
            gte(shifts.startDateTime, filters.startDate),
            lte(shifts.endDateTime, filters.endDate),
          ),
        );
      } else if (filters.startDate) {
        conditions.push(gte(shifts.startDateTime, filters.startDate));
      } else if (filters.endDate) {
        conditions.push(lte(shifts.endDateTime, filters.endDate));
      }

      // If filtering by agent, join with assignments
      if (filters.agentId) {
        const shiftsWithAgent = await db
          .select({
            shift: shifts,
            event: events,
            location: locations,
            brand: brands,
            organization: organizations,
            createdByUser: users,
          })
          .from(shifts)
          .innerJoin(shiftAssignments, eq(shifts.id, shiftAssignments.shiftId))
          .leftJoin(systemEvents, eq(shifts.eventId, systemEvents.id))
          .leftJoin(locations, eq(shifts.locationId, locations.id))
          .leftJoin(brands, eq(shifts.brandId, brands.id))
          .leftJoin(organizations, eq(shifts.organizationId, organizations.id))
          .leftJoin(users, eq(shifts.createdBy, users.id))
          .where(
            and(eq(shiftAssignments.agentId, filters.agentId), ...conditions),
          )
          .orderBy(asc(shifts.startDateTime));

        return shiftsWithAgent.map(this.mapToShiftDTO);
      }

      const results = await db
        .select({
          shift: shifts,
          event: systemEvents,
          location: locations,
          brand: brands,
          organization: organizations,
          createdByUser: users,
        })
        .from(shifts)
        .leftJoin(systemEvents, eq(shifts.eventId, systemEvents.id))
        .leftJoin(locations, eq(shifts.locationId, locations.id))
        .leftJoin(brands, eq(shifts.brandId, brands.id))
        .leftJoin(organizations, eq(shifts.organizationId, organizations.id))
        .leftJoin(users, eq(shifts.createdBy, users.id))
        .where(and(...conditions))
        .orderBy(asc(shifts.startDateTime));

      return results.map(this.mapToShiftDTO);
    } catch (error) {
      console.error("ShiftRepository.findAll error:", error);
      throw error;
    }
  }

  /**
   * Find a single shift by ID with all related data
   */
  async findById(id: string): Promise<ShiftDTO | null> {
    try {
      const [result] = await db
        .select({
          shift: shifts,
          event: systemEvents,
          location: locations,
          brand: brands,
          organization: organizations,
          createdByUser: users,
        })
        .from(shifts)
        .leftJoin(systemEvents, eq(shifts.eventId, systemEvents.id))
        .leftJoin(locations, eq(shifts.locationId, locations.id))
        .leftJoin(brands, eq(shifts.brandId, brands.id))
        .leftJoin(organizations, eq(shifts.organizationId, organizations.id))
        .leftJoin(users, eq(shifts.createdBy, users.id))
        .where(eq(shifts.id, id));

      if (!result) {
        return null;
      }

      const shiftDTO = this.mapToShiftDTO(result);

      // Load assignments for this shift
      const assignments = await this.getShiftAssignments(id);
      shiftDTO.assignments = assignments;

      return shiftDTO;
    } catch (error) {
      console.error("ShiftRepository.findById error:", error);
      throw error;
    }
  }

  /**
   * Create a new shift
   */
  async create(data: CreateShiftParams, createdBy: string): Promise<ShiftDTO> {
    try {
      const [createdShift] = await db
        .insert(shifts)
        .values({
          ...data,
          createdBy,
        })
        .returning();

      // Fetch the complete shift data
      const completeShift = await this.findById(createdShift.id);
      if (!completeShift) {
        throw new Error("Failed to retrieve created shift");
      }

      return completeShift;
    } catch (error) {
      console.error("ShiftRepository.create error:", error);
      throw error;
    }
  }

  /**
   * Update an existing shift
   */
  async update(id: string, data: UpdateShiftParams): Promise<ShiftDTO> {
    try {
      const [updatedShift] = await db
        .update(shifts)
        .set(data)
        .where(eq(shifts.id, id))
        .returning();

      if (!updatedShift) {
        throw new Error("Shift not found");
      }

      // Fetch the complete updated shift data
      const completeShift = await this.findById(updatedShift.id);
      if (!completeShift) {
        throw new Error("Failed to retrieve updated shift");
      }

      return completeShift;
    } catch (error) {
      console.error("ShiftRepository.update error:", error);
      throw error;
    }
  }

  /**
   * Delete a shift
   */
  async delete(id: string): Promise<void> {
    try {
      await db.delete(shifts).where(eq(shifts.id, id));
    } catch (error) {
      console.error("ShiftRepository.delete error:", error);
      throw error;
    }
  }

  /**
   * Create an assignment
   */
  async createAssignment(
    assignment: ShiftAssignmentParams,
    assignedBy: string,
  ): Promise<ShiftAssignmentDTO> {
    try {
      const [createdAssignment] = await db
        .insert(shiftAssignments)
        .values({
          ...assignment,
          assignedBy,
        })
        .returning();

      // Fetch the complete assignment data
      const completeAssignment = await this.getAssignmentById(
        createdAssignment.id,
      );
      if (!completeAssignment) {
        throw new Error("Failed to retrieve created assignment");
      }

      return completeAssignment;
    } catch (error) {
      console.error("ShiftRepository.assignAgent error:", error);
      throw error;
    }
  }

  /**
   * Update a shift assignment
   */
  async updateAssignment(
    id: string,
    data: Partial<ShiftAssignmentParams>,
  ): Promise<ShiftAssignmentDTO> {
    try {
      const [updatedAssignment] = await db
        .update(shiftAssignments)
        .set(data)
        .where(eq(shiftAssignments.id, id))
        .returning();

      if (!updatedAssignment) {
        throw new Error("Assignment not found");
      }

      // Fetch the complete updated assignment data
      const completeAssignment = await this.getAssignmentById(
        updatedAssignment.id,
      );
      if (!completeAssignment) {
        throw new Error("Failed to retrieve updated assignment");
      }

      return completeAssignment;
    } catch (error) {
      console.error("ShiftRepository.updateAssignment error:", error);
      throw error;
    }
  }

  /**
   * Remove an agent from a shift
   */
  async unassignAgent(shiftId: string, agentId: string): Promise<void> {
    try {
      await db
        .delete(shiftAssignments)
        .where(
          and(
            eq(shiftAssignments.shiftId, shiftId),
            eq(shiftAssignments.agentId, agentId),
          ),
        );
    } catch (error) {
      console.error("ShiftRepository.unassignAgent error:", error);
      throw error;
    }
  }

  /**
   * Get all assignments for a shift
   */
  async getShiftAssignments(shiftId: string): Promise<ShiftAssignmentDTO[]> {
    try {
      const results = await db
        .select({
          assignment: shiftAssignments,
          agent: users,
          assignedByUser: users,
        })
        .from(shiftAssignments)
        .leftJoin(users, eq(shiftAssignments.agentId, users.id))
        .leftJoin(users, eq(shiftAssignments.assignedBy, users.id))
        .where(eq(shiftAssignments.shiftId, shiftId));

      return results.map((result) => ({
        ...result.assignment,
        agent: result.agent
          ? {
              id: result.agent.id,
              firstName: result.agent.firstName || "",
              lastName: result.agent.lastName || "",
              email: result.agent.email,
            }
          : undefined,
        assignedByUser: result.assignedByUser
          ? {
              id: result.assignedByUser.id,
              firstName: result.assignedByUser.firstName || "",
              lastName: result.assignedByUser.lastName || "",
            }
          : undefined,
      }));
    } catch (error) {
      console.error("ShiftRepository.getShiftAssignments error:", error);
      throw error;
    }
  }

  /**
   * Get assignments for an agent
   */
  async getAgentAssignments(
    agentId: string,
    filters: ShiftFilters = {},
  ): Promise<ShiftAssignmentDTO[]> {
    try {
      const conditions = [eq(shiftAssignments.agentId, agentId)];

      if (filters.startDate && filters.endDate) {
        conditions.push(
          and(
            gte(shifts.startDateTime, filters.startDate),
            lte(shifts.endDateTime, filters.endDate),
          ),
        );
      }

      const results = await db
        .select({
          assignment: shiftAssignments,
          shift: shifts,
          assignedByUser: users,
        })
        .from(shiftAssignments)
        .innerJoin(shifts, eq(shiftAssignments.shiftId, shifts.id))
        .leftJoin(users, eq(shiftAssignments.assignedBy, users.id))
        .where(and(...conditions))
        .orderBy(asc(shifts.startDateTime));

      return results.map((result) => ({
        ...result.assignment,
        shift: result.shift
          ? {
              id: result.shift.id,
              title: result.shift.title,
              startDateTime: result.shift.startDateTime,
              endDateTime: result.shift.endDateTime,
            }
          : undefined,
        assignedByUser: result.assignedByUser
          ? {
              id: result.assignedByUser.id,
              firstName: result.assignedByUser.firstName || "",
              lastName: result.assignedByUser.lastName || "",
            }
          : undefined,
      }));
    } catch (error) {
      console.error("ShiftRepository.getAgentAssignments error:", error);
      throw error;
    }
  }

  /**
   * Check agent availability for a time period
   */
  async checkAvailability(
    check: AvailabilityCheck,
  ): Promise<AvailabilityResult> {
    try {
      // Check for conflicting shifts
      const conflictingShifts = await db
        .select({
          shift: shifts,
          assignment: shiftAssignments,
        })
        .from(shiftAssignments)
        .innerJoin(shifts, eq(shiftAssignments.shiftId, shifts.id))
        .where(
          and(
            eq(shiftAssignments.agentId, check.agentId),
            or(
              // Overlapping time periods
              and(
                lte(shifts.startDateTime, check.endDateTime),
                gte(shifts.endDateTime, check.startDateTime),
              ),
            ),
          ),
        );

      const conflicts = conflictingShifts.map((result) => ({
        type: "shift" as const,
        id: result.shift.id,
        title: result.shift.title,
        startDateTime: result.shift.startDateTime,
        endDateTime: result.shift.endDateTime,
      }));

      return {
        available: conflicts.length === 0,
        conflicts,
      };
    } catch (error) {
      console.error("ShiftRepository.checkAvailability error:", error);
      throw error;
    }
  }

  /**
   * Get assignment by ID
   */
  private async getAssignmentById(
    id: string,
  ): Promise<ShiftAssignmentDTO | null> {
    try {
      const [result] = await db
        .select({
          assignment: shiftAssignments,
          shift: shifts,
          agent: users,
          assignedByUser: users,
        })
        .from(shiftAssignments)
        .leftJoin(shifts, eq(shiftAssignments.shiftId, shifts.id))
        .leftJoin(users, eq(shiftAssignments.agentId, users.id))
        .leftJoin(users, eq(shiftAssignments.assignedBy, users.id))
        .where(eq(shiftAssignments.id, id));

      if (!result) {
        return null;
      }

      return {
        ...result.assignment,
        shift: result.shift
          ? {
              id: result.shift.id,
              title: result.shift.title,
              startDateTime: result.shift.startDateTime,
              endDateTime: result.shift.endDateTime,
            }
          : undefined,
        agent: result.agent
          ? {
              id: result.agent.id,
              firstName: result.agent.firstName || "",
              lastName: result.agent.lastName || "",
              email: result.agent.email,
            }
          : undefined,
        assignedByUser: result.assignedByUser
          ? {
              id: result.assignedByUser.id,
              firstName: result.assignedByUser.firstName || "",
              lastName: result.assignedByUser.lastName || "",
            }
          : undefined,
      };
    } catch (error) {
      console.error("ShiftRepository.getAssignmentById error:", error);
      throw error;
    }
  }

  /**
   * Map database result to ShiftDTO
   */
  private mapToShiftDTO(result: any): ShiftDTO {
    const shift: ShiftDTO = {
      ...result.shift,
      event: result.event
        ? {
            id: result.event.id,
            title: result.event.title,
          }
        : undefined,
      location: result.location
        ? {
            id: result.location.id,
            name: result.location.name,
            address:
              `${result.location.address1 || ""} ${result.location.address2 || ""}`.trim(),
          }
        : undefined,
      brand: result.brand
        ? {
            id: result.brand.id,
            name: result.brand.name,
          }
        : undefined,
      organization: result.organization
        ? {
            id: result.organization.id,
            name: result.organization.name,
          }
        : undefined,
      createdByUser: result.createdByUser
        ? {
            id: result.createdByUser.id,
            firstName: result.createdByUser.firstName || "",
            lastName: result.createdByUser.lastName || "",
          }
        : undefined,
    };

    return shift;
  }
}
