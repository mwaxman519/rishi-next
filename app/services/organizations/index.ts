export * from &quot;./models&quot;;
export * from &quot;./organizationService&quot;;

import { OrganizationService } from &quot;./organizationService&quot;;

// Create a singleton instance of the Organization service
const organizationService = new OrganizationService();

export { organizationService };

// Default export for compatibility with existing code
export default organizationService;
