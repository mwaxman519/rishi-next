/**
 * Kit Management Service Public API
 */
import { KitRepository } from &quot;./repository&quot;;
import { KitsService } from &quot;./kitsService&quot;;

// Create repository and service instances
const kitRepository = new KitRepository();
export const kitsService = new KitsService(kitRepository);

// Export types and interfaces
export * from &quot;./models&quot;;
export { KitsService } from &quot;./kitsService&quot;;
