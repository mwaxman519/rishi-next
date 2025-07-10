import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Database connecting to staging environment");

// Create connection with proper configuration for staging
const sql = neon(process.env.DATABASE_URL, {
  fullResults: true,
  arrayMode: false,
});

export const db = drizzle(sql, { schema });

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Database connection successful');
    console.log('Time:', result[0].current_time);
    console.log('Version:', result[0].pg_version);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Test database connection with detailed response
export async function testDatabaseConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Database connection test successful');
    return { 
      success: true, 
      message: 'Database connection successful',
      data: {
        time: result[0].current_time,
        version: result[0].pg_version
      }
    };
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return { 
      success: false, 
      message: `Database connection failed: ${error}`,
      error: error
    };
  }
}

// Export types for use in API routes
export type Database = typeof db;
export { schema };

// Additional database utility functions
export async function executeQuery(query: string, params?: any[]): Promise<any> {
  try {
    const result = await sql(query, params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    `;
    return result[0].exists;
  } catch (error) {
    console.error('Error checking table existence:', error);
    return false;
  }
}

export async function getDatabaseStats(): Promise<any> {
  try {
    const result = await sql`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      LIMIT 10
    `;
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}