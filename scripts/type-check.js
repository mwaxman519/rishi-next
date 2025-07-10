#!/usr/bin/env node

/**
 * TypeScript Check Script
 *
 * This script runs the TypeScript compiler in strict mode to check for type errors.
 * It's intended to be run as part of the development process or in CI/CD pipelines.
 */

const { execSync } = require("child_process");
const chalk = require("chalk") || {
  green: (s) => s,
  red: (s) => s,
  yellow: (s) => s,
  blue: (s) => s,
};

console.log(chalk.blue("Running TypeScript type check..."));

try {
  // Run TypeScript compiler in noEmit mode
  execSync("npx tsc --noEmit", { stdio: "inherit" });

  console.log(chalk.green("✓ TypeScript check passed!"));
  process.exit(0);
} catch (error) {
  console.error(chalk.red("✗ TypeScript check failed."));
  console.error(
    chalk.yellow("Fix the type errors above before committing or building."),
  );
  process.exit(1);
}
