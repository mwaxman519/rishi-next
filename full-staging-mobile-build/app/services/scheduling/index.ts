export * from "./models";
export * from "./schedulingService";

import { SchedulingService } from "./schedulingService";

// Create a singleton instance of the Scheduling service
const schedulingService = new SchedulingService();

export { schedulingService };

// Default export for compatibility with existing code
export default schedulingService;
