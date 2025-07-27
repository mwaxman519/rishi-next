/**
 * Canonical database connection file for the application
 * This file should be the only place where database connections are established
 * All other files should import from this file
 */

// Import the enhanced database connection handler
import {
  db,
  getEnvironment,
  checkDatabaseConnection,
} from "./lib/db-connection";

// Export the database connection and ORM instance
export { db, getEnvironment, checkDatabaseConnection };
