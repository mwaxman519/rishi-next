import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create Neon connection
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle database instance
export const db = drizzle(sql, { schema });

export default db;