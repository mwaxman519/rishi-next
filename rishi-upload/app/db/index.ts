/**
 * Database client configuration
 * This module configures the database client with the optimized connection pool
 */
import { drizzle } from "drizzle-orm/neon-serverless";
import pool from "./connection-pool";
import * as schema from "@shared/schema";

// Create a drizzle client with our optimized connection pool
export const db = drizzle(pool, { schema });

// Export the pool for direct query usage when needed
export { pool };

// Export the schema for convenience
export { schema };
