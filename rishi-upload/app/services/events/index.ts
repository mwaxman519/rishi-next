export * from "./models";
export * from "./eventsService";

import { EventsService } from "./eventsService";

// Create a singleton instance of the Events service
const eventsService = new EventsService();

export { eventsService };

// Default export for compatibility with existing code
export default eventsService;
