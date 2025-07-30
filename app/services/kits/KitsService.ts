/**
 * Kit Management Service - Event-Driven Microservice
 * Comprehensive kit and equipment management with role-based access control
 * Aligned with platform architecture patterns
 */

import { KitRepository } from &quot;./repository&quot;;
import { kitEventPublisher } from &quot;./events&quot;;
import {
  KitDTO,
  CreateKitParams,
  UpdateKitParams,
  KitAssignmentParams,
  KitCheckoutParams,
  KitCheckinParams,
  KitComponentParams,
  createKitSchema,
  updateKitSchema,
  KitStatus,
} from &quot;./models&quot;;

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export class KitsService {
  private repository: KitRepository;

  constructor() {
    this.repository = new KitRepository();
  }

  /**
   * Get all kits with role-based filtering
   */
  async getAllKits(
    filters: Record<string, any> = {},
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<KitDTO[]>> {
    try {
      // Apply role-based filtering
      const accessControlledFilters = this.applyRoleBasedFiltering(
        filters,
        requestingUserId,
        userRole,
        organizationId,
      );

      const kits = await this.repository.findAll(accessControlledFilters);

      return {
        success: true,
        data: kits,
      };
    } catch (error) {
      console.error(&quot;KitsService.getAllKits error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to get kits&quot;,
        code: &quot;GET_KITS_FAILED&quot;,
      };
    }
  }

  /**
   * Get a single kit by ID with access control
   */
  async getKitById(
    id: string,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<KitDTO>> {
    try {
      const kit = await this.repository.findById(id);

      if (!kit) {
        return {
          success: false,
          error: &quot;Kit not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check access permissions
      if (!this.hasKitAccess(kit, requestingUserId, userRole, organizationId)) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
        };
      }

      return {
        success: true,
        data: kit,
      };
    } catch (error) {
      console.error(`KitsService.getKitById error for ID ${id}:`, error);
      return {
        success: false,
        error: &quot;Failed to get kit&quot;,
        code: &quot;GET_KIT_FAILED&quot;,
      };
    }
  }

  /**
   * Create a new kit
   */
  async createKit(
    data: CreateKitParams,
    createdBy: string,
    organizationId: string,
  ): Promise<ServiceResponse<KitDTO>> {
    try {
      // Validate input data
      const validatedData = createKitSchema.parse(data);

      // Create kit
      const kit = await this.repository.create(
        validatedData,
        organizationId,
        createdBy,
      );

      // Publish kit created event
      await kitEventPublisher.publishKitCreated(kit, createdBy, organizationId);

      return {
        success: true,
        data: kit,
      };
    } catch (error) {
      console.error(&quot;KitsService.createKit error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to create kit&quot;,
        code: &quot;CREATE_FAILED&quot;,
      };
    }
  }

  /**
   * Update an existing kit
   */
  async updateKit(
    id: string,
    data: UpdateKitParams,
    updatedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<KitDTO>> {
    try {
      // Check if kit exists
      const existingKit = await this.repository.findById(id);
      if (!existingKit) {
        return {
          success: false,
          error: &quot;Kit not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check permissions
      if (
        !this.hasUpdatePermissions(
          existingKit,
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
      const validatedData = updateKitSchema.partial().parse(data);

      // Update kit
      const updatedKit = await this.repository.update(id, validatedData);

      // Publish kit updated event
      await kitEventPublisher.publishKitUpdated(
        updatedKit,
        updatedBy,
        validatedData,
        organizationId,
      );

      return {
        success: true,
        data: updatedKit,
      };
    } catch (error) {
      console.error(`KitsService.updateKit error for ID ${id}:`, error);
      return {
        success: false,
        error: &quot;Failed to update kit&quot;,
        code: &quot;UPDATE_FAILED&quot;,
      };
    }
  }

  /**
   * Assign a kit to a user or event
   */
  async assignKit(
    assignment: KitAssignmentParams,
    assignedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<KitDTO>> {
    try {
      // Check permissions
      if (!this.hasAssignmentPermissions(userRole)) {
        return {
          success: false,
          error: &quot;Insufficient permissions for kit assignment&quot;,
          code: &quot;ASSIGNMENT_PERMISSION_DENIED&quot;,
        };
      }

      // Get existing kit
      const existingKit = await this.repository.findById(assignment.kitId);
      if (!existingKit) {
        return {
          success: false,
          error: &quot;Kit not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check if kit is available for assignment
      if (existingKit.status !== KitStatus.AVAILABLE) {
        return {
          success: false,
          error: &quot;Kit is not available for assignment&quot;,
          code: &quot;KIT_NOT_AVAILABLE&quot;,
        };
      }

      // Update kit assignment
      const assignedKit = await this.repository.update(assignment.kitId, {
        status: KitStatus.ASSIGNED,
        assignedTo: assignment.assignedTo,
        assignedBy,
        assignedAt: new Date(),
        eventId: assignment.eventId,
        shiftId: assignment.shiftId,
      });

      // Publish kit assigned event
      await kitEventPublisher.publishKitAssigned(
        assignedKit,
        assignment.assignedTo,
        assignedBy,
        organizationId,
        assignment.eventId,
        assignment.shiftId,
      );

      return {
        success: true,
        data: assignedKit,
      };
    } catch (error) {
      console.error(&quot;KitsService.assignKit error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to assign kit&quot;,
        code: &quot;ASSIGNMENT_FAILED&quot;,
      };
    }
  }

  /**
   * Unassign a kit
   */
  async unassignKit(
    kitId: string,
    unassignedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<KitDTO>> {
    try {
      // Check permissions
      if (!this.hasAssignmentPermissions(userRole)) {
        return {
          success: false,
          error: &quot;Insufficient permissions for kit unassignment&quot;,
          code: &quot;UNASSIGNMENT_PERMISSION_DENIED&quot;,
        };
      }

      // Get existing kit
      const existingKit = await this.repository.findById(kitId);
      if (!existingKit) {
        return {
          success: false,
          error: &quot;Kit not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      const previousAssignee = existingKit.assignedTo;

      // Update kit assignment
      const unassignedKit = await this.repository.update(kitId, {
        status: KitStatus.AVAILABLE,
        assignedTo: null,
        assignedBy: null,
        assignedAt: null,
        eventId: null,
        shiftId: null,
      });

      // Publish kit unassigned event
      if (previousAssignee) {
        await kitEventPublisher.publishKitUnassigned(
          unassignedKit,
          previousAssignee,
          unassignedBy,
          organizationId,
        );
      }

      return {
        success: true,
        data: unassignedKit,
      };
    } catch (error) {
      console.error(&quot;KitsService.unassignKit error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to unassign kit&quot;,
        code: &quot;UNASSIGNMENT_FAILED&quot;,
      };
    }
  }

  /**
   * Check out a kit
   */
  async checkoutKit(
    checkout: KitCheckoutParams,
    checkedOutBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<KitDTO>> {
    try {
      // Get existing kit
      const existingKit = await this.repository.findById(checkout.kitId);
      if (!existingKit) {
        return {
          success: false,
          error: &quot;Kit not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check if kit can be checked out
      if (
        ![KitStatus.AVAILABLE, KitStatus.ASSIGNED].includes(existingKit.status)
      ) {
        return {
          success: false,
          error: &quot;Kit cannot be checked out in current status&quot;,
          code: &quot;INVALID_CHECKOUT_STATUS&quot;,
        };
      }

      // Update kit status
      const checkedOutKit = await this.repository.update(checkout.kitId, {
        status: KitStatus.CHECKED_OUT,
        checkedOutTo: checkout.checkedOutTo,
        checkedOutBy,
        checkedOutAt: new Date(),
        eventId: checkout.eventId,
        shiftId: checkout.shiftId,
      });

      // Publish kit checked out event
      await kitEventPublisher.publishKitCheckedOut(
        checkedOutKit,
        checkedOutBy,
        checkout.checkedOutTo,
        organizationId,
        checkout.eventId,
        checkout.shiftId,
      );

      return {
        success: true,
        data: checkedOutKit,
      };
    } catch (error) {
      console.error(&quot;KitsService.checkoutKit error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to check out kit&quot;,
        code: &quot;CHECKOUT_FAILED&quot;,
      };
    }
  }

  /**
   * Check in a kit
   */
  async checkinKit(
    checkin: KitCheckinParams,
    checkedInBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<KitDTO>> {
    try {
      // Get existing kit
      const existingKit = await this.repository.findById(checkin.kitId);
      if (!existingKit) {
        return {
          success: false,
          error: &quot;Kit not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check if kit can be checked in
      if (existingKit.status !== KitStatus.CHECKED_OUT) {
        return {
          success: false,
          error: &quot;Kit is not checked out&quot;,
          code: &quot;INVALID_CHECKIN_STATUS&quot;,
        };
      }

      const previousUser = existingKit.checkedOutTo;

      // Determine new status based on condition
      const newStatus =
        checkin.condition === &quot;damaged&quot;
          ? KitStatus.DAMAGED
          : KitStatus.AVAILABLE;

      // Update kit status
      const checkedInKit = await this.repository.update(checkin.kitId, {
        status: newStatus,
        checkedOutTo: null,
        checkedOutBy: null,
        checkedOutAt: null,
        checkedInBy,
        checkedInAt: new Date(),
        lastCondition: checkin.condition,
        conditionNotes: checkin.notes,
      });

      // Publish kit checked in event
      if (previousUser) {
        await kitEventPublisher.publishKitCheckedIn(
          checkedInKit,
          checkedInBy,
          previousUser,
          checkin.condition,
          organizationId,
          checkin.notes,
        );
      }

      // If damaged, publish damage event
      if (checkin.condition === &quot;damaged&quot;) {
        await kitEventPublisher.publishKitDamaged(
          checkedInKit,
          checkedInBy,
          checkin.notes || &quot;Damage reported during check-in&quot;,
          &quot;minor&quot;, // Default damage level
          organizationId,
        );
      }

      return {
        success: true,
        data: checkedInKit,
      };
    } catch (error) {
      console.error(&quot;KitsService.checkinKit error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to check in kit&quot;,
        code: &quot;CHECKIN_FAILED&quot;,
      };
    }
  }

  /**
   * Add component to kit
   */
  async addComponent(
    component: KitComponentParams,
    addedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Check permissions
      if (!this.hasComponentPermissions(userRole)) {
        return {
          success: false,
          error: &quot;Insufficient permissions for component management&quot;,
          code: &quot;COMPONENT_PERMISSION_DENIED&quot;,
        };
      }

      // Add component (repository method would handle this)
      await this.repository.addComponent(component.kitId, component);

      // Publish component added event
      await kitEventPublisher.publishComponentAdded(
        component.kitId,
        component,
        addedBy,
        organizationId,
      );

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error(&quot;KitsService.addComponent error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to add component&quot;,
        code: &quot;ADD_COMPONENT_FAILED&quot;,
      };
    }
  }

  /**
   * Remove component from kit
   */
  async removeComponent(
    kitId: string,
    componentId: string,
    removedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Check permissions
      if (!this.hasComponentPermissions(userRole)) {
        return {
          success: false,
          error: &quot;Insufficient permissions for component management&quot;,
          code: &quot;COMPONENT_PERMISSION_DENIED&quot;,
        };
      }

      // Remove component (repository method would handle this)
      await this.repository.removeComponent(kitId, componentId);

      // Publish component removed event
      await kitEventPublisher.publishComponentRemoved(
        kitId,
        componentId,
        removedBy,
        organizationId,
      );

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error(&quot;KitsService.removeComponent error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to remove component&quot;,
        code: &quot;REMOVE_COMPONENT_FAILED&quot;,
      };
    }
  }

  /**
   * Apply role-based access control to filters
   */
  private applyRoleBasedFiltering(
    filters: Record<string, any>,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): Record<string, any> {
    switch (userRole) {
      case &quot;brand_agent&quot;:
        // Brand agents can only see kits assigned to them or available kits
        return {
          ...filters,
          organizationId,
          $or: [
            { assignedTo: requestingUserId },
            { status: KitStatus.AVAILABLE },
          ],
        };

      case &quot;internal_field_manager&quot;:
      case &quot;organization_admin&quot;:
        // Field managers and org admins can see organization kits
        return {
          ...filters,
          organizationId,
        };

      case &quot;super_admin&quot;:
        // Super admins can see all kits
        return filters;

      default:
        // Default to available kits only
        return {
          ...filters,
          organizationId,
          status: KitStatus.AVAILABLE,
        };
    }
  }

  /**
   * Check if user has access to specific kit
   */
  private hasKitAccess(
    kit: KitDTO,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): boolean {
    switch (userRole) {
      case &quot;brand_agent&quot;:
        // Brand agents can access kits assigned to them or available kits
        return (
          kit.assignedTo === requestingUserId ||
          kit.status === KitStatus.AVAILABLE
        );

      case &quot;internal_field_manager&quot;:
      case &quot;organization_admin&quot;:
        // Field managers and org admins can access organization kits
        return true;

      case &quot;super_admin&quot;:
        return true;

      default:
        return kit.status === KitStatus.AVAILABLE;
    }
  }

  /**
   * Check if user has update permissions
   */
  private hasUpdatePermissions(
    kit: KitDTO,
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
   * Check if user has component management permissions
   */
  private hasComponentPermissions(userRole: string): boolean {
    return [
      &quot;internal_field_manager&quot;,
      &quot;organization_admin&quot;,
      &quot;super_admin&quot;,
    ].includes(userRole);
  }
}
