export * from "./models";
export * from "./organizationService";

import { OrganizationService } from "./organizationService";

// Create a singleton instance of the Organization service
const organizationService = new OrganizationService();

export { organizationService };

// Default export for compatibility with existing code
export default organizationService;
