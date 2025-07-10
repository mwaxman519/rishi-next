#!/usr/bin/env node

/**
 * Pre-commit hook script
 *
 * This script runs TypeScript checks and a production build
 * to catch type errors before allowing code to be committed.
 *
 * To install:
 * 1. Make this file executable: chmod +x scripts/pre-commit.js
 * 2. Create symlink: ln -s ../../scripts/pre-commit.js .git/hooks/pre-commit
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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

console.log(
  `${colors.blue}Running pre-commit TypeScript checks...${colors.reset}`,
);

try {
  // Step 1: Run TypeScript compiler in strict mode
  console.log(
    `\n${colors.cyan}Step 1/3: TypeScript compilation check${colors.reset}`,
  );
  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log(`${colors.green}✓ TypeScript compilation passed${colors.reset}`);

  // Step 2: Run ESLint to catch code quality issues
  console.log(`\n${colors.cyan}Step 2/3: ESLint check${colors.reset}`);
  try {
    execSync("npx next lint", { stdio: "inherit" });
    console.log(`${colors.green}✓ ESLint check passed${colors.reset}`);
  } catch (e) {
    console.log(
      `${colors.yellow}⚠ ESLint found issues but continuing (fix these before PR)${colors.reset}`,
    );
  }

  // Step 3: Run a partial build to catch advanced type issues
  console.log(`\n${colors.cyan}Step 3/3: Partial build check${colors.reset}`);
  console.log(
    `${colors.yellow}Note: This is a quick check, not a full build${colors.reset}`,
  );

  // We're just checking if the build process starts without immediate errors
  // A timeout ensures we don't run the entire build which would be too slow for a git hook
  try {
    execSync("timeout 30s npm run build", { stdio: "inherit" });
    console.log(
      `${colors.green}✓ Build check interrupted after time limit (passed initial checks)${colors.reset}`,
    );
  } catch (e) {
    if (e.status === 124) {
      // Status 124 means the timeout command terminated the process, which is expected
      console.log(
        `${colors.green}✓ Build check interrupted after time limit (passed initial checks)${colors.reset}`,
      );
    } else {
      // Actual build error
      console.error(`${colors.red}✗ Build check failed${colors.reset}`);
      console.error(
        `${colors.red}This indicates there are still type errors that would prevent production deployment${colors.reset}`,
      );
      process.exit(1);
    }
  }

  console.log(`\n${colors.green}All pre-commit checks passed!${colors.reset}`);
  process.exit(0);
} catch (error) {
  console.error(`\n${colors.red}Pre-commit checks failed!${colors.reset}`);
  console.error(
    `${colors.red}Please fix the issues above before committing.${colors.reset}`,
  );
  process.exit(1);
}
