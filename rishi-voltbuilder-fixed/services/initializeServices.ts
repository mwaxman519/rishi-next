import { initializeBookingEventHandlers } from "@/app/events/booking-event-handlers";

/**
 * Initialize all application services
 * This function is called during application startup
 */
export function initializeServices() {
  // Initialize booking event handlers
  initializeBookingEventHandlers();

  console.log("Services initialized");
}
