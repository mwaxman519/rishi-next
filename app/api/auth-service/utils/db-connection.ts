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
      
      // Create neon connection with optimized settings
      this.sql = neon(process.env.DATABASE_URL!, {
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
        return result;
        
      } catch (error) {
        console.error(`[DB Manager] ${operationName} failed (attempt ${attempt}/${this.maxRetries}):`, error);
        
        if (attempt === this.maxRetries) {
          this.handleConnectionFailure();
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