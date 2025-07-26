/**
 * VoltBuilder-safe database module that prevents memory leaks during static builds
 * This module provides lazy initialization to avoid creating connections during build time
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

// Check if we're in VoltBuilder build environment
const isVoltBuilderBuild = () => {
  return process.env.VOLTBUILDER_BUILD === 'true' || 
         (process.env.NODE_ENV === 'production' && 
          !process.env.REPLIT_DOMAINS && 
          !process.env.VERCEL &&
          process.env.NEXT_PUBLIC_APP_ENV === 'development');
};

// Lazy-loaded database instance
let _db: any = null;
let _sql: any = null;

/**
 * Get database instance with lazy initialization
 * Prevents memory leaks by not creating connections during build
 */
export function getDb() {
  // Return stub during VoltBuilder builds
  if (isVoltBuilderBuild()) {
    return {
      select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
      insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
      delete: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) })
    };
  }

  // Lazy initialize only when needed at runtime
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL must be set');
    }

    _sql = neon(databaseUrl, {
      fullResults: true,
      arrayMode: false,
    });
    
    _db = drizzle(_sql, { schema });
  }

  return _db;
}

/**
 * Get SQL instance for raw queries
 */
export function getSql() {
  if (isVoltBuilderBuild()) {
    return () => Promise.resolve({ rows: [] });
  }

  if (!_sql) {
    getDb(); // This will initialize _sql
  }
  
  return _sql;
}

// Export schema for type safety
export { schema };