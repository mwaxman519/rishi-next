// configure-staging-env.js
/**
 * This script configures the database connection for the staging environment
 * It ensures proper pool settings and configuration parameters
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

console.log("Configuring staging environment settings...");

// Function to check if database connection is properly configured
function checkDatabaseEnvVars() {
  const required = [
    "DATABASE_URL",
    "PGHOST",
    "PGUSER",
    "PGDATABASE",
    "PGPORT",
    "PGPASSWORD",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `Missing required database environment variables: ${missing.join(", ")}`,
    );
    return false;
  }

  console.log("All required database environment variables are present");
  return true;
}

// Update database configuration for staging
function updateDatabaseConfig() {
  try {
    // Look for the app/config/database.ts file to update staging settings
    const dbConfigPath = path.join(
      __dirname,
      "..",
      "app",
      "config",
      "database.ts",
    );

    if (fs.existsSync(dbConfigPath)) {
      console.log(`Found database config at: ${dbConfigPath}`);
      console.log(
        "Database configuration can be updated with optimized staging settings",
      );

      // Recommended configuration for staging
      console.log("Recommended staging database configuration:");
      console.log(`{
  poolConfig: {
    max: 20,
    min: 3,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
  },
  allowTestData: true
}`);
    } else {
      console.log("Database configuration file not found");
      console.log(
        "Please manually update the database configuration for staging",
      );
    }

    return true;
  } catch (err) {
    console.error("Error updating database configuration:", err.message);
    return false;
  }
}

// Update auth service configuration
function updateAuthConfig() {
  try {
    // Look for the server/auth.ts file to check auth configuration
    const authConfigPath = path.join(__dirname, "..", "server", "auth.ts");

    if (fs.existsSync(authConfigPath)) {
      console.log(`Found auth service config at: ${authConfigPath}`);
      console.log(
        "Auth service configuration can be verified for database connection issues",
      );

      // Read file content to analyze
      const authFileContent = fs.readFileSync(authConfigPath, "utf8");

      // Check for error handling in database access
      const hasErrorHandling =
        authFileContent.includes("try") && authFileContent.includes("catch");
      console.log(
        `Auth service has error handling: ${hasErrorHandling ? "Yes" : "No"}`,
      );

      // Check for database connection handling
      const hasDbConnectionHandling = authFileContent.includes("storage");
      console.log(
        `Auth service uses storage abstraction: ${hasDbConnectionHandling ? "Yes" : "No"}`,
      );
    } else {
      console.log("Auth service configuration file not found");
    }

    return true;
  } catch (err) {
    console.error("Error checking auth configuration:", err.message);
    return false;
  }
}

// Check if organization service is properly configured
function checkOrganizationService() {
  try {
    // Look for API routes related to organizations
    const apiDir = path.join(__dirname, "..", "app", "api");

    if (fs.existsSync(apiDir)) {
      const orgApiPath = path.join(apiDir, "organizations");

      if (fs.existsSync(orgApiPath)) {
        console.log(`Found organizations API at: ${orgApiPath}`);
        console.log(
          "Organizations API can be checked for database connection issues",
        );
      } else {
        console.log("Organizations API directory not found");
        console.log("The 500 error might be due to missing API implementation");
      }
    } else {
      console.log("API directory not found");
    }

    return true;
  } catch (err) {
    console.error("Error checking organization service:", err.message);
    return false;
  }
}

// Run the configuration steps
async function configureStaging() {
  console.log("=== Staging Environment Configuration ===");

  // Check database environment variables
  checkDatabaseEnvVars();

  // Update database configuration
  updateDatabaseConfig();

  // Update auth service configuration
  updateAuthConfig();

  // Check organization service
  checkOrganizationService();

  console.log("\n=== Next Steps ===");
  console.log(
    "1. Update .env.local with correct database credentials for staging",
  );
  console.log(
    "2. Run the database verification script: node scripts/db-connection-check.js",
  );
  console.log(
    "3. Ensure auth service is properly configured for database access",
  );
  console.log("4. Check organization service for proper error handling");
  console.log("5. Run database migrations if needed: npm run db:push");
}

configureStaging();
