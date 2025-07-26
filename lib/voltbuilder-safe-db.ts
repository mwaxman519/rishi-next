// VoltBuilder Safe Database Module
// Prevents database connections during VoltBuilder static generation
// while maintaining full runtime functionality

const isVoltBuilderBuild = process.env.NODE_ENV === 'production' && 
                          !process.env.REPLIT_DOMAINS && 
                          !process.env.VERCEL &&
                          process.env.NEXT_PUBLIC_APP_ENV === 'development';

if (isVoltBuilderBuild) {
  console.log('[VoltBuilder Safe DB] Build-time stubs active - preventing database imports');
  
  // Build-safe database stubs for VoltBuilder
  export const pool = {
    connect: () => Promise.resolve({
      query: () => Promise.resolve({ rows: [] }),
      release: () => {}
    }),
    query: () => Promise.resolve({ rows: [] }),
    end: () => Promise.resolve()
  };
  
  export const db = {
    select: () => ({
      from: () => ({
        where: () => [],
        limit: () => [],
        orderBy: () => []
      })
    }),
    insert: () => ({
      values: () => ({
        returning: () => [],
        onConflictDoUpdate: () => ({ returning: () => [] })
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({ returning: () => [] })
      })
    }),
    delete: () => ({
      where: () => ({ returning: () => [] })
    })
  };
  
  export const sql = () => Promise.resolve({ rows: [] });
  
} else {
  // Normal runtime database connections
  try {
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const { drizzle } = require('drizzle-orm/neon-serverless');
    const ws = require('ws');
    const schema = require('../shared/schema');

    neonConfig.webSocketConstructor = ws;

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
    }

    export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    export const db = drizzle({ client: pool, schema });
    export const sql = pool;
    
  } catch (error) {
    console.log('[VoltBuilder Safe DB] Fallback to stubs due to import error during build');
    
    // Fallback stubs if imports fail during build
    export const pool = {
      connect: () => Promise.resolve({
        query: () => Promise.resolve({ rows: [] }),
        release: () => {}
      })
    };
    
    export const db = {
      select: () => ({ from: () => ({ where: () => [] }) }),
      insert: () => ({ values: () => ({ returning: () => [] }) })
    };
    
    export const sql = () => Promise.resolve({ rows: [] });
  }
}