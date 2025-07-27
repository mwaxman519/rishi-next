/**
 * Organization Management Service - Event-Driven Microservice
 * Comprehensive organization management with role-based access control
 * Aligned with platform architecture patterns
 */

import { OrganizationRepository } from "./repository";
import { organizationEventPublisher } from "./events";
import {
  OrganizationDTO,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  createOrganizationSchema,
  updateOrganizationSchema,
} from "./models";

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface MembershipParams {
  organizationId: string;
  userId: string;
  role: string;
}

export class OrganizationService {
  private repository: OrganizationRepository;

  constructor() {
    this.repository = new OrganizationRepository();
  }

  /**
   * Get all organizations with role-based filtering
   */
  async getAllOrganizations(
    filters: Record<string, any> = {},
    requestingUserId: string,
    userRole: string,
  ): Promise<ServiceResponse<OrganizationDTO[]>> {
    try {
      // Apply role-based filtering
      const accessControlledFilters = this.applyRoleBasedFiltering(
        filters,
        requestingUserId,
        userRole,
      );

      const organizations = await this.repository.findAll(
        accessControlledFilters,
      );

      return {
        success: true,
        data: organizations,
      };
    } catch (error) {
      console.error("OrganizationService.getAllOrganizations error:", error);
      return {
        success: false,
        error: "Failed to get organizations",
        code: "GET_ORGANIZATIONS_FAILED",
      };
    }
  }

  /**
   * Get a single organization by ID with access control
   */
  async getOrganizationById(
    id: string,
    requestingUserId: string,
    userRole: string,
  ): Promise<ServiceResponse<OrganizationDTO>> {
    try {
      const organization = await this.repository.findById(id);

      if (!organization) {
        return {
          success: false,
          error: "Organization not found",
          code: "NOT_FOUND",
        };
      }

      // Check access permissions
      if (
        !this.hasOrganizationAccess(organization, requestingUserId, userRole)
      ) {
        return {
          success: false,
          error: "Access denied",
          code: "ACCESS_DENIED",
        };
      }

      return {
        success: true,
        data: organization,
      };
    } catch (error) {
      console.error(
        `OrganizationService.getOrganizationById error for ID ${id}:`,
        error,
      );
      return {
        success: false,
        error: "Failed to get organization",
        code: "GET_ORGANIZATION_FAILED",
      };
    }
  }

  /**
   * Create a new organization
   */
  async createOrganization(
    data: CreateOrganizationParams,
    createdBy: string,
  ): Promise<ServiceResponse<OrganizationDTO>> {
    try {
      // Validate input data
      const validatedData = createOrganizationSchema.parse(data);

      // Create organization
      const organization = await this.repository.create(validatedData);

      // Publish organization created event
      await organizationEventPublisher.publishOrganizationCreated(
        organization,
        createdBy,
      );

      return {
        success: true,
        data: organization,
      };
    } catch (error) {
      console.error("OrganizationService.createOrganization error:", error);
      return {
        success: false,
        error: "Failed to create organization",
        code: "CREATE_FAILED",
      };
    }
  }

  /**
   * Update an existing organization
   */
  async updateOrganization(
    id: string,
    data: UpdateOrganizationParams,
    updatedBy: string,
    userRole: string,
  ): Promise<ServiceResponse<OrganizationDTO>> {
    try {
      // Check if organization exists
      const existingOrganization = await this.repository.findById(id);
      if (!existingOrganization) {
        return {
          success: false,
          error: "Organization not found",
          code: "NOT_FOUND",
        };
      }

      // Check permissions
      if (
        !this.hasUpdatePermissions(existingOrganization, updatedBy, userRole)
      ) {
        return {
          success: false,
          error: "Access denied",
          code: "ACCESS_DENIED",
        };
      }

      // Validate update data
      const validatedData = updateOrganizationSchema.partial().parse(data);

      // Update organization
      const updatedOrganization = await this.repository.update(
        id,
        validatedData,
      );

      // Publish organization updated event
      await organizationEventPublisher.publishOrganizationUpdated(
        updatedOrganization,
        updatedBy,
        validatedData,
      );

      return {
        success: true,
        data: updatedOrganization,
      };
    } catch (error) {
      console.error(
        `OrganizationService.updateOrganization error for ID ${id}:`,
        error,
      );
      return {
        success: false,
        error: "Failed to update organization",
        code: "UPDATE_FAILED",
      };
    }
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(
    id: string,
    deletedBy: string,
    userRole: string,
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Check if organization exists
      const existingOrganization = await this.repository.findById(id);
      if (!existingOrganization) {
        return {
          success: false,
          error: "Organization not found",
          code: "NOT_FOUND",
        };
      }

      // Check permissions
      if (
        !this.hasDeletePermissions(existingOrganization, deletedBy, userRole)
      ) {
        return {
          success: false,
          error: "Access denied",
          code: "ACCESS_DENIED",
        };
      }

      // Delete organization
      await this.repository.delete(id);

      // Publish organization deleted event
      await organizationEventPublisher.publishOrganizationDeleted(
        id,
        deletedBy,
      );

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error(
        `OrganizationService.deleteOrganization error for ID ${id}:`,
        error,
      );
      return {
        success: false,
        error: "Failed to delete organization",
        code: "DELETE_FAILED",
      };
    }
  }

