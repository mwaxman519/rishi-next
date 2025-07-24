/**
 * Application startup initialization
 * This module is responsible for initializing various subsystems of the application during startup
 */

import { initializeFeatureSystem } from "../shared/features/initialize";
import { initializeServices } from "./services/initializeServices";

/**
 * Initialize the application
 * This is called during the server startup phase
 */
export function initializeApplication() {
  console.log("Initializing application...");

  // Initialize the feature module system
  initializeFeatureSystem();

  // Initialize application services (event bus, message handlers, etc.)
  try {
    initializeServices();
  } catch (error) {
    console.error("Error initializing services:", error);
    // Continue application startup even if service initialization fails
    // to ensure basic app functionality is still available
  }

  // Add other initialization functions here as needed
  // E.g., initialize plugins, setup scheduled tasks, etc.

  console.log("Application initialized successfully");
}
