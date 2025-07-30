/**
 * @deprecated Use TimeTrackingService instead
 * This service is being phased out in favor of the event-driven TimeTrackingService
 */

import { TimeTrackingService } from &quot;./TimeTrackingService&quot;;

// Re-export the new service to maintain compatibility
export const simpleTimeTrackingService = new TimeTrackingService();
