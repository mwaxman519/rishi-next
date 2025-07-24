/**
 * Environment-specific configuration
 * This module provides configuration values based on the current environment (development, staging, production)
 */

// Environment types
export type Environment = "development" | "staging" | "production";

// Common configuration interface
export interface CommonConfig {
  apiUrl: string;
  eventBusType: "memory" | "azure" | "aws";
  logLevel: "debug" | "info" | "warn" | "error";
  enableCircuitBreakers: boolean;
  maxRetries: number;
  corsOrigins: string[];
}

// Environment-specific configuration
export interface EnvironmentConfig extends CommonConfig {
  // Database
  database: {
    connectionPoolMin: number;
    connectionPoolMax: number;
    statementTimeout: number;
    idleTimeout: number;
  };

  // Caching
  cache: {
    enabled: boolean;
    ttl: number; // Time to live in seconds
  };

  // Event Bus
  eventBus: {
    maxMessageSize: number;
    messageRetentionDays: number;
  };
}

// Development environment configuration
const developmentConfig: EnvironmentConfig = {
  apiUrl: "http://localhost:3000",
  eventBusType: "memory",
  logLevel: "debug",
  enableCircuitBreakers: false,
  maxRetries: 3,
  corsOrigins: ["http://localhost:3000", "http://localhost:5000"],

  database: {
    connectionPoolMin: 1,
    connectionPoolMax: 10,
    statementTimeout: 30000, // 30 seconds
    idleTimeout: 10000, // 10 seconds
  },

  cache: {
    enabled: false,
    ttl: 60,
  },

  eventBus: {
    maxMessageSize: 256, // KB
    messageRetentionDays: 1,
  },
};

// Staging environment configuration
const stagingConfig: EnvironmentConfig = {
  apiUrl: "https://{replit-domain}.repl.co",
  eventBusType: "memory", // Still using memory for Replit, but with persistence
  logLevel: "info",
  enableCircuitBreakers: true,
  maxRetries: 3,
  corsOrigins: ["https://{replit-domain}.repl.co"],

  database: {
    connectionPoolMin: 2,
    connectionPoolMax: 20,
    statementTimeout: 30000, // 30 seconds
    idleTimeout: 30000, // 30 seconds
  },

  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
  },

  eventBus: {
    maxMessageSize: 512, // KB
    messageRetentionDays: 7,
  },
};

// Production environment configuration
const productionConfig: EnvironmentConfig = {
  apiUrl: process.env.API_URL || "https://api.example.com",
  eventBusType: "azure",
  logLevel: "warn",
  enableCircuitBreakers: true,
  maxRetries: 5,
  corsOrigins: ["https://example.com", "https://*.example.com"],

  database: {
    connectionPoolMin: 5,
    connectionPoolMax: 50,
    statementTimeout: 30000, // 30 seconds
    idleTimeout: 60000, // 60 seconds
  },

  cache: {
    enabled: true,
    ttl: 600, // 10 minutes
  },

  eventBus: {
    maxMessageSize: 1024, // KB
    messageRetentionDays: 14,
  },
};

// Map of environment configurations
const configs: Record<Environment, EnvironmentConfig> = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

// Get the current environment
export function getCurrentEnvironment(): Environment {
  const env = (process.env.NODE_ENV as Environment) || "development";

  // Direct staging environment detection
  if (env === "staging") {
    return "staging";
  }

  if (env === "production") {
    // Check if we're in staging (Replit)
    const isReplit = process.env.REPL_ID || process.env.REPL_SLUG;
    return isReplit ? "staging" : "production";
  }

  return env;
}

// Get the configuration for the current environment
export function getConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment();
  return configs[env];
}

// Export a singleton instance of the configuration
export const config = getConfig();

// Environment indicator information for UI display
export interface EnvironmentIndicator {
  label: string;
  color: string;
  textColor: string;
  show: boolean;
}

/**
 * Get environment indicator information for displaying in the UI
 * This helps users identify which environment they are currently using
 */
export function getEnvironmentIndicator(): EnvironmentIndicator {
  const env = getCurrentEnvironment();

  switch (env) {
    case "production":
      return {
        label: "PRODUCTION",
        color: "#ef4444", // red-500
        textColor: "#ffffff",
        show: false, // Hide in production by default
      };
    case "staging":
      return {
        label: "STAGING",
        color: "#eab308", // yellow-500
        textColor: "#000000",
        show: true,
      };
    case "development":
    default:
      return {
        label: "DEVELOPMENT",
        color: "#22c55e", // green-500
        textColor: "#ffffff",
        show: true,
      };
  }
}
// Azure Static Web Apps environment configuration
export const isAzureStaticWebApp =
  typeof process !== "undefined" &&
  process.env.AZURE_STATIC_WEB_APPS_API_TOKEN !== undefined;

export const getDatabaseUrl = () => {
  if (isAzureStaticWebApp) {
    return process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;
  }
  return process.env.DATABASE_URL;
};
