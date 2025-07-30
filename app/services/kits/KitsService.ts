/**
 * Kit Management Service - Event-Driven Microservice
 * Comprehensive kit and equipment management with role-based access control
 * Aligned with platform architecture patterns
 */

import { KitRepository } from "./repository";
import { kitEventPublisher } from "./events";
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
} from "./models";

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
      console.error("KitsService.getAllKits error:", error);
      return {
        success: false,
        error: "Failed to get kits",
        code: "GET_KITS_FAILED",
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
          error: "Kit not found",
          code: "NOT_FOUND",
        };
      }

      // Check access permissions
      if (!this.hasKitAccess(kit, requestingUserId, userRole, organizationId)) {
        return {
          success: false,
          error: "Access denied",
          code: "ACCESS_DENIED",
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
        error: "Failed to get kit",
        code: "GET_KIT_FAILED",
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
      console.error("KitsService.createKit error:", error);
      return {
        success: false,
        error: "Failed to create kit",
        code: "CREATE_FAILED",
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
          error: "Kit not found",
          code: "NOT_FOUND",
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
          error: "Access denied",
          code: "ACCESS_DENIED",
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
        error: "Failed to update kit",
        code: "UPDATE_FAILED",
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
          error: "Insufficient permissions for kit assignment",
          code: "ASSIGNMENT_PERMISSION_DENIED",
        };
      }

      // Get existing kit
      const existingKit = await this.repository.findById(assignment.kitId);
      if (!existingKit) {
        return {
          success: false,
          error: "Kit not found",
          code: "NOT_FOUND",
        };
      }

      // Check if kit is available for assignment
      if (existingKit.status !== KitStatus.AVAILABLE) {
        return {
          success: false,
          error: "Kit is not available for assignment",
          code: "KIT_NOT_AVAILABLE",
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
      console.error("KitsService.assignKit error:", error);
      return {
        success: false,
        error: "Failed to assign kit",
        code: "ASSIGNMENT_FAILED",
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
          error: "Insufficient permissions for kit unassignment",
          code: "UNASSIGNMENT_PERMISSION_DENIED",
        };
      }

      // Get existing kit
      const existingKit = await this.repository.findById(kitId);
      if (!existingKit) {
        return {
          success: false,
          error: "Kit not found",
          code: "NOT_FOUND",
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
      console.error("KitsService.unassignKit error:", error);
      return {
        success: false,
        error: "Failed to unassign kit",
        code: "UNASSIGNMENT_FAILED",
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
          error: "Kit not found",
          code: "NOT_FOUND",
        };
      }

      // Check if kit can be checked out
      if (
        ![KitStatus.AVAILABLE, KitStatus.ASSIGNED].includes(existingKit.status)
      ) {
        return {
          success: false,
          error: "Kit cannot be checked out in current status",
          code: "INVALID_CHECKOUT_STATUS",
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
      console.error("KitsService.checkoutKit error:", error);
      return {
        success: false,
        error: "Failed to check out kit",
        code: "CHECKOUT_FAILED",
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
          error: "Kit not found",
          code: "NOT_FOUND",
        };
      }

      // Check if kit can be checked in
      if (existingKit.status !== KitStatus.CHECKED_OUT) {
        return {
          success: false,
          error: "Kit is not checked out",
          code: "INVALID_CHECKIN_STATUS",
        };
      }

      const previousUser = existingKit.checkedOutTo;

      // Determine new status based on condition
      const newStatus =
        checkin.condition === "damaged"
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
      if (checkin.condition === "damaged") {
        await kitEventPublisher.publishKitDamaged(
          checkedInKit,
          checkedInBy,
          checkin.notes || "Damage reported during check-in",
          "minor", // Default damage level
          organizationId,
        );
      }

      return {
        success: true,
        data: checkedInKit,
      };
    } catch (error) {
      console.error("KitsService.checkinKit error:", error);
      return {
        success: false,
        error: "Failed to check in kit",
        code: "CHECKIN_FAILED",
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
          error: "Insufficient permissions for component management",
          code: "COMPONENT_PERMISSION_DENIED",
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
      console.error("KitsService.addComponent error:", error);
      return {
        success: false,
        error: "Failed to add component",
        code: "ADD_COMPONENT_FAILED",
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
          error: "Insufficient permissions for component management",
          code: "COMPONENT_PERMISSION_DENIED",
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
      console.error("KitsService.removeComponent error:", error);
      return {
        success: false,
        error: "Failed to remove component",
        code: "REMOVE_COMPONENT_FAILED",
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
      case "brand_agent":
        // Brand agents can only see kits assigned to them or available kits
        return {
          ...filters,
          organizationId,
          $or: [
            { assignedTo: requestingUserId },
            { status: KitStatus.AVAILABLE },
          ],
        };

      case "internal_field_manager":
      case "organization_admin":
        // Field managers and org admins can see organization kits
        return {
          ...filters,
          organizationId,
        };

      case "super_admin":
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
      case "brand_agent":
        // Brand agents can access kits assigned to them or available kits
        return (
          kit.assignedTo === requestingUserId ||
          kit.status === KitStatus.AVAILABLE
        );

      case "internal_field_manager":
      case "organization_admin":
        // Field managers and org admins can access organization kits
        return true;

      case "super_admin":
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
      "internal_field_manager",
      "organization_admin",
      "super_admin",
    ].includes(userRole);
  }

  /**
   * Check if user has assignment permissions
   */
  private hasAssignmentPermissions(userRole: string): boolean {
    return [
      "internal_field_manager",
      "organization_admin",
      "super_admin",
    ].includes(userRole);
  }

  /**
   * Check if user has component management permissions
   */
  private hasComponentPermissions(userRole: string): boolean {
    return [
      "internal_field_manager",
      "organization_admin",
      "super_admin",
    ].includes(userRole);
  }
}
