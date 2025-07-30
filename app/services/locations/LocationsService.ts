/**
 * Location Management Service - Event-Driven Microservice
 * Comprehensive location management with role-based access control
 * Aligned with platform architecture patterns
 */

import { LocationRepository } from "./repository";
import { locationEventPublisher } from "./events";
import {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
  ApproveLocationParams,
  RejectLocationParams,
  createLocationSchema,
  updateLocationSchema,
  LocationStatus,
} from "./models";

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
      console.error("LocationsService.getAllLocations error:", error);
      return {
        success: false,
        error: "Failed to get locations",
        code: "GET_LOCATIONS_FAILED",
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
          error: "Location not found",
          code: "NOT_FOUND",
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
          error: "Access denied",
          code: "ACCESS_DENIED",
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
        error: "Failed to get location",
        code: "GET_LOCATION_FAILED",
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
      console.error("LocationsService.createLocation error:", error);
      return {
        success: false,
        error: "Failed to create location",
        code: "CREATE_FAILED",
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
          error: "Location not found",
          code: "NOT_FOUND",
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
          error: "Access denied",
          code: "ACCESS_DENIED",
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
        error: "Failed to update location",
        code: "UPDATE_FAILED",
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
          error: "Location not found",
          code: "NOT_FOUND",
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
          error: "Access denied",
          code: "ACCESS_DENIED",
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
        error: "Failed to delete location",
        code: "DELETE_FAILED",
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
          error: "Insufficient permissions for approval",
          code: "APPROVAL_PERMISSION_DENIED",
        };
      }

      // Get existing location
      const existingLocation = await this.repository.findById(
        approval.locationId,
      );
      if (!existingLocation) {
        return {
          success: false,
          error: "Location not found",
          code: "NOT_FOUND",
        };
      }

      // Check if location can be approved
      if (existingLocation.status !== LocationStatus.PENDING_APPROVAL) {
        return {
          success: false,
          error: "Location is not in a state that can be approved",
          code: "INVALID_STATE_FOR_APPROVAL",
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
      console.error("LocationsService.approveLocation error:", error);
      return {
        success: false,
        error: "Failed to approve location",
        code: "APPROVAL_FAILED",
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
          error: "Insufficient permissions for rejection",
          code: "REJECTION_PERMISSION_DENIED",
        };
      }

      // Get existing location
      const existingLocation = await this.repository.findById(
        rejection.locationId,
      );
      if (!existingLocation) {
        return {
          success: false,
          error: "Location not found",
          code: "NOT_FOUND",
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
      console.error("LocationsService.rejectLocation error:", error);
      return {
        success: false,
        error: "Failed to reject location",
        code: "REJECTION_FAILED",
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
        // Brand agents can only see approved locations in their organization
        return {
          ...filters,
          organizationId,
          status: LocationStatus.APPROVED,
        };

      case "internal_field_manager":
      case "organization_admin":
        // Field managers and org admins can see organization locations
        return {
          ...filters,
          organizationId,
        };

      case "super_admin":
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
      case "brand_agent":
        // Brand agents can only access approved locations in their organization
        return location.status === LocationStatus.APPROVED;

      case "internal_field_manager":
      case "organization_admin":
        // Field managers and org admins can access organization locations
        return true;

      case "super_admin":
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
      "internal_field_manager",
      "organization_admin",
      "super_admin",
    ].includes(userRole);
  }
}
