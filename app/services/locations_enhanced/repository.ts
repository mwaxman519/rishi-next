/**
 * Enhanced Location Repository with geocoding support
 * Extends the base repository with additional fields for geocoding data
 */
import { LocationRepository as BaseLocationRepository } from &quot;../locations_core/repository&quot;;
import { db } from &quot;../../../lib/db-connection&quot;;
import { locations } from &quot;../../../shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
} from &quot;./models&quot;;

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
      // Note: Since we don&apos;t have a metadata JSON column, we store relevant data in notes field
      const geocodingInfo = `Place ID: ${metadata.placeId || &quot;N/A&quot;}, 
        Formatted Address: ${metadata.formattedAddress || &quot;N/A&quot;}, 
        Accuracy: ${metadata.geocodingAccuracy || &quot;N/A&quot;},
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
        console.warn(&quot;Error parsing geocoding data from notes:&quot;, error);
      }
    }

    return baseDTO;
  }
}
