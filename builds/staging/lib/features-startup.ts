/**
 * Feature Module Initialization
 * Initializes all feature modules during application startup
 */
import { registerFeatureModules } from "@/shared/features";

let featuresInitialized = false;

/**
 * Initialize all feature modules
 * This is called during application startup
 */
export function initializeFeatures() {
  if (featuresInitialized) {
    return;
  }

  console.log("Initializing feature modules...");

  try {
    // Register all feature modules
    registerFeatureModules();

    console.log("Feature modules initialized successfully");
    featuresInitialized = true;
  } catch (error) {
    console.error("Error initializing feature modules:", error);
  }
}

/**
 * Ensure features are initialized
 * This can be called safely from multiple locations
 */
export function ensureFeaturesInitialized() {
  if (!featuresInitialized) {
    initializeFeatures();
  }
}
