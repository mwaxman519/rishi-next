export * from &quot;./models&quot;;
export * from &quot;./schedulingService&quot;;

import { SchedulingService } from &quot;./schedulingService&quot;;

// Create a singleton instance of the Scheduling service
const schedulingService = new SchedulingService();

export { schedulingService };

// Default export for compatibility with existing code
export default schedulingService;
