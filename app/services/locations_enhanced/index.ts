/**
 * Enhanced Locations Service with Geocoding
 * Extends the existing locations_core service with automatic geocoding
 */
import { LocationRepository } from &quot;./repository&quot;;
import { EnhancedLocationsService } from &quot;./locationsService&quot;;
import { geocodingService } from &quot;../maps&quot;;

export * from &quot;./models&quot;;

const locationRepository = new LocationRepository();
export const locationsService = new EnhancedLocationsService(
  locationRepository,
  geocodingService,
);
