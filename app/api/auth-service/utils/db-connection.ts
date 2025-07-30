/**
 * Robust Database Connection Handler for Authentication Service
 * Implements circuit breaker pattern and connection pooling
 */

import { neon } from &quot;@neondatabase/serverless&quot;;
import { drizzle } from &quot;drizzle-orm/neon-http&quot;;
import * as schema from &quot;@shared/schema&quot;;

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
      console.log(&quot;[DB Manager] Initializing database connection...&quot;);
      
      // Environment detection
      const environment = this.getEnvironment();
      console.log(&quot;[DB Manager] Environment detection:&quot;, {
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
        throw new Error(&quot;Database connection failed to initialize&quot;);
      }
      
      console.log(&quot;[DB Manager] Database connection initialized successfully&quot;);
      this.handleConnectionSuccess();
    } catch (error) {
      console.error(&quot;[DB Manager] Failed to initialize database connection:&quot;, error);
      this.handleConnectionFailure();
      // Re-throw to prevent undefined database usage
      throw error;
    }
  }

  private getEnvironment(): &quot;development&quot; | &quot;staging&quot; | &quot;production&quot; {
    // CRITICAL ENVIRONMENT DETECTION FIX
    // VERCEL = PRODUCTION, REPLIT AUTOSCALE = STAGING, REPLIT DEVELOPMENT = DEVELOPMENT
    
    // Check if we&apos;re in Vercel production (PRODUCTION environment)
    const isVercelProduction = 
      process.env.VERCEL_ENV === &quot;production&quot; ||
      process.env.VERCEL === &quot;1&quot;;

    // Check if we&apos;re in Replit Autoscale deployment (STAGING environment)
    // Only consider it staging if it&apos;s actually a deployment, not development
    const isReplitAutoscale = 
      (process.env.REPLIT === &quot;1&quot; || process.env.REPLIT_DEPLOYMENT === &quot;1&quot;) &&
      process.env.NODE_ENV === &quot;production&quot;;

    // Check if we&apos;re explicitly in staging
    const isStaging =
      process.env.DEPLOY_ENV === &quot;staging&quot; ||
      process.env.STAGING === &quot;true&quot; ||
      process.env.NEXT_PUBLIC_APP_ENV === &quot;staging&quot; ||
      isReplitAutoscale;

    // Development environment check (includes Replit development mode)
    const isDevelopment = 
      process.env.NODE_ENV === &quot;development&quot; ||
      (!isVercelProduction && !isStaging);

    if (isVercelProduction) return &quot;production&quot;;
    if (isStaging) return &quot;staging&quot;;
    return &quot;development&quot;;
  }

  private getDatabaseUrl(environment: &quot;development&quot; | &quot;staging&quot; | &quot;production&quot;): string {
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
    if (environment === &quot;production&quot; && process.env.NODE_ENV !== &quot;production&quot;) {
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
      console.log(&quot;[DB Manager] Circuit breaker opened due to consecutive failures&quot;);
    }
  }

  private handleConnectionSuccess() {
    this.state.consecutiveFailures = 0;
    this.state.isHealthy = true;
    this.state.circuitBreakerOpen = false;
    console.log(&quot;[DB Manager] Connection restored successfully&quot;);
  }

  private isCircuitBreakerClosed(): boolean {
    if (!this.state.circuitBreakerOpen) return true;
    
    const timeSinceLastFailure = Date.now() - this.state.lastFailureTime;
    if (timeSinceLastFailure > this.circuitBreakerTimeout) {
      console.log(&quot;[DB Manager] Circuit breaker timeout reached, attempting to close&quot;);
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
      &quot;connection test&quot;
    );
    
    return result !== null;
  }
}

// Create singleton instance
export const dbManager = new DatabaseConnectionManager();
export const db = dbManager.getDatabase();

// Export test function
export const testConnection = () => dbManager.testConnection();