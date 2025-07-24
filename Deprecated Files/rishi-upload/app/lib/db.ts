/**
 * Database module re-export for API routes
 * This provides consistent access to the database connection
 */

import { db } from "./db-connection";

export { db };
export default db;
