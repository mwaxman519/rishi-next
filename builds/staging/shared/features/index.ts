/**
 * Feature Module Registry
 * Central registration and initialization of all feature modules
 */
import { FeatureModuleRegistry } from "./types";
import { StaffSelectionFeatureModule } from "./modules/staff-selection";

// Create registry instance - singleton pattern
export const featureRegistry = new FeatureModuleRegistry();

// Export all types and utilities
export * from "./types";

/**
 * Initialize and register all feature modules
 * This should be called once during application startup
 */
export function registerFeatureModules(): void {
  console.log("Registering feature modules...");

  // Register Tier 1 features (Staff Leasing)
  featureRegistry.registerModule(new StaffSelectionFeatureModule());

  console.log("Feature modules registered");
}

/**
 * Get a list of all registered feature modules
 */
export function getAllFeatureModules() {
  return featureRegistry.getAllModules();
}

/**
 * Get a specific feature module by ID
 */
export function getFeatureModule(id: string) {
  return featureRegistry.getModule(id);
}
