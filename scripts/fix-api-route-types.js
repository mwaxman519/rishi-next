#!/usr/bin/env node

/**
 * API Route TypeScript Fix Tool
 *
 * This script automatically fixes TypeScript pattern issues in API route files:
 * 1. Adds explicit Promise<NextResponse> return types
 * 2. Converts destructured params to context.params pattern
 * 3. Updates params access to use context.params
 *
 * Usage: node scripts/fix-api-route-types.js
 */

import fs from "fs";
import path from "path";
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

// Regex patterns for checking and fixing API files
const patterns = {
  findHandler:
    /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*([^)]*)\)(?:\s*:\s*[^{]+)?\s*(\{\s*)/g,
  hasExplicitReturnType: /\)(?:\s*|\n*):\s*Promise<NextResponse>\s*\{/g,
  hasDestructuredParams: /\{\s*params\s*\}\s*:/g,
  accessViaParams: /params\.(\w+)/g,
};

// Keep track of changes
const changes = {
  addedReturnType: [],
  convertedParamsPattern: [],
  changedParamsAccess: [],
  fileCount: 0,
  changedFileCount: 0,
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
        fixRouteFile(fullPath);
      }
    }
  } catch (error) {
    log(`Error scanning directory ${dir}: ${error.message}`, "red");
  }
}

/**
 * Fixes TypeScript issues in a single route file
 */
function fixRouteFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let originalContent = content;
    changes.fileCount++;

    // Add explicit return types and fix params pattern
    content = content.replace(
      patterns.findHandler,
      (match, method, params, opening) => {
        let newParams = params;
        let madeChanges = false;

        // Add explicit return type if missing
        if (!match.includes("Promise<NextResponse>")) {
          changes.addedReturnType.push(`${filePath} (${method})`);
          madeChanges = true;
        }

        // Convert destructured params to context pattern
        if (params.includes("{ params }") || params.includes("{params}")) {
          newParams = params.replace(
            /\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*([^\}]*)\}\s*\}/,
            "context: { params: { $1 } }",
          );

          if (newParams === params) {
            // Try another pattern
            newParams = params.replace(/\{\s*params\s*\}\s*:/, "context:");
          }

          changes.convertedParamsPattern.push(`${filePath} (${method})`);
          madeChanges = true;
        }

        return `export async function ${method}(${newParams}): Promise<NextResponse> ${opening}`;
      },
    );

    // Fix accessing params directly
    const hasContextParams = content.includes("context.params");
    if (hasContextParams && patterns.accessViaParams.test(content)) {
      content = content.replace(patterns.accessViaParams, "context.params.$1");
      changes.changedParamsAccess.push(filePath);
    }

    // Save changes if the file was modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      changes.changedFileCount++;
    }
  } catch (error) {
    log(`Error fixing file ${filePath}: ${error.message}`, "red");
  }
}

/**
 * Prints summary of changes made
 */
function printSummary() {
  log("\n========== API Route TypeScript Fix Summary ==========", "cyan");
  log(`Scanned ${changes.fileCount} API route files`, "blue");

  if (changes.changedFileCount === 0) {
    log(
      "✅ No changes needed - all files already follow the correct pattern",
      "green",
    );
  } else {
    log(`✅ Fixed issues in ${changes.changedFileCount} files:`, "green");

    if (changes.addedReturnType.length > 0) {
      log("\nAdded explicit Promise<NextResponse> return type to:", "yellow");
      changes.addedReturnType.forEach((file) => log(`  - ${file}`, "green"));
    }

    if (changes.convertedParamsPattern.length > 0) {
      log("\nConverted { params } to context.params pattern in:", "yellow");
      changes.convertedParamsPattern.forEach((file) =>
        log(`  - ${file}`, "green"),
      );
    }

    if (changes.changedParamsAccess.length > 0) {
      log("\nUpdated params access to use context.params in:", "yellow");
      changes.changedParamsAccess.forEach((file) =>
        log(`  - ${file}`, "green"),
      );
    }
  }

  log(
    "\nPlease review the changes and run check-api-route-types.js to verify",
    "magenta",
  );
  log("======================================================", "cyan");
}

// Main execution
log("🔧 Fixing API route TypeScript pattern issues...", "cyan");
scanDirectory("./app/api");
printSummary();
