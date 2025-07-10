#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * Based on lessons learned from Azure deployment failures
 */

import fs from "fs";
import { execSync } from "child_process";

function log(message) {
  console.log(`[Pre-Deploy Validation] ${message}`);
}

function validateFileCount() {
  log("Validating file count limits...");

  try {
    const tsFiles = execSync(
      "find . -name '*.ts' -o -name '*.tsx' | grep -v node_modules | wc -l",
      { encoding: "utf8" },
    );
    const fileCount = parseInt(tsFiles.trim());

    log(`Current TypeScript files: ${fileCount}`);

    if (fileCount > 1000) {
      console.error(
        `ERROR: Too many TypeScript files (${fileCount}). Azure SWA limit exceeded.`,
      );
      console.error(
        "Run cleanup script to reduce file count before deployment.",
      );
      process.exit(1);
    }

    log(`✅ File count validation passed (${fileCount}/1000)`);
  } catch (error) {
    console.error("File count validation failed:", error.message);
    process.exit(1);
  }
}

function validateBuildConfiguration() {
  log("Validating build configuration...");

  // Check next.config.mjs exists
  if (!fs.existsSync("next.config.mjs")) {
    console.error("ERROR: next.config.mjs not found");
    process.exit(1);
  }

  // Check staticwebapp.config.json exists
  if (!fs.existsSync("staticwebapp.config.json")) {
    console.error("ERROR: staticwebapp.config.json not found");
    process.exit(1);
  }

  log("✅ Build configuration files present");
}

function validateEnvironmentVariables() {
  log("Validating environment variables...");

  // For local validation, we'll skip env var checks since they'll be set in Azure
  if (process.env.NODE_ENV !== "production") {
    log("⚠️  Local environment - skipping env var validation");
    log("Environment variables will be validated in Azure deployment");
    return;
  }

  const requiredVars = ["DATABASE_URL", "NEXTAUTH_SECRET"];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("Missing required environment variables:");
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error("Set these variables before deployment.");
    process.exit(1);
  }

  log("✅ Environment variables validation passed");
}

function cleanBuildArtifacts() {
  log("Cleaning build artifacts...");

  try {
    // Remove build artifacts that cause module bloat
    const dirsToClean = [".next", "out", "node_modules/.cache"];

    dirsToClean.forEach((dir) => {
      if (fs.existsSync(dir)) {
        execSync(`rm -rf ${dir}`);
        log(`Cleaned ${dir}`);
      }
    });

    log("✅ Build artifacts cleaned");
  } catch (error) {
    console.error("Build cleanup failed:", error.message);
    process.exit(1);
  }
}

function validatePostCSSConfig() {
  log("Validating PostCSS configuration...");

  // Remove conflicting PostCSS configs
  const conflictingConfigs = ["postcss.config.js", "postcss.config.cjs"];

  conflictingConfigs.forEach((config) => {
    if (fs.existsSync(config)) {
      fs.unlinkSync(config);
      log(`Removed conflicting ${config}`);
    }
  });

  // Ensure clean PostCSS config exists
  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

  fs.writeFileSync("postcss.config.mjs", postcssConfig);
  log("✅ PostCSS configuration validated");
}

function main() {
  log("Starting pre-deployment validation...");

  try {
    validateFileCount();
    validateBuildConfiguration();
    validateEnvironmentVariables();
    cleanBuildArtifacts();
    validatePostCSSConfig();

    log("🚀 Pre-deployment validation completed successfully!");
    log("Ready for Azure Static Web Apps deployment");
  } catch (error) {
    console.error("Pre-deployment validation failed:", error);
    process.exit(1);
  }
}

main();
