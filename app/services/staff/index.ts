export * from "./models";
export * from "./staffService";

import { StaffService } from "./staffService";

// Create a singleton instance of the Staff service
const staffService = new StaffService();

export { staffService };

// Default export for compatibility with existing code
export default staffService;
