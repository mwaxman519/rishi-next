&quot;use server&quot;;

import { db } from &quot;../lib/db&quot;;
import { items } from &quot;../../shared/schema&quot;;

/**
 * Get all items from the database
 * This is a server action that directly accesses the database
 */
export async function getItems() {
  // For server components, fetch data directly from the database
  try {
    const allItems = await db.select().from(items);
    return allItems;
  } catch (error) {
    console.error(&quot;Error fetching items:&quot;, error);
    return [];
  }
}
