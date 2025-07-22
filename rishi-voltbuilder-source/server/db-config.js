/**
 * Database Configuration for Neon Serverless Postgres
 *
 * This module provides a robust database connection configuration that:
 * 1. Detects the environment (Replit, production, or development)
 * 2. Verifies that DATABASE_URL environment variable is set
 * 3. Configures connection pooling and retry logic
 * 4. Handles Neon's serverless connections efficiently
 * 5. Implements proper connection error handling
 */

// Default configurations for different environments
const connectionConfigs = {
  production: {
    poolSize: 10,
    connectionTimeout: 60000, // 60 seconds
    statementTimeout: 30000, // 30 seconds
    idleTimeout: 60000, // 60 seconds
    maxRetries: 5,
    retryDelay: 1000, // 1 second
  },
  replit: {
    poolSize: 5,
    connectionTimeout: 45000, // 45 seconds
    statementTimeout: 30000, // 30 seconds
    idleTimeout: 60000, // 60 seconds
    maxRetries: 5,
    retryDelay: 1000, // 1 second
  },
  development: {
    poolSize: 5,
    connectionTimeout: 30000, // 30 seconds
    statementTimeout: 30000, // 30 seconds
    idleTimeout: 60000, // 60 seconds
    maxRetries: 3,
    retryDelay: 500, // 0.5 seconds
  },
};

// Function to detect Replit environment
function isReplitEnvironment() {
  return (
    process.env.REPL_ID !== undefined && process.env.REPL_OWNER !== undefined
  );
}

// Select the appropriate environment and configuration
function detectEnvironment() {
  if (isReplitEnvironment()) {
    console.log("Detected Replit environment");
    return "replit";
  }

  return process.env.NODE_ENV || "development";
}

// Set environment and get config based on detected environment
const environment = detectEnvironment();
const config = connectionConfigs[environment] || connectionConfigs.development;

// Get the database URL from environment variables
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error("DATABASE_URL environment variable is not set");
    throw new Error(`DATABASE_URL must be set in all environments - no fallback allowed`);
  }

  // For Replit environment, log confirmation but not the URL itself (for security)
  if (environment === "replit") {
    console.log("Using Replit-provided DATABASE_URL");
  }

  return url;
}

// Verify database URL format
function verifyDatabaseUrl(url) {
  try {
    // Basic URL format check
    if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
      throw new Error(
        "DATABASE_URL must start with postgres:// or postgresql://",
      );
    }

    // Verify we have all required parts
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname) {
      throw new Error("DATABASE_URL missing hostname");
    }

    // Skip credential warnings for Replit environment since they're auto-generated
    if (environment !== "replit") {
      // Warn about using default credentials
      if (
        parsedUrl.username === "default" ||
        parsedUrl.password === "default"
      ) {
        console.warn(
          "DATABASE_URL contains default credentials, this is not secure for production",
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Invalid DATABASE_URL:", error.message);
    throw error;
  }
}

// Get final database configuration with URL
function getDatabaseConfig() {
  const url = getDatabaseUrl();
  verifyDatabaseUrl(url);

  console.log(`Database configured for ${environment} environment`);

  return {
    url,
    ...config,
    isReplit: environment === "replit",
  };
}

// Export named functions for both CommonJS and ES modules compatibility
module.exports = {
  getDatabaseConfig,
  verifyDatabaseUrl,
  environment,
};

// Add explicit exports for ES modules compatibility
export { getDatabaseConfig, verifyDatabaseUrl, environment };
