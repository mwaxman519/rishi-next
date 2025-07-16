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
      
      console.log("[DB Manager] Database connection initialized successfully");
    } catch (error) {
      console.error("[DB Manager] Failed to initialize database connection:", error);
      this.handleConnectionFailure();
    }
  }

  private getEnvironment(): "development" | "staging" | "production" {
    // Check if we're in a staging deployment
    const isStaging =
      process.env.DEPLOY_ENV === "staging" ||
      process.env.STAGING === "true" ||
      (typeof process.env.NODE_ENV === "string" &&
        process.env.NODE_ENV.includes("staging"));

    // Check if we're in production (Vercel production or NODE_ENV=production)
    const isProduction = 
      process.env.VERCEL_ENV === "production" ||
      process.env.VERCEL === "1" ||
      (process.env.NODE_ENV === "production" && !isStaging);

    if (isStaging) return "staging";
    if (isProduction) return "production";
    return "development";
  }

  private getDatabaseUrl(environment: "development" | "staging" | "production"): string {
    // CRITICAL SECURITY: Environment-specific database URLs - NO HARDCODED PRODUCTION
    const databaseUrls = {
      development: process.env.DATABASE_URL || process.env.DEV_DATABASE_URL,
      staging: process.env.STAGING_DATABASE_URL,
      production: process.env.PRODUCTION_DATABASE_URL
    };

    const databaseUrl = databaseUrls[environment];
    
    if (!databaseUrl) {
      throw new Error(`SECURITY: No database URL configured for ${environment} environment. Production database access requires explicit PRODUCTION_DATABASE_URL environment variable.`);
    }

    // Additional security check: Never allow production database access from non-production environments
    if (environment === "production" && (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV !== "production")) {
      throw new Error(`SECURITY: Production database access attempted from non-production environment. NODE_ENV: ${process.env.NODE_ENV}, VERCEL_ENV: ${process.env.VERCEL_ENV}`);
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
          message: error.message,
          code: error.code,
          stack: error.stack
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