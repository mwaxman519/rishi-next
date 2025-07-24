/**
 * Location Repository for data access operations
 */
import { db } from "../../server/db";
import {
  locations,
  states,
  users,
  organizations,
} from "../../../shared/schema";
import { eq, and, or, desc } from "drizzle-orm";
import {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
  LocationStatus,
  LocationType,
} from "./models";

export class LocationRepository {
  /**
   * Find all locations with optional filtering
   */
  async findAll(filters: Record<string, any> = {}): Promise<LocationDTO[]> {
    try {
      // Build query filters
      const queryFilters = [];

      if (filters.stateId) {
        queryFilters.push(eq(locations.stateId, filters.stateId));
      }

      if (filters.status) {
        queryFilters.push(eq(locations.status, filters.status));
      }

      if (filters.type) {
        queryFilters.push(eq(locations.type, filters.type));
      }

      if (filters.organizationId) {
        queryFilters.push(eq(locations.organizationId, filters.organizationId));
      }

      // Execute query with relations
      const locationsData = await db
        .select()
        .from(locations)
        .leftJoin(states, eq(locations.stateId, states.id))
        .leftJoin(users, eq(locations.requester_id, users.id))
        .leftJoin(organizations, eq(locations.organizationId, organizations.id))
        .where(queryFilters.length > 0 ? and(...queryFilters) : undefined)
        .orderBy(desc(locations.createdAt));

      // Map to DTOs
      return locationsData.map((row) => this.mapToDTO(row));
    } catch (error) {
      console.error("Error finding locations:", error);
      throw new Error(
        `Failed to find locations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Find location by ID
   */
  async findById(id: string): Promise<LocationDTO | null> {
    try {
      const [locationData] = await db
        .select()
        .from(locations)
        .leftJoin(states, eq(locations.stateId, states.id))
        .leftJoin(users, eq(locations.requester_id, users.id))
        .leftJoin(organizations, eq(locations.organizationId, organizations.id))
        .where(eq(locations.id, id));

      return locationData ? this.mapToDTO(locationData) : null;
    } catch (error) {
      console.error(`Error finding location with ID ${id}:`, error);
      throw new Error(
        `Failed to find location: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create a new location
   */
  async create(
    data: CreateLocationParams,
    organizationId: string,
    requesterId?: string,
  ): Promise<LocationDTO> {
    try {
      // Prepare values for insertion
      const insertValues = {
        name: data.name,
        type: data.type,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        stateId: data.stateId,
        zipcode: data.zipcode,
        phone: data.phone,
        email: data.email,
        website: data.website,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        notes: data.notes,
        status: LocationStatus.PENDING,
        organizationId: organizationId,
        requester_id: requesterId,
        latitude: data.latitude !== undefined ? String(data.latitude) : null,
        longitude: data.longitude !== undefined ? String(data.longitude) : null,
      };

      // Insert into database
      const [newLocation] = await db
        .insert(locations)
        .values(insertValues)
        .returning();

      if (!newLocation) {
        throw new Error("Failed to create location, no record returned");
      }

      return this.findById(newLocation.id) as Promise<LocationDTO>;
    } catch (error) {
      console.error("Error creating location:", error);
      throw new Error(
        `Failed to create location: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Update an existing location
   */
  async update(id: string, data: UpdateLocationParams): Promise<LocationDTO> {
    try {
      // Create a new update object with proper type conversions for Drizzle
      const updateData: any = { ...data, updatedAt: new Date() };

      // Convert numeric values to strings for Drizzle compatibility
      if (data.latitude !== undefined) {
        updateData.latitude = String(data.latitude);
      }

      if (data.longitude !== undefined) {
        updateData.longitude = String(data.longitude);
      }

      const [updatedLocation] = await db
        .update(locations)
        .set(updateData)
        .where(eq(locations.id, id))
        .returning();

      if (!updatedLocation) {
        throw new Error(`Location with ID ${id} not found`);
      }

      return this.findById(updatedLocation.id) as Promise<LocationDTO>;
    } catch (error) {
      console.error(`Error updating location with ID ${id}:`, error);
      throw new Error(
        `Failed to update location: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Delete a location
   */
  async delete(id: string): Promise<void> {
    try {
      await db.delete(locations).where(eq(locations.id, id));
    } catch (error) {
      console.error(`Error deleting location with ID ${id}:`, error);
      throw new Error(
        `Failed to delete location: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Map raw database rows to DTO
   * Protected to allow overriding in derived classes
   */
  protected mapToDTO(row: any): LocationDTO {
    // Parse latitude and longitude as numbers if they exist
    const latitude = row.locations.latitude
      ? parseFloat(row.locations.latitude)
      : undefined;
    const longitude = row.locations.longitude
      ? parseFloat(row.locations.longitude)
      : undefined;

    // Create state object if state data exists
    const state = row.states
      ? {
          id: row.states.id,
          name: row.states.name,
          abbreviation: row.states.abbreviation,
        }
      : undefined;

    // Create requester object if user data exists
    const requester = row.users
      ? {
          id: row.users.id,
          fullName: row.users.fullName,
          email: row.users.email,
        }
      : undefined;

    // Map database row to LocationDTO
    const dto: LocationDTO = {
      id: row.locations.id,
      name: row.locations.name,
      address1: row.locations.address1,
      address2: row.locations.address2 || undefined,
      city: row.locations.city,
      stateId: row.locations.stateId,
      state: state,
      zipcode: row.locations.zipcode,
      type: row.locations.type as LocationType,
      status: row.locations.status as LocationStatus,
      phone: row.locations.phone || undefined,
      email: row.locations.email || undefined,
      website: row.locations.website || undefined,
      latitude: latitude,
      longitude: longitude,
      contactName: row.locations.contactName || undefined,
      contactEmail: row.locations.contactEmail || undefined,
      contactPhone: row.locations.contactPhone || undefined,
      notes: row.locations.notes || undefined,
      rejectionReason: row.locations.rejectionReason || undefined,
      createdAt: row.locations.createdAt.toISOString(),
      updatedAt: row.locations.updatedAt.toISOString(),
      requester: requester,
    };

    return dto;
  }
}
