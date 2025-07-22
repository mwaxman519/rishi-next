/**
 * @deprecated Use ShiftService instead
 * This service is being phased out in favor of the event-driven ShiftService
 */

import { ShiftService } from "./ShiftService";

// Re-export the new service to maintain compatibility
export const simpleShiftService = new ShiftService();
