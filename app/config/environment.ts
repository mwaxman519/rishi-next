/**
 * Environment-specific configuration
 * This module provides configuration values based on the current environment (development, staging, production)
 */

// Environment types
export type Environment = &quot;development&quot; | &quot;staging&quot; | &quot;production&quot;;

// Common configuration interface
export interface CommonConfig {
  apiUrl: string;
  eventBusType: &quot;memory&quot; | &quot;azure&quot; | &quot;aws&quot;;
  logLevel: &quot;debug&quot; | &quot;info&quot; | &quot;warn&quot; | &quot;error&quot;;
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
  apiUrl: &quot;http://localhost:3000&quot;,
  eventBusType: &quot;memory&quot;,
  logLevel: &quot;debug&quot;,
  enableCircuitBreakers: false,
  maxRetries: 3,
  corsOrigins: [&quot;http://localhost:3000&quot;, &quot;http://localhost:5000&quot;],

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
  apiUrl: &quot;https://{replit-domain}.repl.co&quot;,
  eventBusType: &quot;memory&quot;, // Still using memory for Replit, but with persistence
  logLevel: &quot;info&quot;,
  enableCircuitBreakers: true,
  maxRetries: 3,
  corsOrigins: [&quot;https://{replit-domain}.repl.co&quot;],

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
  apiUrl: process.env.API_URL || &quot;https://api.example.com&quot;,
  eventBusType: &quot;azure&quot;,
  logLevel: &quot;warn&quot;,
  enableCircuitBreakers: true,
  maxRetries: 5,
  corsOrigins: [&quot;https://example.com&quot;, &quot;https://*.example.com&quot;],

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
  const env = (process.env.NODE_ENV as Environment) || &quot;development&quot;;

  // Direct staging environment detection
  if (env === &quot;staging&quot;) {
    return &quot;staging&quot;;
  }

  if (env === &quot;production&quot;) {
    // Check if we&apos;re in staging (Replit)
    const isReplit = process.env.REPL_ID || process.env.REPL_SLUG;
    return isReplit ? &quot;staging&quot; : &quot;production&quot;;
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
    case &quot;production&quot;:
      return {
        label: &quot;PRODUCTION&quot;,
        color: &quot;#ef4444&quot;, // red-500
        textColor: &quot;#ffffff&quot;,
        show: false, // Hide in production by default
      };
    case &quot;staging&quot;:
      return {
        label: &quot;STAGING&quot;,
        color: &quot;#eab308&quot;, // yellow-500
        textColor: &quot;#000000&quot;,
        show: true,
      };
    case &quot;development&quot;:
    default:
      return {
        label: &quot;DEVELOPMENT&quot;,
        color: &quot;#22c55e&quot;, // green-500
        textColor: &quot;#ffffff&quot;,
        show: true,
      };
  }
}
// Azure Static Web Apps environment configuration
export const isAzureStaticWebApp =
  typeof process !== &quot;undefined&quot; &&
  process.env.AZURE_STATIC_WEB_APPS_API_TOKEN !== undefined;

export const getDatabaseUrl = () => {
  // Always prioritize DATABASE_URL (Vercel standard), fallback to PRODUCTION_DATABASE_URL (Azure)
  const databaseUrl = process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(&quot;SECURITY: DATABASE_URL must be set for database access&quot;);
  }
  return databaseUrl;
};
