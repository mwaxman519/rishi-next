export * from &quot;./models&quot;;
export * from &quot;./staffService&quot;;

import { StaffService } from &quot;./staffService&quot;;

// Create a singleton instance of the Staff service
const staffService = new StaffService();

export { staffService };

// Default export for compatibility with existing code
export default staffService;