  /**
   * Activate an organization
   */
  async activateOrganization(
    id: string,
    activatedBy: string,
    userRole: string,
  ): Promise<ServiceResponse<OrganizationDTO>> {
    try {
      // Check permissions
      if (!this.hasActivationPermissions(userRole)) {
        return {
          success: false,
          error: "Insufficient permissions for activation",
          code: "ACTIVATION_PERMISSION_DENIED",
        };
      }

      // Get existing organization
      const existingOrganization = await this.repository.findById(id);
      if (!existingOrganization) {
        return {
          success: false,
          error: "Organization not found",
          code: "NOT_FOUND",
        };
      }

      // Update organization status
      const activatedOrganization = await this.repository.update(id, {
        isActive: true,
      });

      // Publish organization activated event
      await organizationEventPublisher.publishOrganizationActivated(
        activatedOrganization,
        activatedBy,
      );

      return {
        success: true,
        data: activatedOrganization,
      };
    } catch (error) {
      console.error("OrganizationService.activateOrganization error:", error);
      return {
        success: false,
        error: "Failed to activate organization",
        code: "ACTIVATION_FAILED",
      };
    }
  }

  /**
   * Deactivate an organization
   */
  async deactivateOrganization(
    id: string,
    deactivatedBy: string,
    userRole: string,
    reason?: string,
  ): Promise<ServiceResponse<OrganizationDTO>> {
    try {
      // Check permissions
      if (!this.hasActivationPermissions(userRole)) {
        return {
          success: false,
          error: "Insufficient permissions for deactivation",
          code: "DEACTIVATION_PERMISSION_DENIED",
        };
      }

      // Get existing organization
      const existingOrganization = await this.repository.findById(id);
      if (!existingOrganization) {
        return {
          success: false,
          error: "Organization not found",
          code: "NOT_FOUND",
        };
      }

      // Update organization status
      const deactivatedOrganization = await this.repository.update(id, {
        isActive: false,
      });

      // Publish organization deactivated event
      await organizationEventPublisher.publishOrganizationDeactivated(
        deactivatedOrganization,
        deactivatedBy,
        reason,
      );

      return {
        success: true,
        data: deactivatedOrganization,
      };
    } catch (error) {
      console.error("OrganizationService.deactivateOrganization error:", error);
      return {
        success: false,
        error: "Failed to deactivate organization",
        code: "DEACTIVATION_FAILED",
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
  ): Record<string, any> {
    switch (userRole) {
      case "brand_agent":
      case "internal_field_manager":
        // Non-admin users can only see active organizations they're part of
        return {
          ...filters,
          isActive: true,
        };

      case "organization_admin":
        // Org admins can see their organization and related ones
        return {
          ...filters,
        };

      case "super_admin":
        // Super admins can see all organizations
        return filters;

      default:
        // Default to active organizations only
        return {
          ...filters,
          isActive: true,
        };
    }
  }

  /**
   * Check if user has access to specific organization
   */
  private hasOrganizationAccess(
    organization: OrganizationDTO,
    requestingUserId: string,
    userRole: string,
  ): boolean {
    switch (userRole) {
      case "super_admin":
        return true;

      case "organization_admin":
        return true;

      case "brand_agent":
      case "internal_field_manager":
        return organization.isActive === true;

      default:
        return false;
    }
  }

  /**
   * Check if user has update permissions
   */
  private hasUpdatePermissions(
    organization: OrganizationDTO,
    updatedBy: string,
    userRole: string,
  ): boolean {
    return ["organization_admin", "super_admin"].includes(userRole);
  }

  /**
   * Check if user has delete permissions
   */
  private hasDeletePermissions(
    organization: OrganizationDTO,
    deletedBy: string,
    userRole: string,
  ): boolean {
    return userRole === "super_admin";
  }

  /**
   * Check if user has activation permissions
   */
  private hasActivationPermissions(userRole: string): boolean {
    return ["organization_admin", "super_admin"].includes(userRole);
  }
}
