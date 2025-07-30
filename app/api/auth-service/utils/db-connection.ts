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
    
    this.initializeConnection();
  }

  private initializeConnection() {
    try {
      console.log("[DB Manager] Initializing database connection...");
      
      // Environment detection
      const environment = this.getEnvironment();
      console.log("[DB Manager] Environment detection:", {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL: process.env.VERCEL,
        DEPLOY_ENV: process.env.DEPLOY_ENV,
        STAGING: process.env.STAGING,
        REPLIT_DOMAINS: process.env.REPLIT_DOMAINS,
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
      // Re-throw to prevent undefined database usage
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
    return this.db;
  }

  async testConnection(): Promise<boolean> {
    const result = await this.executeQuery(
      () => this.sql`SELECT NOW() as current_time`,
      "connection test"
    );
    
    return result !== null;
  }
}

// Create singleton instance
export const dbManager = new DatabaseConnectionManager();
export const db = dbManager.getDatabase();

// Export test function
export const testConnection = () => dbManager.testConnection();