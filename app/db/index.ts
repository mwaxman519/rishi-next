/**
 * Database client configuration
 * This module configures the database client with the optimized connection pool
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/shared/schema";

// Create database connection using HTTP adapter
const sql = neon(process.env.DATABASE_URL!);

// Create a drizzle client with our HTTP connection
export const db = drizzle(sql, { schema });

// Export the sql connection for direct query usage when needed
export { sql };

// Export the schema for convenience
export { schema };
