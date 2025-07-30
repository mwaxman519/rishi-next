/**
 * Enhanced Locations Service with Geocoding Integration and Event Bus Integration
 * Extends the base locations service with:
 * - Automatic geocoding
 * - Enhanced event publishing with retry capabilities
 * - Circuit breaker pattern for resilience
 * - Distributed event tracking
 */
import { LocationsService as BaseLocationsService } from &quot;../locations_core/locationsService&quot;;
import { LocationRepository } from &quot;./repository&quot;;
import { GeocodingService } from &quot;../maps/geocodingService&quot;;
import {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
  LocationStatus,
  ApproveLocationParams,
  RejectLocationParams,
} from &quot;./models&quot;;
import { locationCircuitBreaker } from &quot;./locationCircuitBreaker&quot;;
import { locationEventPublisher } from &quot;./locationEventPublisher&quot;;

export class EnhancedLocationsService extends BaseLocationsService {
  private geocodingService: GeocodingService;

  constructor(
    private locationRepository: LocationRepository,
    geocodingService: GeocodingService,
  ) {
    super();
    this.geocodingService = geocodingService;
  }

  /**
   * Create a location with automatic geocoding and circuit breaker protection
   */
  async createLocation(
    data: CreateLocationParams,
    organizationId: string,
    requesterId?: string,
  ): Promise<LocationDTO> {
    try {
      // Check if we should validate address - wrap in circuit breaker
      if (data.validateAddress) {
        await locationCircuitBreaker.executeGeocodingOperation(async () => {
          const isValid = await this.geocodingService.validateAddress(
            this.formatFullAddress(data),
          );

          if (!isValid) {
            throw new Error(
              &quot;Invalid address: Could not geocode the provided address&quot;,
            );
          }

          return true;
        });
      }

      // Prepare data for the base service - remove enhanced fields
      const baseData = { ...data };
      delete (baseData as any).validateAddress;
      delete (baseData as any).useFormattedAddress;

      // Create the location using circuit breaker pattern
      const createdLocation =
        await locationCircuitBreaker.executeCreateOperation(async () => {
          return (await super.createLocation(
            baseData,
            organizationId,
            requesterId,
          )) as LocationDTO;
        });

      // Generate a correlation ID for all related events
      const correlationId = `loc_${createdLocation.id}_${Date.now()}`;

      // Attempt to geocode address and update coordinates with circuit breaker
      try {
        await locationCircuitBreaker.executeGeocodingOperation(async () => {
          await this.geocodeAndUpdateLocation(createdLocation.id, data);
          return true;
        });
      } catch (geocodeError) {
        console.error(
          `Warning: Could not geocode location ${createdLocation.id}:`,
          geocodeError,
        );
        // Don't fail creation if geocoding fails
      }

      // Publish location.created event via the enhanced publisher for reliability
      const fullAddress = this.formatFullAddress({
        address1: createdLocation.address1,
        address2: createdLocation.address2,
        city: createdLocation.city,
        stateId: createdLocation.stateId,
        zipcode: createdLocation.zipcode,
      });

      await locationEventPublisher.publishLocationCreated(
        {
          id: createdLocation.id,
          name: createdLocation.name,
          address: fullAddress,
          organizationId: organizationId,
          createdBy: requesterId || &quot;system&quot;,
          status: createdLocation.status,
        },
        {
          correlationId,
        },
      );

      return createdLocation;
    } catch (error) {
      console.error(&quot;EnhancedLocationsService.createLocation error:&quot;, error);
      throw error;
    }
  }

