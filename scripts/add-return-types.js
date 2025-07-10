#!/usr/bin/env node

/**
 * Add Return Types to API Route Handlers
 *
 * This specific script focuses on adding Promise<NextResponse> return types
 * to all API route handlers that are missing them.
 *
 * Usage: node scripts/add-return-types.js
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

// Log modified files
const modifiedFiles = [];

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
        addReturnTypes(fullPath);
      }
    }
  } catch (error) {
    log(`Error scanning directory ${dir}: ${error.message}`, "red");
  }
}

/**
 * Adds return types to API route handlers
 */
function addReturnTypes(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Find all API route handlers
    const handlers = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    let newContent = content;

    // Replace each handler function declaration
    handlers.forEach((handler) => {
      const regex = new RegExp(
        `export\\s+async\\s+function\\s+${handler}\\s*\\([^)]*\\)\\s*\\{`,
        "g",
      );
      const matches = content.match(regex);

      if (matches) {
        matches.forEach((match) => {
          // Only replace if no return type exists
          if (!match.includes("Promise<NextResponse>")) {
            const replacement = match.replace(
              /\)\s*\{/,
              "): Promise<NextResponse> {",
            );
            newContent = newContent.replace(match, replacement);
            modified = true;
          }
        });
      }
    });

    // Save changes if modified
    if (modified) {
      fs.writeFileSync(filePath, newContent, "utf8");
      modifiedFiles.push(filePath);
    }
  } catch (error) {
    log(`Error processing file ${filePath}: ${error.message}`, "red");
  }
}

// Main execution
log("Adding Promise<NextResponse> return types to API routes...", "cyan");
scanDirectory("./app/api");

// Print summary
if (modifiedFiles.length > 0) {
  log(`\nAdded return types to ${modifiedFiles.length} files:`, "green");
  modifiedFiles.forEach((file) => {
    log(`  - ${file}`, "green");
  });
} else {
  log("\nNo files needed modification.", "blue");
}

log("\nDone!", "cyan");
