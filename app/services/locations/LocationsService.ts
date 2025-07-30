/**
 * Location Management Service - Event-Driven Microservice
 * Comprehensive location management with role-based access control
 * Aligned with platform architecture patterns
 */

import { LocationRepository } from &quot;./repository&quot;;
import { locationEventPublisher } from &quot;./events&quot;;
import {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
  ApproveLocationParams,
  RejectLocationParams,
  createLocationSchema,
  updateLocationSchema,
  LocationStatus,
} from &quot;./models&quot;;

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export class LocationsService {
  private repository: LocationRepository;

  constructor() {
    this.repository = new LocationRepository();
  }

  /**
   * Get all locations with role-based filtering
   */
  async getAllLocations(
    filters: Record<string, any> = {},
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<LocationDTO[]>> {
    try {
      // Apply role-based access control
      const accessControlledFilters = this.applyRoleBasedFiltering(
        filters,
        requestingUserId,
        userRole,
        organizationId,
      );

      const locations = await this.repository.findAll(accessControlledFilters);

      return {
        success: true,
        data: locations,
      };
    } catch (error) {
      console.error(&quot;LocationsService.getAllLocations error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to get locations&quot;,
        code: &quot;GET_LOCATIONS_FAILED&quot;,
      };
    }
  }

  /**
   * Get a single location by ID with access control
   */
  async getLocationById(
    id: string,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<LocationDTO>> {
    try {
      const location = await this.repository.findById(id);

      if (!location) {
        return {
          success: false,
          error: &quot;Location not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check access permissions
      if (
        !this.hasLocationAccess(
          location,
          requestingUserId,
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

      return {
        success: true,
        data: location,
      };
    } catch (error) {
      console.error(
        `LocationsService.getLocationById error for ID ${id}:`,
        error,
      );
      return {
        success: false,
        error: &quot;Failed to get location&quot;,
        code: &quot;GET_LOCATION_FAILED&quot;,
      };
    }
  }

  /**
   * Create a new location
   */
  async createLocation(
    data: CreateLocationParams,
    createdBy: string,
    organizationId: string,
  ): Promise<ServiceResponse<LocationDTO>> {
    try {
      // Validate input data
      const validatedData = createLocationSchema.parse(data);

      // Create location
      const location = await this.repository.create(
        validatedData,
        organizationId,
        createdBy,
      );

      // Publish location created event
      await locationEventPublisher.publishLocationCreated(
        location,
        createdBy,
        organizationId,
      );

      return {
        success: true,
        data: location,
      };
    } catch (error) {
      console.error(&quot;LocationsService.createLocation error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to create location&quot;,
        code: &quot;CREATE_FAILED&quot;,
      };
    }
  }

  /**
   * Update an existing location
   */
  async updateLocation(
    id: string,
    data: UpdateLocationParams,
    updatedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<LocationDTO>> {
    try {
      // Check if location exists
      const existingLocation = await this.repository.findById(id);
      if (!existingLocation) {
        return {
          success: false,
          error: &quot;Location not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check permissions
      if (
        !this.hasLocationAccess(
          existingLocation,
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
      const validatedData = updateLocationSchema.partial().parse(data);

      // Update location
      const updatedLocation = await this.repository.update(id, validatedData);

      // Publish location updated event
      await locationEventPublisher.publishLocationUpdated(
        updatedLocation,
        updatedBy,
        validatedData,
        organizationId,
      );

      return {
        success: true,
        data: updatedLocation,
      };
    } catch (error) {
      console.error(
        `LocationsService.updateLocation error for ID ${id}:`,
        error,
      );
      return {
        success: false,
        error: &quot;Failed to update location&quot;,
        code: &quot;UPDATE_FAILED&quot;,
      };
    }
  }

  /**
   * Delete a location
   */
  async deleteLocation(
    id: string,
    deletedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Check if location exists
      const existingLocation = await this.repository.findById(id);
      if (!existingLocation) {
        return {
          success: false,
          error: &quot;Location not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check permissions
      if (
        !this.hasLocationAccess(
          existingLocation,
          deletedBy,
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

      // Delete location
      await this.repository.delete(id);

      // Publish location deleted event
      await locationEventPublisher.publishLocationDeleted(
        id,
        deletedBy,
        organizationId,
      );

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error(
        `LocationsService.deleteLocation error for ID ${id}:`,
        error,
      );
      return {
        success: false,
        error: &quot;Failed to delete location&quot;,
        code: &quot;DELETE_FAILED&quot;,
      };
    }
  }

  /**
   * Approve a location
   */
  async approveLocation(
    approval: ApproveLocationParams,
    approvedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<LocationDTO>> {
    try {
      // Check approval permissions
      if (!this.hasApprovalPermissions(userRole)) {
        return {
          success: false,
          error: &quot;Insufficient permissions for approval&quot;,
          code: &quot;APPROVAL_PERMISSION_DENIED&quot;,
        };
      }

      // Get existing location
      const existingLocation = await this.repository.findById(
        approval.locationId,
      );
      if (!existingLocation) {
        return {
          success: false,
          error: &quot;Location not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Check if location can be approved
      if (existingLocation.status !== LocationStatus.PENDING_APPROVAL) {
        return {
          success: false,
          error: &quot;Location is not in a state that can be approved&quot;,
          code: &quot;INVALID_STATE_FOR_APPROVAL&quot;,
        };
      }

      // Update location status
      const updatedLocation = await this.repository.update(
        approval.locationId,
        {
          status: LocationStatus.APPROVED,
          approvedBy,
          approvedAt: new Date(),
          approvalNotes: approval.notes,
        },
      );

      // Publish location approved event
      await locationEventPublisher.publishLocationApproved(
        updatedLocation,
        approvedBy,
        organizationId,
      );

      return {
        success: true,
        data: updatedLocation,
      };
    } catch (error) {
      console.error(&quot;LocationsService.approveLocation error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to approve location&quot;,
        code: &quot;APPROVAL_FAILED&quot;,
      };
    }
  }

  /**
   * Reject a location
   */
  async rejectLocation(
    rejection: RejectLocationParams,
    rejectedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<LocationDTO>> {
    try {
      // Check approval permissions
      if (!this.hasApprovalPermissions(userRole)) {
        return {
          success: false,
          error: &quot;Insufficient permissions for rejection&quot;,
          code: &quot;REJECTION_PERMISSION_DENIED&quot;,
        };
      }

      // Get existing location
      const existingLocation = await this.repository.findById(
        rejection.locationId,
      );
      if (!existingLocation) {
        return {
          success: false,
          error: &quot;Location not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      // Update location status
      const updatedLocation = await this.repository.update(
        rejection.locationId,
        {
          status: LocationStatus.REJECTED,
          rejectedBy,
          rejectedAt: new Date(),
          rejectionReason: rejection.reason,
          rejectionNotes: rejection.notes,
        },
      );

      // Publish location rejected event
      await locationEventPublisher.publishLocationRejected(
        updatedLocation,
        rejectedBy,
        rejection.reason,
        organizationId,
      );

      return {
        success: true,
        data: updatedLocation,
      };
    } catch (error) {
      console.error(&quot;LocationsService.rejectLocation error:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to reject location&quot;,
        code: &quot;REJECTION_FAILED&quot;,
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
        // Brand agents can only see approved locations in their organization
        return {
          ...filters,
          organizationId,
          status: LocationStatus.APPROVED,
        };

      case &quot;internal_field_manager&quot;:
      case &quot;organization_admin&quot;:
        // Field managers and org admins can see organization locations
        return {
          ...filters,
          organizationId,
        };

      case &quot;super_admin&quot;:
        // Super admins can see all locations
        return filters;

      default:
        // Default to approved locations only
        return {
          ...filters,
          organizationId,
          status: LocationStatus.APPROVED,
        };
    }
  }

  /**
   * Check if user has access to specific location
   */
  private hasLocationAccess(
    location: LocationDTO,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): boolean {
    switch (userRole) {
      case &quot;brand_agent&quot;:
        // Brand agents can only access approved locations in their organization
        return location.status === LocationStatus.APPROVED;

      case &quot;internal_field_manager&quot;:
      case &quot;organization_admin&quot;:
        // Field managers and org admins can access organization locations
        return true;

      case &quot;super_admin&quot;:
        return true;

      default:
        return location.status === LocationStatus.APPROVED;
    }
  }

  /**
   * Check if user has approval permissions
   */
  private hasApprovalPermissions(userRole: string): boolean {
    return [
      &quot;internal_field_manager&quot;,
      &quot;organization_admin&quot;,
      &quot;super_admin&quot;,
    ].includes(userRole);
  }
}