  /**
   * Update a location with automatic geocoding if address changed
   * Protected by circuit breaker pattern and enhanced event publishing
   */
  async updateLocation(
    id: string,
    data: UpdateLocationParams,
    requesterId?: string,
  ): Promise<LocationDTO> {
    try {
      // Generate a correlation ID for all related events
      const correlationId = `loc_update_${id}_${Date.now()}`;

      // Check if address fields are being updated
      const addressChanged = this.didAddressChange(data);

      // If address changed and validation requested, validate the new address with circuit breaker
      if (addressChanged && data.validateAddress) {
        // Get the current location to merge with updates for validation using circuit breaker
        const currentLocation =
          await locationCircuitBreaker.executeFetchOperation(async () => {
            const location = await this.getLocationById(id);
            if (!location) {
              throw new Error(`Location with ID ${id} not found`);
            }
            return location;
          });

        // Create a merged address for validation
        const addressData = this.extractBaseLocationData(data);
        const mergedAddress = this.getMergedAddress(
          currentLocation,
          addressData,
        );

        // Execute validation through circuit breaker
        await locationCircuitBreaker.executeGeocodingOperation(async () => {
          const isValid = await this.geocodingService.validateAddress(
            this.formatFullAddress(mergedAddress),
          );

          if (!isValid) {
            throw new Error(
              &quot;Invalid address: Could not geocode the provided address&quot;,
            );
          }

          return true;
        });
      }

      // Prepare data for the base service - use our helper to extract only valid fields
      const baseData = this.extractBaseLocationData(data);

      // Update the location using circuit breaker pattern
      const updatedLocation =
        await locationCircuitBreaker.executeUpdateOperation(async () => {
          return (await super.updateLocation(
            id,
            baseData as any,
          )) as LocationDTO;
        });

      // If address changed, update geocoding with circuit breaker protection
      if (addressChanged) {
        try {
          await locationCircuitBreaker.executeGeocodingOperation(async () => {
            // Use our helper function to get clean data
            const geocodeData = this.extractBaseLocationData(data);
            await this.geocodeAndUpdateLocation(id, geocodeData as any);
            return true;
          });
        } catch (geocodeError) {
          console.error(
            `Warning: Could not geocode updated location ${id}:`,
            geocodeError,
          );
          // Don't fail update if geocoding fails
        }
      }

      // Publish location.updated event via enhanced publisher for reliability
      await locationEventPublisher.publishLocationUpdated(
        {
          id: updatedLocation.id,
          changes: this.getChangesRecord(data),
          updatedBy: requesterId || &quot;system&quot;,
        },
        {
          correlationId,
        },
      );

      return updatedLocation;
    } catch (error) {
      console.error(
        `EnhancedLocationsService.updateLocation error for ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Private helper to geocode an address and update a location's coordinates and metadata
   */
  private async geocodeAndUpdateLocation(
    id: string,
    data: Partial<UpdateLocationParams>,
  ): Promise<void> {
    // Get the current full location data
    const location = await this.getLocationById(id);
    if (!location) {
      throw new Error(`Location with ID ${id} not found`);
    }

    // Create a merged address object
    const mergedAddress = this.getMergedAddress(location, data);
    const fullAddress = this.formatFullAddress(mergedAddress);

    // Geocode the address
    const geocodeResult =
      await this.geocodingService.getSimpleGeocodingResult(fullAddress);

    if (!geocodeResult) {
      throw new Error(`Failed to geocode address: ${fullAddress}`);
    }

    // Prepare update with coordinates and formatted address
    const updateData: Pick<
      UpdateLocationParams,
      &quot;latitude&quot; | &quot;longitude&quot; | &quot;address1&quot;
    > = {
      latitude: geocodeResult.lat,
      longitude: geocodeResult.lng,
    };

    // Use formatted address if a formatted address is available
    if (geocodeResult.formattedAddress) {
      // Parse formatted address into components (simplified)
      // In a real implementation, would parse the address into components more intelligently
      updateData.address1 = geocodeResult.formattedAddress.split(&quot;,&quot;)[0];
    }

    // Update location with geocoded coordinates
    const baseUpdateData = { ...updateData };

    await super.updateLocation(id, baseUpdateData as any);

    // Store geocoding metadata with explicit handling of nullable values
    await this.locationRepository.updateGeocodingMetadata(id, {
      placeId: geocodeResult.placeId || null,
      formattedAddress: geocodeResult.formattedAddress || null,
      geocodingAccuracy: &quot;rooftop&quot;, // Example, would come from actual API in a real implementation
    });
  }

  /**
   * Check if address components have changed in the update data
   */
  private didAddressChange(data: UpdateLocationParams): boolean {
    return !!(
      data.address1 ||
      data.address2 ||
      data.city ||
      data.stateId ||
      data.zipcode
    );
  }

  /**
   * Create a merged address from current location and update data
   */
  private getMergedAddress(
    current: LocationDTO,
    updates: Partial<UpdateLocationParams>,
  ): {
    address1: string;
    address2?: string;
    city: string;
    stateId: string;
    zipcode: string;
  } {
    const address2 =
      updates.address2 !== undefined ? updates.address2 : current.address2;

    return {
      address1:
        updates.address1 !== undefined ? updates.address1 : current.address1,
      ...(address2 ? { address2 } : {}),
      city: updates.city !== undefined ? updates.city : current.city,
      stateId:
        updates.stateId !== undefined ? updates.stateId : current.stateId,
      zipcode:
        updates.zipcode !== undefined ? updates.zipcode : current.zipcode,
    };
  }

  /**
   * Format a full address string for geocoding
   */
  private formatFullAddress(address: Record<string, any>): string {
    let parts = [address.address1];

    if (address.address2) {
      parts.push(address.address2);
    }

    parts.push(
      `${address.city}, ${address.stateId || "&quot;} ${address.zipcode || &quot;&quot;}`,
    );

    return parts.join(&quot;, &quot;);
  }

  /**
   * Extract base location data without enhanced fields
   * This ensures type compatibility when passing data between base and enhanced services
   */
  private extractBaseLocationData(
    data: UpdateLocationParams,
  ): Partial<UpdateLocationParams> {
    // Explicitly pick only the fields we need without enhanced service fields
    const {
      name,
      type,
      address1,
      address2,
      city,
      stateId,
      zipcode,
      phone,
      email,
      website,
      contactName,
      contactEmail,
      contactPhone,
      notes,
      latitude,
      longitude,
      status,
      rejectionReason,
    } = data;

    const baseData: Partial<UpdateLocationParams> = {};

    // Only include properties that are defined
    if (name !== undefined) baseData.name = name;
    if (type !== undefined) baseData.type = type;
    if (address1 !== undefined) baseData.address1 = address1;
    if (address2 !== undefined) baseData.address2 = address2;
    if (city !== undefined) baseData.city = city;
    if (stateId !== undefined) baseData.stateId = stateId;
    if (zipcode !== undefined) baseData.zipcode = zipcode;
    if (phone !== undefined) baseData.phone = phone;
    if (email !== undefined) baseData.email = email;
    if (website !== undefined) baseData.website = website;
    if (contactName !== undefined) baseData.contactName = contactName;
    if (contactEmail !== undefined) baseData.contactEmail = contactEmail;
    if (contactPhone !== undefined) baseData.contactPhone = contactPhone;
    if (notes !== undefined) baseData.notes = notes;
    if (latitude !== undefined) baseData.latitude = latitude;
    if (longitude !== undefined) baseData.longitude = longitude;
    if (status !== undefined) baseData.status = status;
    if (rejectionReason !== undefined)
      baseData.rejectionReason = rejectionReason;

    return baseData;
  }

  /**
   * Create a clean record of changes for event tracking
   * This sanitizes the change data for event emission
   */
  private getChangesRecord(data: UpdateLocationParams): Record<string, any> {
    // Start with the base data fields
    const changeRecord = this.extractBaseLocationData(data);

    // Remove fields with undefined or null values
    const cleanChanges: Record<string, any> = {};
    for (const [key, value] of Object.entries(changeRecord)) {
      if (value !== undefined && value !== null) {
        cleanChanges[key] = value;
      }
    }

    // Add any status change information
    if (data.status) {
      cleanChanges.statusChanged = true;

      // Add special metadata for specific status changes
      if (data.status === LocationStatus.APPROVED) {
        cleanChanges.wasApproved = true;
      } else if (data.status === LocationStatus.REJECTED) {
        cleanChanges.wasRejected = true;
        if (data.rejectionReason) {
          cleanChanges.rejectionReason = data.rejectionReason;
        }
      }
    }

    return cleanChanges;
  }

  /**
   * Override the approveLocation method to include event publishing with circuit breaker protection
   */
  async approveLocation(params: ApproveLocationParams): Promise<LocationDTO> {
    try {
      // Generate a correlation ID for all related events
      const correlationId = `loc_approve_${params.id}_${Date.now()}`;

      // Get the current location before approval for previous status using circuit breaker
      const existingLocation =
        await locationCircuitBreaker.executeFetchOperation(async () => {
          const location = await this.getLocationById(params.id);
          if (!location) {
            throw new Error(`Location with ID ${params.id} not found`);
          }
          return location;
        });

      // Call the parent method to perform the actual approval with circuit breaker
      const approvedLocation =
        await locationCircuitBreaker.executeApprovalOperation(async () => {
          return await super.approveLocation(params);
        });

      // Publish location.approved event via enhanced publisher for reliability
      await locationEventPublisher.publishLocationApproved(
        {
          id: approvedLocation.id,
          name: approvedLocation.name,
          approvedBy: params.requesterId || &quot;system&quot;,
          previousStatus: existingLocation.status,
        },
        {
          correlationId,
        },
      );

      return approvedLocation;
    } catch (error) {
      console.error(
        `EnhancedLocationsService.approveLocation error for ID ${params.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Override the rejectLocation method to include event publishing with circuit breaker protection
   */
  async rejectLocation(params: RejectLocationParams): Promise<LocationDTO> {
    try {
      // Generate a correlation ID for all related events
      const correlationId = `loc_reject_${params.id}_${Date.now()}`;

      // Get the current location before rejection for previous status using circuit breaker
      const existingLocation =
        await locationCircuitBreaker.executeFetchOperation(async () => {
          const location = await this.getLocationById(params.id);
          if (!location) {
            throw new Error(`Location with ID ${params.id} not found`);
          }
          return location;
        });

      // Call the parent method to perform the actual rejection with circuit breaker
      const rejectedLocation =
        await locationCircuitBreaker.executeApprovalOperation(async () => {
          return await super.rejectLocation(params);
        });

      // Publish location.rejected event via enhanced publisher for reliability
      await locationEventPublisher.publishLocationRejected(
        {
          id: rejectedLocation.id,
          name: rejectedLocation.name,
          rejectedBy: params.requesterId || &quot;system&quot;,
          reason: params.reason || &quot;No reason provided&quot;,
          previousStatus: existingLocation.status,
        },
        {
          correlationId,
        },
      );

      return rejectedLocation;
    } catch (error) {
      console.error(
        `EnhancedLocationsService.rejectLocation error for ID ${params.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Override the deleteLocation method to include event publishing with circuit breaker protection
   */
  async deleteLocation(id: string, requesterId?: string): Promise<void> {
    try {
      // Generate a correlation ID for all related events
      const correlationId = `loc_delete_${id}_${Date.now()}`;

      // Get the location before deletion using circuit breaker
      const locationToDelete =
        await locationCircuitBreaker.executeFetchOperation(async () => {
          const location = await this.getLocationById(id);
          if (!location) {
            throw new Error(`Location with ID ${id} not found`);
          }
          return location;
        });

      // Store location details for the event before deletion
      const locationDetails = {
        id,
        name: locationToDelete.name,
        address: this.formatFullAddress({
          address1: locationToDelete.address1,
          address2: locationToDelete.address2,
          city: locationToDelete.city,
          stateId: locationToDelete.stateId,
          zipcode: locationToDelete.zipcode,
        }),
        status: locationToDelete.status,
      };

      // Call the parent method to perform the actual deletion with circuit breaker
      await locationCircuitBreaker.executeDeleteOperation(async () => {
        await super.deleteLocation(id);
        return true;
      });

      // Publish location.deleted event via enhanced publisher for reliability
      await locationEventPublisher.publishLocationDeleted(
        {
          id: locationDetails.id,
          name: locationDetails.name,
          deletedBy: requesterId || &quot;system",
        },
        {
          correlationId,
        },
      );
    } catch (error) {
      console.error(
        `EnhancedLocationsService.deleteLocation error for ID ${id}:`,
        error,
      );
      throw error;
    }
  }
}
