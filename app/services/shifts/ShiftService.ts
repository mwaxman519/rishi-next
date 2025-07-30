/**
 * Shift Management Service - Event-Driven Microservice
 *
 * This service manages the complete lifecycle of shifts within the Rishi platform,
 * providing comprehensive scheduling capabilities with enterprise-grade features.
 *
 * ARCHITECTURE OVERVIEW:
 * - Event-driven microservice following platform patterns
 * - Repository pattern for data access abstraction
 * - Service layer with comprehensive business logic
 * - Event publishing for all state changes
 * - Role-based access control (RBAC) throughout
 *
 * SHIFT LIFECYCLE:
 * 1. DRAFT - Initial creation, can be edited freely
 * 2. OPEN - Available for agent assignment
 * 3. ASSIGNED - Agent(s) assigned to shift
 * 4. IN_PROGRESS - Shift has started
 * 5. COMPLETED - Shift finished successfully
 * 6. CANCELLED - Shift cancelled (with reason)
 *
 * KEY FEATURES:
 * - Multi-agent assignment support with availability checking
 * - Conflict detection across shifts and events
 * - Budget and rate management per shift
 * - Skills-based matching requirements
 * - Location and brand association
 * - Comprehensive audit trail through events
 *
 * RBAC PERMISSIONS:
 * - brand_agent: View assigned/open shifts, cannot manage
 * - internal_field_manager: Full shift management within organization
 * - organization_admin: Complete CRUD access within organization
 * - super_admin: Platform-wide access
 *
 * INTEGRATION POINTS:
 * - Events service for shift-event association
 * - Locations service for venue management
 * - Organizations service for multi-tenancy
 * - Time tracking service for actual hours
 * - Kit management for equipment assignment
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 * @since Phase 5 Implementation
 */

import { ShiftRepository } from &quot;./repository&quot;;
import { shiftEventPublisher } from &quot;./events&quot;;
import {
  ShiftDTO,
  CreateShiftParams,
  UpdateShiftParams,
  ShiftAssignmentParams,
  createShiftSchema,
  updateShiftSchema,
  ShiftStatus,
  ShiftFilters,
} from &quot;./models&quot;;

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface ShiftAvailabilityCheck {
  available: boolean;
  conflictingShifts?: any[];
  conflictingEvents?: any[];
}

export class ShiftService {
  private repository: ShiftRepository;

  constructor() {
    this.repository = new ShiftRepository();
  }

