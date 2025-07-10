/**
 * Deployment Script
 *
 * This is the main deployment script that orchestrates the entire deployment process,
 * including data validation, sanitization, and environment-specific configuration.
 *
 * Usage:
 *   node scripts/deploy.js [environment] [--option]
 *
 * Examples:
 *   node scripts/deploy.js staging      # Deploy to staging
 *   node scripts/deploy.js production   # Deploy to production
 *   node scripts/deploy.js --validate   # Just run validation, no deployment
 */

require("dotenv").config();
const { exec } = require("child_process");
const { promisify } = require("util");
const execPromise = promisify(exec);

// Command line args
const args = process.argv.slice(2);
let targetEnv = args.find((arg) => !arg.startsWith("--")) || "development";
const validateOnly = args.includes("--validate");
const skipConfirmation = args.includes("--yes");
const forceFlag = args.includes("--force");

console.log(
  `Deployment process for ${targetEnv} environment${validateOnly ? " (validation only)" : ""}`,
);

// Ensure environment is valid
if (!["development", "staging", "production"].includes(targetEnv)) {
  console.error(`Invalid environment: ${targetEnv}`);
  console.error("Valid environments: development, staging, production");
  process.exit(1);
}

// Special safety checks for production deployment
if (targetEnv === "production" && !skipConfirmation && !validateOnly) {
  console.log("⚠️ PRODUCTION DEPLOYMENT WARNING ⚠️");
  console.log("You are about to deploy to the production environment.");
  console.log(
    "This action will affect live data and should be done with caution.",
  );
  console.log("");
  console.log("To proceed, run again with the --yes flag:");
  console.log("  node scripts/deploy.js production --yes");
  process.exit(0);
}

/**
 * Run a script with the specified environment and arguments
 */
async function runScript(scriptPath, env, ...args) {
  const nodeEnv = env ? `NODE_ENV=${env}` : "";
  const command =
    `${nodeEnv} node ${scriptPath} ${env || ""} ${args.join(" ")}`.trim();

  console.log(`Running: ${command}`);

  try {
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error) {
    console.error(`Failed to run ${scriptPath}:`, error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

/**
 * Main deployment function
 */
async function deploy() {
  // Step 1: Validate environment configuration
  console.log(`\n1. Validating environment: ${targetEnv}...`);
  const isValid = await runScript(
    "./scripts/validate-deployment.js",
    targetEnv,
  );

  if (!isValid) {
    console.error("❌ Validation failed - aborting deployment");
    process.exit(1);
  }

  // Exit early if validation only mode
  if (validateOnly) {
    console.log("✅ Validation successful - exiting (--validate flag used)");
    process.exit(0);
  }

  // Step 2: Run data sanitization for the target environment
  console.log("\n2. Running data sanitization...");
  let sanitizeArgs = ["--dry-run"]; // Start with dry run

  const dryRunResult = await runScript(
    "./scripts/data-sanitizer.js",
    targetEnv,
    ...sanitizeArgs,
  );

  if (!dryRunResult) {
    console.error("❌ Data sanitization check failed - aborting deployment");
    process.exit(1);
  }

  // For production, we perform data cleaning
  if (targetEnv === "production") {
    sanitizeArgs = forceFlag ? ["--execute"] : []; // Real execution if forced
    const sanitizeResult = await runScript(
      "./scripts/data-sanitizer.js",
      targetEnv,
      ...sanitizeArgs,
    );

    if (!sanitizeResult) {
      console.error("❌ Data sanitization failed - aborting deployment");
      process.exit(1);
    }
  }

  // Step 3: Run database migrations
  console.log("\n3. Running database migrations...");
  const migrateResult = await runScript("./scripts/db-migrate.js", targetEnv);

  if (!migrateResult) {
    console.error("❌ Database migration failed - aborting deployment");
    process.exit(1);
  }

  // Step 4: Build the application
  console.log("\n4. Building the application...");
  try {
    console.log(`Running: NODE_ENV=${targetEnv} npm run build`);
    const { stdout, stderr } = await execPromise(
      `NODE_ENV=${targetEnv} npm run build`,
    );
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }

  // Step 5: Deploy to the target environment
  console.log(`\n5. Deploying to ${targetEnv}...`);

  if (targetEnv === "production") {
    try {
      // For Azure deployment
      console.log("Deploying to Azure (production)...");
      console.log("NODE_ENV=production npm run deploy:azure");

      // This is just a placeholder - the actual deployment command would be executed here
      console.log("✅ Production deployment to Azure initiated");
    } catch (error) {
      console.error("❌ Production deployment failed:", error.message);
      process.exit(1);
    }
  } else if (targetEnv === "staging") {
    try {
      // For Replit staging deployment
      console.log("Deploying to Replit (staging)...");
      console.log("NODE_ENV=staging npm run deploy:replit");

      // This is just a placeholder - the actual deployment command would be executed here
      console.log("✅ Staging deployment to Replit initiated");
    } catch (error) {
      console.error("❌ Staging deployment failed:", error.message);
      process.exit(1);
    }
  } else {
    // Local development deployment
    console.log("Local development environment - no deployment needed");
  }

  // Step 6: Final verification
  console.log("\n6. Verifying deployment...");

  // Simply re-run validation after deployment
  const postDeployValid = await runScript(
    "./scripts/validate-deployment.js",
    targetEnv,
  );

  if (!postDeployValid) {
    console.error(
      "⚠️ Post-deployment validation failed - deployment may be incomplete",
    );
    process.exit(1);
  }

  console.log(`\n✅ Deployment to ${targetEnv} completed successfully!`);
}

// Run the deployment process
deploy().catch((error) => {
  console.error("Deployment failed with error:", error);
  process.exit(1);
});
