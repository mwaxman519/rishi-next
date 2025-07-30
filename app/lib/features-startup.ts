/**
 * Feature Module Initialization
 * Initializes all feature modules during application startup
 */
import { registerFeatureModules } from &quot;../../shared/features&quot;;

let featuresInitialized = false;

/**
 * Initialize all feature modules
 * This is called during application startup
 */
export function initializeFeatures() {
  if (featuresInitialized) {
    return;
  }

  console.log(&quot;Initializing feature modules...&quot;);

  try {
    // Register all feature modules
    registerFeatureModules();

    console.log(&quot;Feature modules initialized successfully&quot;);
    featuresInitialized = true;
  } catch (error) {
    console.error(&quot;Error initializing feature modules:&quot;, error);
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