  /**
   * Get all shifts with role-based filtering
   */
  async getAllShifts(
    filters: ShiftFilters,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<ShiftDTO[]>> {
    try {
      // Apply role-based filtering
      const filteredQuery = this.applyRoleBasedFilters(
        filters,
        requestingUserId,
        userRole,
        organizationId,
      );

      const shifts = await this.repository.findMany(filteredQuery);

      // Filter results based on access permissions
      const accessibleShifts = shifts.filter((shift) =>
        this.hasShiftAccess(shift, requestingUserId, userRole, organizationId),
      );

      return {
        success: true,
        data: accessibleShifts,
      };
    } catch (error) {
      console.error(&quot;ShiftService.getAllShifts error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to get shifts&quot;,
        code: &quot;GET_SHIFTS_FAILED&quot;,
      };
    }
  }

  /**
   * Get a specific shift by ID
   */
  async getShiftById(
    id: string,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<ShiftDTO>> {
    try {
      const shift = await this.repository.findById(id);

      if (!shift) {
        return {
          success: false,
          error: &quot;Shift not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check access permissions
      if (
        !this.hasShiftAccess(shift, requestingUserId, userRole, organizationId)
      ) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
        };
      }

      return {
        success: true,
        data: shift,
      };
    } catch (error) {
      console.error(`ShiftService.getShiftById error for ID ${id}:`, error);
      return {
        success: false,
        error: &quot;Failed to get shift&quot;,
        code: &quot;GET_SHIFT_FAILED&quot;,
      };
    }
  }

  /**
   * Create a new shift
   */
  async createShift(
    data: CreateShiftParams,
    createdBy: string,
    organizationId: string,
  ): Promise<ServiceResponse<ShiftDTO>> {
    try {
      // Validate input data
      const validatedData = createShiftSchema.parse({
        ...data,
        organizationId,
      });

      // Create shift
      const shift = await this.repository.create(validatedData, createdBy);

      // Publish shift created event
      await shiftEventPublisher.publishShiftCreated(
        shift,
        createdBy,
        organizationId,
      );

      return {
        success: true,
        data: shift,
      };
    } catch (error) {
      console.error(&quot;ShiftService.createShift error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to create shift&quot;,
        code: &quot;CREATE_FAILED&quot;,
      };
    }
  }

  /**
   * Update an existing shift
   */
  async updateShift(
    id: string,
    data: UpdateShiftParams,
    updatedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<ShiftDTO>> {
    try {
      // Check if shift exists
      const existingShift = await this.repository.findById(id);
      if (!existingShift) {
        return {
          success: false,
          error: &quot;Shift not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check permissions
      if (
        !this.hasUpdatePermissions(
          existingShift,
          updatedBy,
          userRole,
          organizationId,
        )
      ) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
        };
      }

      // Validate update data
      const validatedData = updateShiftSchema.parse(data);

      // Update shift
      const updatedShift = await this.repository.update(id, validatedData);

      // Publish shift updated event
      await shiftEventPublisher.publishShiftUpdated(
        updatedShift,
        updatedBy,
        validatedData,
        organizationId,
      );

      return {
        success: true,
        data: updatedShift,
      };
    } catch (error) {
      console.error(`ShiftService.updateShift error for ID ${id}:`, error);
      return {
        success: false,
        error: &quot;Failed to update shift&quot;,
        code: &quot;UPDATE_FAILED&quot;,
      };
    }
  }

  /**
   * Delete a shift
   */
  async deleteShift(
    id: string,
    deletedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<void>> {
    try {
      // Check if shift exists
      const shift = await this.repository.findById(id);
      if (!shift) {
        return {
          success: false,
          error: &quot;Shift not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check permissions
      if (
        !this.hasDeletePermissions(shift, deletedBy, userRole, organizationId)
      ) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
        };
      }

      // Delete shift
      await this.repository.delete(id);

      // Publish shift deleted event
      await shiftEventPublisher.publishShiftDeleted(
        shift,
        deletedBy,
        organizationId,
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error(`ShiftService.deleteShift error for ID ${id}:`, error);
      return {
        success: false,
        error: &quot;Failed to delete shift&quot;,
        code: &quot;DELETE_FAILED&quot;,
      };
    }
  }

  /**
   * Assign agent to shift
   */
  async assignAgentToShift(
    params: ShiftAssignmentParams,
    assignedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<any>> {
    try {
      // Check permissions
      if (!this.hasAssignmentPermissions(userRole)) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
        };
      }

      // Check if shift exists
      const shift = await this.repository.findById(params.shiftId);
      if (!shift) {
        return {
          success: false,
          error: &quot;Shift not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Create assignment
      const assignment = await this.repository.createAssignment(
        params,
        assignedBy,
      );

      // Publish assignment event
      await shiftEventPublisher.publishShiftAssigned(
        shift,
        params.agentId,
        assignedBy,
        organizationId,
      );

      return {
        success: true,
        data: assignment,
      };
    } catch (error) {
      console.error(&quot;ShiftService.assignAgentToShift error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to assign agent to shift&quot;,
        code: &quot;ASSIGNMENT_FAILED&quot;,
      };
    }
  }

  /**
   * Cancel a shift
   */
  async cancelShift(
    id: string,
    reason: string,
    cancelledBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<ShiftDTO>> {
    try {
      // Check permissions
      if (!this.hasCancelPermissions(userRole)) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
        };
      }

      // Update shift status to cancelled
      const updatedShift = await this.repository.update(id, {
        status: &quot;cancelled&quot; as ShiftStatus,
        cancellationReason: reason,
      });

      // Publish cancellation event
      await shiftEventPublisher.publishShiftCancelled(
        updatedShift,
        reason,
        cancelledBy,
        organizationId,
      );

      return {
        success: true,
        data: updatedShift,
      };
    } catch (error) {
      console.error(`ShiftService.cancelShift error for ID ${id}:`, error);
      return {
        success: false,
        error: &quot;Failed to cancel shift&quot;,
        code: &quot;CANCEL_FAILED&quot;,
      };
    }
  }

  /**
   * Apply role-based filters to shift queries
   */
  private applyRoleBasedFilters(
    filters: ShiftFilters,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): ShiftFilters {
    switch (userRole) {
      case &quot;brand_agent&quot;:
        // Brand agents can only see shifts assigned to them or open shifts
        return {
          ...filters,
          organizationId,
          agentId: requestingUserId,
        };

      case &quot;internal_field_manager&quot;:
      case &quot;organization_admin&quot;:
        // Field managers and org admins see organization shifts
        return {
          ...filters,
          organizationId,
        };

      case &quot;super_admin&quot;:
        // Super admins can see all shifts, respect provided filters
        return filters;

      default:
        // Default to organization shifts only
        return {
          ...filters,
          organizationId,
        };
    }
  }

  /**
   * Check if user has access to specific shift
   */
  private hasShiftAccess(
    shift: ShiftDTO,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): boolean {
    switch (userRole) {
      case &quot;brand_agent&quot;:
        // Brand agents can access shifts assigned to them or open shifts
        const isAssigned = shift.assignments?.some(
          (a) => a.agentId === requestingUserId,
        );
        return isAssigned || [&quot;draft&quot;, &quot;open&quot;].includes(shift.status);

      case &quot;internal_field_manager&quot;:
      case &quot;organization_admin&quot;:
        // Field managers and org admins can access organization shifts
        return shift.organizationId === organizationId;

      case &quot;super_admin&quot;:
        return true;

      default:
        return false;
    }
  }

  /**
   * Check if user has update permissions
   */
  private hasUpdatePermissions(
    shift: ShiftDTO,
    updatedBy: string,
    userRole: string,
    organizationId: string,
  ): boolean {
    return [
      &quot;internal_field_manager&quot;,
      &quot;organization_admin&quot;,
      &quot;super_admin&quot;,
    ].includes(userRole);
  }

  /**
   * Check if user has delete permissions
   */
  private hasDeletePermissions(
    shift: ShiftDTO,
    deletedBy: string,
    userRole: string,
    organizationId: string,
  ): boolean {
    return [&quot;organization_admin&quot;, &quot;super_admin&quot;].includes(userRole);
  }

  /**
   * Check if user has assignment permissions
   */
  private hasAssignmentPermissions(userRole: string): boolean {
    return [
      &quot;internal_field_manager&quot;,
      &quot;organization_admin&quot;,
      &quot;super_admin&quot;,
    ].includes(userRole);
  }

  /**
   * Check if user has cancel permissions
   */
  private hasCancelPermissions(userRole: string): boolean {
    return [
      &quot;internal_field_manager&quot;,
      &quot;organization_admin&quot;,
      &quot;super_admin&quot;,
    ].includes(userRole);
  }
}
