/**
 * Enhanced Location Repository with geocoding support
 * Extends the base repository with additional fields for geocoding data
 */
import { LocationRepository as BaseLocationRepository } from "../locations_core/repository";
import { db } from "../../server/db";
import { locations } from "../../../shared/schema";
import { eq } from "drizzle-orm";
import {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
} from "./models";

export class LocationRepository extends BaseLocationRepository {
  /**
   * Update geocoding metadata for a location
   */
  async updateGeocodingMetadata(
    id: string,
    metadata: {
      placeId?: string | null;
      formattedAddress?: string | null;
      geocodingAccuracy?: string | null;
    },
  ): Promise<LocationDTO> {
    try {
      // Update the location with geocoding information
      // Note: Since we don't have a metadata JSON column, we store relevant data in notes field
      const geocodingInfo = `Place ID: ${metadata.placeId || "N/A"}, 
        Formatted Address: ${metadata.formattedAddress || "N/A"}, 
        Accuracy: ${metadata.geocodingAccuracy || "N/A"},
        Last Geocoded: ${new Date().toISOString()}`;

      const [updatedLocation] = await db
        .update(locations)
        .set({
          notes: geocodingInfo,
          updated_at: new Date(),
        })
        .where(eq(locations.id, id))
        .returning();

      if (!updatedLocation) {
        throw new Error(`Location with ID ${id} not found`);
      }

      return this.findById(updatedLocation.id) as Promise<LocationDTO>;
    } catch (error) {
      console.error(
        `Error updating geocoding metadata for location ${id}:`,
        error,
      );
      throw new Error(
        `Failed to update geocoding metadata: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Override the mapToDTO method to include geocoding metadata
   */
  protected mapToDTO(row: any): LocationDTO {
    // Get the base DTO from the parent class
    const baseDTO = super.mapToDTO(row) as LocationDTO;

    // Parse geocoding metadata from notes field if available
    if (row.locations.notes) {
      try {
        const notes = row.locations.notes;
        // Extract place ID if present in notes
        const placeIdMatch = notes.match(/Place ID: ([^,]+)/);
        const formattedAddressMatch = notes.match(/Formatted Address: ([^,]+)/);
        const accuracyMatch = notes.match(/Accuracy: ([^,]+)/);
        const lastGeocodedMatch = notes.match(/Last Geocoded: ([^\s]+)/);

        if (placeIdMatch || formattedAddressMatch || accuracyMatch) {
          baseDTO.geocodingData = {
            placeId: placeIdMatch ? placeIdMatch[1].trim() : null,
            formattedAddress: formattedAddressMatch
              ? formattedAddressMatch[1].trim()
              : null,
            geocodingAccuracy: accuracyMatch ? accuracyMatch[1].trim() : null,
            lastGeocodedAt: lastGeocodedMatch
              ? lastGeocodedMatch[1].trim()
              : null,
          };
        }
      } catch (error) {
        console.warn("Error parsing geocoding data from notes:", error);
      }
    }

    return baseDTO;
  }
}
