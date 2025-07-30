/**
 * Locations Service - Business logic for location management
 */
import { LocationRepository } from "./repository";
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

export class LocationsService {
  private repository: LocationRepository;

  constructor() {
    this.repository = new LocationRepository();
  }

  /**
   * Get all locations with optional filtering
   */
  async getAllLocations(
    filters: Record<string, any> = {},
  ): Promise<LocationDTO[]> {
    try {
      return this.repository.findAll(filters);
    } catch (error) {
      console.error("LocationsService.getAllLocations error:", error);
      throw error;
    }
  }

  /**
   * Get a single location by ID
   */
  async getLocationById(id: string): Promise<LocationDTO | null> {
    try {
      return this.repository.findById(id);
    } catch (error) {
      console.error(
        `LocationsService.getLocationById error for ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Create a new location
   */
  async createLocation(
    data: CreateLocationParams,
    organizationId: string,
    requesterId?: string,
  ): Promise<LocationDTO> {
    try {
      // Validate input data
      const validatedData = createLocationSchema.parse(data);

      // Create location
      return this.repository.create(validatedData, organizationId, requesterId);
    } catch (error) {
      console.error("LocationsService.createLocation error:", error);
      throw error;
    }
  }

  /**
   * Update an existing location
   */
  async updateLocation(
    id: string,
    data: UpdateLocationParams,
  ): Promise<LocationDTO> {
    try {
      // Check if location exists
      const existingLocation = await this.repository.findById(id);
      if (!existingLocation) {
        throw new Error(`Location with ID ${id} not found`);
      }

      // Validate update data
      const validatedData = updateLocationSchema.partial().parse(data);

      // Update location
      return this.repository.update(id, validatedData);
    } catch (error) {
      console.error(
        `LocationsService.updateLocation error for ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Delete a location
   */
  async deleteLocation(id: string): Promise<void> {
    try {
      // Check if location exists
      const existingLocation = await this.repository.findById(id);
      if (!existingLocation) {
        throw new Error(`Location with ID ${id} not found`);
      }

      // Delete location
      await this.repository.delete(id);
    } catch (error) {
      console.error(
        `LocationsService.deleteLocation error for ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Approve a location
   */
  async approveLocation({ id }: ApproveLocationParams): Promise<LocationDTO> {
    try {
      // Check if location exists
      const existingLocation = await this.repository.findById(id);
      if (!existingLocation) {
        throw new Error(`Location with ID ${id} not found`);
      }

      // Only allow approving pending locations
      if (existingLocation.status !== LocationStatus.PENDING) {
        throw new Error(
          `Cannot approve location with status ${existingLocation.status}`,
        );
      }

      // Update location with approved status
      // Now that we've extended the schema, we can include status directly
      return this.repository.update(id, {
        status: LocationStatus.APPROVED,
        rejectionReason: undefined,
      });
    } catch (error) {
      console.error(
        `LocationsService.approveLocation error for ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Reject a location
   */
  async rejectLocation({
    id,
    reason,
  }: RejectLocationParams): Promise<LocationDTO> {
    try {
      // Check if location exists
      const existingLocation = await this.repository.findById(id);
      if (!existingLocation) {
        throw new Error(`Location with ID ${id} not found`);
      }

      // Only allow rejecting pending locations
      if (existingLocation.status !== LocationStatus.PENDING) {
        throw new Error(
          `Cannot reject location with status ${existingLocation.status}`,
        );
      }

      // Validate reason if provided
      let rejectionReason = reason;
      if (
        reason === undefined ||
        reason === null ||
        (typeof reason === "string" && reason.trim() === "")
      ) {
        rejectionReason = "No reason provided";
      }

      // Update location with rejected status
      // Now that we've extended the schema, we can include both status and rejectionReason directly
      return this.repository.update(id, {
        status: LocationStatus.REJECTED,
        rejectionReason: rejectionReason,
      });
    } catch (error) {
      console.error(
        `LocationsService.rejectLocation error for ID ${id}:`,
        error,
      );
      throw error;
    }
  }
}
