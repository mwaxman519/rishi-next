import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

// Lazy-load database connection to prevent build-time errors
let _sql: ReturnType<typeof neon> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDatabase() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    console.log("Database connecting to staging environment");
    
    // Create connection with proper configuration for staging stability
    _sql = neon(process.env.DATABASE_URL, {
      fullResults: true,
      arrayMode: false,
    });
    _db = drizzle(_sql, { schema });
  }
  return { sql: _sql!, db: _db };
}

// Export a proxy that lazy-loads the database connection
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const { db: actualDb } = getDatabase();
    return actualDb[prop as keyof typeof actualDb];
  }
});

// Test connection function
export async function testConnection() {
  try {
    const { sql } = getDatabase();
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
