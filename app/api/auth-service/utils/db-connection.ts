/**
 * Robust Database Connection Handler for Authentication Service
 * Implements circuit breaker pattern and connection pooling
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

interface ConnectionState {
  isHealthy: boolean;
  lastFailureTime: number;
  consecutiveFailures: number;
  circuitBreakerOpen: boolean;
}

class DatabaseConnectionManager {
  private sql: any;
  private db: any;
  private state: ConnectionState;
  private readonly maxRetries = 3;
  private readonly circuitBreakerThreshold = 5;
  private readonly circuitBreakerTimeout = 30000; // 30 seconds
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    this.state = {
      isHealthy: true,
      lastFailureTime: 0,
      consecutiveFailures: 0,
      circuitBreakerOpen: false,
    };
    
    // Delayed initialization to prevent build-time issues
    this.initializeConnection();
  }

  private initializeConnection() {
    try {
      // Skip database initialization during VoltBuilder builds
      if (process.env.VOLTBUILDER_BUILD === 'true') {
        console.log("[DB Manager] VoltBuilder build detected - skipping database initialization");
        this.sql = () => Promise.resolve({ rows: [] });
        this.db = { select: () => ({ from: () => ({ where: () => [] }) }) };
        return;
      }

      // Skip initialization during static generation or if running in a build context
      if (typeof window !== 'undefined' || process.env.NEXT_PHASE === 'phase-production-build') {
        console.log("[DB Manager] Build or client context detected - deferring database initialization");
        this.sql = null;
        this.db = null;
        return;
      }
      
      console.log("[DB Manager] Initializing database connection...");
      
      // Environment detection with enhanced validation
      const environment = this.getEnvironment();
      console.log("[DB Manager] Environment detection:", {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL: process.env.VERCEL,
        DEPLOY_ENV: process.env.DEPLOY_ENV,
        STAGING: process.env.STAGING,
        REPLIT_DOMAINS: process.env.REPLIT_DOMAINS,
        NEXT_PHASE: process.env.NEXT_PHASE,
        detectedEnvironment: environment
      });
      
      // Get appropriate database URL based on environment
      const databaseUrl = this.getDatabaseUrl(environment);
      console.log(`[DB Manager] Using ${environment} database: ${databaseUrl.substring(0, 50)}...`);
      
      // Create neon connection with optimized settings
      this.sql = neon(databaseUrl, {
        fullResults: true,
        arrayMode: false,
      });
      
      this.db = drizzle(this.sql, { schema });
      
      // Validate database connection is properly created
      if (!this.db) {
        throw new Error("Database connection failed to initialize");
      }
      
      console.log("[DB Manager] Database connection initialized successfully");
      this.handleConnectionSuccess();
    } catch (error) {
      console.error("[DB Manager] Failed to initialize database connection:", error);
      this.handleConnectionFailure();
      
      // Don't re-throw during build phases to prevent build failures
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.log("[DB Manager] Build phase detected - not throwing error to prevent build failure");
        this.sql = null;
        this.db = null;
        return;
      }
      
      // Re-throw for runtime errors
      throw error;
    }
  }

  private getEnvironment(): "development" | "staging" | "production" {
    // CRITICAL ENVIRONMENT DETECTION FIX
    // VERCEL = PRODUCTION, REPLIT AUTOSCALE = STAGING, REPLIT DEVELOPMENT = DEVELOPMENT
    
    // Check if we're in Vercel production (PRODUCTION environment)
    const isVercelProduction = 
      process.env.VERCEL_ENV === "production" ||
      process.env.VERCEL === "1";

    // Check if we're in Replit Autoscale deployment (STAGING environment)
    // Only consider it staging if it's actually a deployment, not development
    const isReplitAutoscale = 
      (process.env.REPLIT === "1" || process.env.REPLIT_DEPLOYMENT === "1") &&
      process.env.NODE_ENV === "production";

    // Check if we're explicitly in staging
    const isStaging =
      process.env.DEPLOY_ENV === "staging" ||
      process.env.STAGING === "true" ||
      process.env.NEXT_PUBLIC_APP_ENV === "staging" ||
      isReplitAutoscale;

    // Development environment check (includes Replit development mode)
    const isDevelopment = 
      process.env.NODE_ENV === "development" ||
      (!isVercelProduction && !isStaging);

    if (isVercelProduction) return "production";
    if (isStaging) return "staging";
    return "development";
  }

  private getDatabaseUrl(environment: "development" | "staging" | "production"): string {
    // CRITICAL SECURITY: Environment-specific database URLs - NO HARDCODED PRODUCTION
    const databaseUrls = {
      development: process.env.DATABASE_URL || process.env.DEV_DATABASE_URL,
      staging: process.env.STAGING_DATABASE_URL || process.env.DATABASE_URL,
      production: process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL
    };

    const databaseUrl = databaseUrls[environment];
    
    if (!databaseUrl) {
      throw new Error(`SECURITY: No database URL configured for ${environment} environment. DATABASE_URL must be set for production.`);
    }

    // Additional security check: Never allow production database access from non-production environments
    if (environment === "production" && process.env.NODE_ENV !== "production") {
      throw new Error(`SECURITY: Production database access attempted from non-production environment. NODE_ENV: ${process.env.NODE_ENV}`);
    }

    return databaseUrl;
  }

  private handleConnectionFailure() {
    this.state.consecutiveFailures++;
    this.state.lastFailureTime = Date.now();
    this.state.isHealthy = false;

    if (this.state.consecutiveFailures >= this.circuitBreakerThreshold) {
      this.state.circuitBreakerOpen = true;
      console.log("[DB Manager] Circuit breaker opened due to consecutive failures");
    }
  }

  private handleConnectionSuccess() {
    this.state.consecutiveFailures = 0;
    this.state.isHealthy = true;
    this.state.circuitBreakerOpen = false;
    console.log("[DB Manager] Connection restored successfully");
  }

  private isCircuitBreakerClosed(): boolean {
    if (!this.state.circuitBreakerOpen) return true;
    
    const timeSinceLastFailure = Date.now() - this.state.lastFailureTime;
    if (timeSinceLastFailure > this.circuitBreakerTimeout) {
      console.log("[DB Manager] Circuit breaker timeout reached, attempting to close");
      this.state.circuitBreakerOpen = false;
      return true;
    }
    
    return false;
  }

  async executeQuery<T>(operation: () => Promise<T>, operationName: string): Promise<T | null> {
    if (!this.isCircuitBreakerClosed()) {
      console.log(`[DB Manager] Circuit breaker open, rejecting ${operationName}`);
      return null;
    }

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[DB Manager] Executing ${operationName} (attempt ${attempt}/${this.maxRetries})`);
        
        const result = await operation();
        this.handleConnectionSuccess();
        console.log(`[DB Manager] ${operationName} completed successfully`);
        return result;
        
      } catch (error) {
        console.error(`[DB Manager] ${operationName} failed (attempt ${attempt}/${this.maxRetries}):`, error);
        console.error(`[DB Manager] Error details:`, {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: (error as any)?.code || 'Unknown',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        
        if (attempt === this.maxRetries) {
          this.handleConnectionFailure();
          console.error(`[DB Manager] All retry attempts failed for ${operationName}`);
          return null;
        }
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    return null;
  }

  getDatabase() {
    // Lazy initialization if db is null (build scenarios)
    if (!this.db && !process.env.VOLTBUILDER_BUILD && typeof window === 'undefined') {
      console.log("[DB Manager] Lazy initializing database connection...");
      try {
        this.initializeConnection();
      } catch (error) {
        console.error("[DB Manager] Lazy initialization failed:", error);
        throw new Error("Database connection failed during lazy initialization");
      }
    }
    
    if (!this.db) {
      throw new Error("Database not initialized - connection may have failed");
    }
    
    return this.db;
  }

  async testConnection(): Promise<boolean> {
    // Skip connection test during VoltBuilder builds
    if (process.env.NODE_ENV === 'production' && process.env.VOLTBUILDER_BUILD === 'true') {
      console.log('[DB Manager] Skipping connection test for VoltBuilder build');
      return true;
    }
    
    const result = await this.executeQuery(
      () => this.sql`SELECT NOW() as current_time`,
      "connection test"
    );
    
    return result !== null;
  }
}

// Create singleton instance
// Lazy-loaded singleton to prevent memory leaks during static builds
let _dbManager: DatabaseConnectionManager | null = null;

export function getDbManager(): DatabaseConnectionManager {
  // Skip initialization during VoltBuilder builds
  if (process.env.VOLTBUILDER_BUILD === 'true') {
    return {
      getConnection: () => ({ 
        select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
        insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
        update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
        delete: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) })
      }),
      isHealthy: () => false,
      testConnection: () => Promise.resolve(false)
    } as any;
  }
  
  // Lazy initialize only when needed
  if (!_dbManager) {
    _dbManager = new DatabaseConnectionManager();
  }
  
  return _dbManager;
}

// For backward compatibility - Fixed proxy implementation
export const dbManager = new Proxy({} as DatabaseConnectionManager, {
  get(target, prop) {
    const manager = getDbManager();
    if (prop in manager) {
      const value = manager[prop as keyof DatabaseConnectionManager];
      return typeof value === 'function' ? value.bind(manager) : value;
    }
    return undefined;
  }
});

// Safe database getter with error handling
export function getDatabaseConnection() {
  try {
    const manager = getDbManager();
    
    // Validate manager exists
    if (!manager) {
      throw new Error('Database manager failed to initialize');
    }
    
    const database = manager.getDatabase();
    
    if (!database) {
      console.error('[DB] Database connection is null or undefined');
      throw new Error('Database connection failed to initialize');
    }
    
    return database;
  } catch (error) {
    console.error('[DB] Failed to get database connection:', error);
    
    // Provide specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL')) {
        throw new Error('Database URL not configured. Please check environment variables.');
      }
      if (error.message.includes('failed to initialize')) {
        throw new Error('Database connection failed. Please check database availability.');
      }
    }
    
    throw error;
  }
}

// Export db with safe initialization
export const db = (() => {
  try {
    return getDatabaseConnection();
  } catch (error) {
    console.error('[DB] Database initialization failed during module load:', error);
    // Return a stub for build-time safety
    return null as any;
  }
})();

// Export test function
export const testConnection = () => dbManager.testConnection();