/**
 * Database Commands Runner
 *
 * This script provides a simple interface to run the various database commands
 * without having to remember all the different script paths and arguments.
 *
 * Usage:
 *   node scripts/run-db-commands.js <command> [environment]
 *
 * Commands:
 *   migrate     - Run database migrations
 *   seed        - Seed the database with test data
 *   validate    - Run validation checks on the database
 *   sanitize    - Check for test data (dry run)
 *   clean       - Remove test data (dangerous, use with caution)
 *   deploy      - Run deployment process
 *
 * Environments:
 *   development (default)
 *   staging
 *   production
 */

const { exec } = require("child_process");
const { promisify } = require("util");
const execPromise = promisify(exec);

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];
const env = args[1] || "development";
const options = args.slice(2);

// Validation
const validCommands = [
  "migrate",
  "seed",
  "validate",
  "sanitize",
  "clean",
  "deploy",
];
const validEnvironments = ["development", "staging", "production"];

if (!validCommands.includes(command)) {
  console.error(`Invalid command: ${command}`);
  console.error("Valid commands:", validCommands.join(", "));
  process.exit(1);
}

if (!validEnvironments.includes(env)) {
  console.error(`Invalid environment: ${env}`);
  console.error("Valid environments:", validEnvironments.join(", "));
  process.exit(1);
}

// Command mapping
const commands = {
  migrate: `node scripts/db-migrate.js ${env}`,
  seed: `node scripts/seed-data.js ${env}`,
  validate: `node scripts/validate-deployment.js ${env}`,
  sanitize: `node scripts/data-sanitizer.js ${env} --dry-run`,
  clean: `node scripts/data-sanitizer.js ${env} --execute`,
  deploy: `node scripts/deploy.js ${env}`,
};

// Special warnings for dangerous commands
if (command === "clean" && env === "production") {
  console.warn(
    "⚠️ WARNING: You are about to clean test data from the PRODUCTION environment!",
  );
  console.warn(
    "This is a destructive operation and should only be done if you are sure.",
  );
  console.warn("To proceed, run again with the --force option:");
  console.warn(`node scripts/run-db-commands.js clean production --force`);

  if (!options.includes("--force")) {
    process.exit(0);
  }
}

if (command === "deploy" && env === "production") {
  console.warn(
    "⚠️ WARNING: You are about to deploy to the PRODUCTION environment!",
  );
  console.warn("To proceed, run again with the --yes option:");
  console.warn(`node scripts/run-db-commands.js deploy production --yes`);

  if (!options.includes("--yes")) {
    process.exit(0);
  }
}

// Run the command
async function runCommand() {
  let cmd = commands[command];

  // Add any additional options
  if (options.length > 0) {
    cmd += ` ${options.join(" ")}`;
  }

  console.log(`Running: ${cmd}`);

  try {
    const { stdout, stderr } = await execPromise(cmd);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ Command '${command}' completed successfully`);
  } catch (error) {
    console.error(`❌ Command '${command}' failed:`, error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

runCommand();
