/**
 * Enhanced Locations Service with Geocoding
 * Extends the existing locations_core service with automatic geocoding
 */
import { LocationRepository } from "./repository";
import { EnhancedLocationsService } from "./locationsService";
import { geocodingService } from "../maps";

export * from "./models";

const locationRepository = new LocationRepository();
export const locationsService = new EnhancedLocationsService(
  locationRepository,
  geocodingService,
);
