/**
 * Server-side database connection
 * Re-exports the main database connection for server components
 */

import { db } from "../db";

// Re-export database connection
export { db };
export default db;