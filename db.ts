/**
 * Database connection module
 * Provides database connection and ORM instance for the application
 */

import { db } from "./app/lib/db-connection";

// Re-export the database connection for backwards compatibility
export { db };

// Export test connection function for auth-service
export async function testConnection() {
  try {
    const result = await db.execute("SELECT 1 as test");
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default db;
