/**
 * Database Status API Helper
 *
 * This utility provides a way to check the status of the database connection
 * for the auth service.
 */

import { testConnection } from "./db";

/**
 * Check database connection status
 * Returns status object indicating whether the database is connected
 */
export async function checkDatabaseStatus() {
  try {
    // Test the database connection
    const status = await testConnection();
    return status;
  } catch (error) {
    // Log and return error status
    console.error("Error checking database status:", error);

    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
