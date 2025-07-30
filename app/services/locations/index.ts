/**
 * Locations Service Public API
 */
import { LocationsService } from "./locationsService";

// Export singleton instance
export const locationsService = new LocationsService();

// Export types and interfaces
export * from "./models";
