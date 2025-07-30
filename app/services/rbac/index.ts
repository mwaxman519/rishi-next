export * from &quot;./models&quot;;
export * from &quot;./rbacService&quot;;

import { RBACService } from &quot;./rbacService&quot;;

// Create a singleton instance of the RBAC service
const rbacService = new RBACService();

export { rbacService };

// Default export for compatibility with existing code
export default rbacService;
