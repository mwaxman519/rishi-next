/**
 * Feature system initialization
 * This module handles the initialization of the feature system
 */
import { FeatureModuleRegistry } from "./registry";

// Import feature modules
import { CoreFeature } from "./modules/core";
import { WhiteLabelingFeature } from "./modules/white-labeling";
import { AdvancedReportingFeature } from "./modules/advanced-reporting";

/**
 * Initialize the feature system by registering all feature modules
 */
export function initializeFeatureSystem(): void {
  console.log("Initializing feature system...");

  // Register core features (always available to all organizations)
  FeatureModuleRegistry.registerModule(CoreFeature);

  // Register tier-specific features
  FeatureModuleRegistry.registerModule(WhiteLabelingFeature);
  FeatureModuleRegistry.registerModule(AdvancedReportingFeature);

  // Add more feature modules here as they are developed

  console.log(
    `Feature system initialized with ${FeatureModuleRegistry.getAllModules().length} modules.`,
  );
}
