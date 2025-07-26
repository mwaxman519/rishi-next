export * from "./models";
export * from "./rbacService";

import { RBACService } from "./rbacService";

// Create a singleton instance of the RBAC service
const rbacService = new RBACService();

export { rbacService };

// Default export for compatibility with existing code
export default rbacService;
