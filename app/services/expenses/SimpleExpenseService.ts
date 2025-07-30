/**
 * @deprecated Use ExpenseService instead
 * This service is being phased out in favor of the event-driven ExpenseService
 */

import { ExpenseService } from &quot;./ExpenseService&quot;;

// Re-export the new service to maintain compatibility
export const simpleExpenseService = new ExpenseService();
