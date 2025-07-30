/**
 * Organization Management Service - Event-Driven Microservice
 * Comprehensive organization management with role-based access control
 * Aligned with platform architecture patterns
 */

import { OrganizationRepository } from &quot;./repository&quot;;
import { organizationEventPublisher } from &quot;./events&quot;;
import {
  OrganizationDTO,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  createOrganizationSchema,
  updateOrganizationSchema,
} from &quot;./models&quot;;

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
      console.error(&quot;OrganizationService.getAllOrganizations error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to get organizations&quot;,
        code: &quot;GET_ORGANIZATIONS_FAILED&quot;,
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
          error: &quot;Organization not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check access permissions
      if (
        !this.hasOrganizationAccess(organization, requestingUserId, userRole)
      ) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
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
        error: &quot;Failed to get organization&quot;,
        code: &quot;GET_ORGANIZATION_FAILED&quot;,
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
      console.error(&quot;OrganizationService.createOrganization error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to create organization&quot;,
        code: &quot;CREATE_FAILED&quot;,
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
          error: &quot;Organization not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check permissions
      if (
        !this.hasUpdatePermissions(existingOrganization, updatedBy, userRole)
      ) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
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
        error: &quot;Failed to update organization&quot;,
        code: &quot;UPDATE_FAILED&quot;,
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
          error: &quot;Organization not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check permissions
      if (
        !this.hasDeletePermissions(existingOrganization, deletedBy, userRole)
      ) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
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
        error: &quot;Failed to delete organization&quot;,
        code: &quot;DELETE_FAILED&quot;,
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
          error: &quot;Insufficient permissions for activation&quot;,
          code: &quot;ACTIVATION_PERMISSION_DENIED&quot;,
        };
      }

      // Get existing organization
      const existingOrganization = await this.repository.findById(id);
      if (!existingOrganization) {
        return {
          success: false,
          error: &quot;Organization not found&quot;,
          code: &quot;NOT_FOUND&quot;,
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
      console.error(&quot;OrganizationService.activateOrganization error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to activate organization&quot;,
        code: &quot;ACTIVATION_FAILED&quot;,
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
          error: &quot;Insufficient permissions for deactivation&quot;,
          code: &quot;DEACTIVATION_PERMISSION_DENIED&quot;,
        };
      }

      // Get existing organization
      const existingOrganization = await this.repository.findById(id);
      if (!existingOrganization) {
        return {
          success: false,
          error: &quot;Organization not found&quot;,
          code: &quot;NOT_FOUND&quot;,
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
      console.error(&quot;OrganizationService.deactivateOrganization error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to deactivate organization&quot;,
        code: &quot;DEACTIVATION_FAILED&quot;,
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
      case &quot;brand_agent&quot;:
      case &quot;internal_field_manager&quot;:
        // Non-admin users can only see active organizations they&apos;re part of
        return {
          ...filters,
          isActive: true,
        };

      case &quot;organization_admin&quot;:
        // Org admins can see their organization and related ones
        return {
          ...filters,
        };

      case &quot;super_admin&quot;:
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
      case &quot;super_admin&quot;:
        return true;

      case &quot;organization_admin&quot;:
        return true;

      case &quot;brand_agent&quot;:
      case &quot;internal_field_manager&quot;:
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
    return [&quot;organization_admin&quot;, &quot;super_admin&quot;].includes(userRole);
  }

  /**
   * Check if user has delete permissions
   */
  private hasDeletePermissions(
    organization: OrganizationDTO,
    deletedBy: string,
    userRole: string,
  ): boolean {
    return userRole === &quot;super_admin&quot;;
  }

  /**
   * Check if user has activation permissions
   */
  private hasActivationPermissions(userRole: string): boolean {
    return [&quot;organization_admin&quot;, &quot;super_admin&quot;].includes(userRole);
  }
}
