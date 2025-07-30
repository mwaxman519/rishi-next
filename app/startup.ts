/**
 * Application startup initialization
 * This module is responsible for initializing various subsystems of the application during startup
 */

import { initializeFeatureSystem } from &quot;../shared/features/initialize&quot;;
import { initializeServices } from &quot;./services/initializeServices&quot;;

/**
 * Initialize the application
 * This is called during the server startup phase
 */
export function initializeApplication() {
  console.log(&quot;Initializing application...&quot;);

  // Initialize the feature module system
  initializeFeatureSystem();

  // Initialize application services (event bus, message handlers, etc.)
  try {
    initializeServices();
  } catch (error) {
    console.error(&quot;Error initializing services:&quot;, error);
    // Continue application startup even if service initialization fails
    // to ensure basic app functionality is still available
  }

  // Add other initialization functions here as needed
  // E.g., initialize plugins, setup scheduled tasks, etc.

  console.log(&quot;Application initialized successfully&quot;);
}
