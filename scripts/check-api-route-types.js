#!/usr/bin/env node

/**
 * API Route TypeScript Check Tool
 *
 * This script scans all API route files and verifies they follow the correct TypeScript patterns:
 * 1. Using context: { params: { id: string } } pattern for dynamic routes
 * 2. Having explicit Promise<NextResponse> return types
 * 3. Accessing params via context.params instead of destructured params
 *
 * Usage: node scripts/check-api-route-types.js
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output formatting
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Regex patterns for checking API files
const patterns = {
  destructuredParams: /\{\s*params\s*\}\s*:/,
  contextParams: /context\s*:\s*\{\s*params\s*:/,
  explicitReturnType: /\)(?:\s*|\n*):\s*Promise<NextResponse>/,
  accessViaDestructured: /params\.(\w+)/,
  accessViaContext: /context\.params\.(\w+)/,
};

// Keep track of issues
const issues = {
  missingExplicitReturnType: [],
  usingDestructuredParams: [],
  accessingViaDestructured: [],
  fileCount: 0,
  errorCount: 0,
  routeCount: 0,
  handlerCount: 0,
};

/**
 * Logs a message with color
 */
function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Scans a directory recursively for API route files
 */
function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (
        entry.name === "route.ts" ||
        entry.name === "route.js" ||
        entry.name === "route.tsx"
      ) {
        checkRouteFile(fullPath);
      }
    }
  } catch (error) {
    log(`Error scanning directory ${dir}: ${error.message}`, "red");
  }
}

/**
 * Checks a single route file for TypeScript pattern compliance
 */
function checkRouteFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    issues.fileCount++;

    // Define API handlers to check for
    const handlers = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    let fileHasIssues = false;

    handlers.forEach((handler) => {
      // Check if this file has this handler
      const handlerRegex = new RegExp(
        `export\\s+async\\s+function\\s+${handler}\\s*\\(`,
        "g",
      );
      const matches = content.match(handlerRegex);

      if (matches) {
        matches.forEach(() => {
          issues.handlerCount++;

          // Extract the handler function code
          const startIndex = content.indexOf(
            `export async function ${handler}`,
          );
          if (startIndex === -1) return;

          let braceCount = 0;
          let endIndex = startIndex;
          let started = false;

          // Find the end of the function by balancing braces
          for (let i = startIndex; i < content.length; i++) {
            if (content[i] === "{") {
              started = true;
              braceCount++;
            } else if (content[i] === "}") {
              braceCount--;
              if (started && braceCount === 0) {
                endIndex = i + 1;
                break;
              }
            }
          }

          const handlerCode = content.substring(startIndex, endIndex);

          // Check for issues
          if (!patterns.explicitReturnType.test(handlerCode)) {
            issues.missingExplicitReturnType.push(`${filePath} (${handler})`);
            fileHasIssues = true;
            issues.errorCount++;
          }

          if (
            patterns.destructuredParams.test(handlerCode) &&
            !patterns.contextParams.test(handlerCode)
          ) {
            issues.usingDestructuredParams.push(`${filePath} (${handler})`);
            fileHasIssues = true;
            issues.errorCount++;
          }

          if (
            patterns.accessViaDestructured.test(handlerCode) &&
            !patterns.accessViaContext.test(handlerCode)
          ) {
            issues.accessingViaDestructured.push(`${filePath} (${handler})`);
            fileHasIssues = true;
            issues.errorCount++;
          }
        });
      }
    });

    if (fileHasIssues) {
      issues.routeCount++;
    }
  } catch (error) {
    log(`Error checking file ${filePath}: ${error.message}`, "red");
  }
}

/**
 * Prints summary of findings
 */
function printSummary() {
  log("\n========== API Route TypeScript Check Summary ==========", "cyan");
  log(`Scanned ${issues.fileCount} API route files`, "blue");
  log(`Found ${issues.handlerCount} API route handlers`, "blue");

  if (issues.errorCount === 0) {
    log(
      "✅ All API routes follow the recommended TypeScript patterns",
      "green",
    );
  } else {
    log(
      `❌ Found ${issues.errorCount} issues in ${issues.routeCount} route files`,
      "red",
    );

    if (issues.missingExplicitReturnType.length > 0) {
      log("\nMissing explicit Promise<NextResponse> return type:", "yellow");
      issues.missingExplicitReturnType.forEach((file) =>
        log(`  - ${file}`, "red"),
      );
    }

    if (issues.usingDestructuredParams.length > 0) {
      log(
        "\nUsing destructured { params } pattern (use context: { params } instead):",
        "yellow",
      );
      issues.usingDestructuredParams.forEach((file) =>
        log(`  - ${file}`, "red"),
      );
    }

    if (issues.accessingViaDestructured.length > 0) {
      log(
        "\nAccessing params directly (use context.params instead):",
        "yellow",
      );
      issues.accessingViaDestructured.forEach((file) =>
        log(`  - ${file}`, "red"),
      );
    }

    log(
      "\nPlease follow the guidelines in Docs/API-TypeScript-Guidelines.md",
      "magenta",
    );
  }

  log("======================================================", "cyan");
}

// Main execution
log("🔍 Scanning API route files for TypeScript pattern issues...", "cyan");
scanDirectory("./app/api");
printSummary();

// Exit with proper code
process.exit(issues.errorCount > 0 ? 1 : 0);
