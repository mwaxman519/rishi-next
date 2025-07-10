#!/usr/bin/env node

/**
 * Azure Static Web Apps Deployment Script
 *
 * This script prepares our application for deployment to Azure Static Web Apps
 * by handling environment-specific configuration and data preparation.
 *
 * Features:
 * - Sets production environment variables
 * - Runs database sanitization
 * - Builds the application for production
 * - Generates Azure deployment files
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import readline from "readline";

// Configuration
const AZURE_CONFIG_DIR = path.join(process.cwd(), ".azure");
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-");

// Initialize readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Logger with colored output
function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m%s\x1b[0m", // Cyan
    success: "\x1b[32m%s\x1b[0m", // Green
    warning: "\x1b[33m%s\x1b[0m", // Yellow
    error: "\x1b[31m%s\x1b[0m", // Red
  };

  const prefix = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  console.log(colors[type] || colors.info, `${prefix[type] || ""} ${message}`);
}

// Prompt for confirmation
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (yes/no): `, (answer) => {
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

// Check for required environment variables
function checkEnvironment() {
  log("Checking environment variables...", "info");

  const requiredVars = ["PRODUCTION_DATABASE_URL", "NEXT_PUBLIC_APP_ENV"];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    log(
      `Missing required environment variables: ${missingVars.join(", ")}`,
      "error",
    );
    log("These must be set before deploying to Azure.", "error");
    return false;
  }

  if (process.env.NEXT_PUBLIC_APP_ENV !== "production") {
    log(
      `NEXT_PUBLIC_APP_ENV is set to "${process.env.NEXT_PUBLIC_APP_ENV}" instead of "production"`,
      "warning",
    );
    log('This should be set to "production" for Azure deployment.', "warning");
    return false;
  }

  log("Environment variables validated", "success");
  return true;
}

// Run data sanitization
async function sanitizeData() {
  log("Preparing to sanitize test data...", "info");

  const shouldSanitize = await prompt(
    "Do you want to run the data sanitization tool?",
  );

  if (!shouldSanitize) {
    log("Skipping data sanitization.", "warning");
    return true;
  }

  try {
    log("Running data sanitization...", "info");
    execSync("node scripts/data-sanitizer.js", { stdio: "inherit" });
    log("Data sanitization completed", "success");
    return true;
  } catch (error) {
    log(`Data sanitization failed: ${error.message}`, "error");
    return false;
  }
}

// Build the application
function buildApp() {
  log("Building application for production...", "info");

  try {
    execSync("NODE_ENV=production npm run build", { stdio: "inherit" });
    log("Application built successfully", "success");
    return true;
  } catch (error) {
    log(`Build failed: ${error.message}`, "error");
    return false;
  }
}

// Generate Azure deployment files
function generateAzureFiles() {
  log("Generating Azure Static Web Apps configuration...", "info");

  // Create .azure directory if it doesn't exist
  if (!fs.existsSync(AZURE_CONFIG_DIR)) {
    fs.mkdirSync(AZURE_CONFIG_DIR, { recursive: true });
  }

  // Generate or update staticwebapp.config.json
  const staticWebAppConfig = {
    navigationFallback: {
      rewrite: "/index.html",
      exclude: ["/images/*.{png,jpg,gif}", "/css/*", "/assets/*"],
    },
    routes: [
      {
        route: "/api/*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedRoles: ["authenticated"],
      },
      {
        route: "/admin/*",
        methods: ["GET"],
        allowedRoles: ["admin"],
      },
      {
        route: "/*",
        serve: "/index.html",
        statusCode: 200,
      },
    ],
    responseOverrides: {
      404: {
        rewrite: "/404.html",
      },
    },
    globalHeaders: {
      "content-security-policy":
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; object-src 'none'",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
    },
    mimeTypes: {
      ".json": "application/json",
      ".css": "text/css",
      ".js": "text/javascript",
      ".svg": "image/svg+xml",
    },
  };

  fs.writeFileSync(
    path.join(AZURE_CONFIG_DIR, "staticwebapp.config.json"),
    JSON.stringify(staticWebAppConfig, null, 2),
  );

  // Create deployment instructions
  const deploymentInstructions = `
# Azure Static Web Apps Deployment

Deployment timestamp: ${new Date().toISOString()}

## Manual Deployment Steps

1. Push your changes to the main branch of your Azure-connected repository
2. Azure will automatically deploy the new version

## Post-Deployment Verification

1. Check that the application loads correctly
2. Verify that API endpoints are working
3. Confirm that no test data is visible

## Rollback Procedure

If issues occur, roll back using the Azure portal:
1. Go to your Static Web App in the Azure Portal
2. Navigate to the "Deployments" tab
3. Select a previous successful deployment
4. Click "Redeploy"
`;

  fs.writeFileSync(
    path.join(AZURE_CONFIG_DIR, "deployment-instructions.md"),
    deploymentInstructions,
  );

  log("Azure configuration files generated", "success");
  log(`Files created in ${AZURE_CONFIG_DIR}`, "info");
  return true;
}

// Main function
async function main() {
  log("🚀 Azure Deployment Preparation Tool", "info");

  try {
    // Environment check
    if (!checkEnvironment()) {
      log(
        "Environment check failed, please fix the issues before continuing",
        "error",
      );
      process.exit(1);
    }

    // Sanitize data
    if (!(await sanitizeData())) {
      const shouldContinue = await prompt(
        "Data sanitization had issues. Continue anyway?",
      );
      if (!shouldContinue) {
        log("Deployment preparation canceled", "warning");
        process.exit(0);
      }
    }

    // Build the app
    if (!buildApp()) {
      log("Build failed, deployment cannot continue", "error");
      process.exit(1);
    }

    // Generate Azure files
    if (!generateAzureFiles()) {
      log("Failed to generate Azure configuration files", "error");
      process.exit(1);
    }

    log("Deployment preparation completed successfully!", "success");
    log(
      "Your application is ready to be deployed to Azure Static Web Apps.",
      "success",
    );
    log(
      "Follow the instructions in .azure/deployment-instructions.md to complete the deployment.",
      "info",
    );
  } catch (error) {
    log(`Deployment preparation failed: ${error.message}`, "error");
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main().catch((error) => {
  log(`Script error: ${error.message}`, "error");
  process.exit(1);
});
