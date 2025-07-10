import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

async function main() {
  console.log("Pushing schema to database...");

  try {
    // Run drizzle-kit to push schema
    const { stdout, stderr } = await execPromise(
      "npx drizzle-kit push:pg --schema=./shared/schema.ts",
    );

    if (stderr && !stderr.includes("No migration needed")) {
      console.error("Error pushing schema:", stderr);
      process.exit(1);
    }

    console.log(stdout);
    console.log("Schema pushed successfully");
  } catch (error) {
    console.error("Schema push failed:", error);
    process.exit(1);
  }
}

main();
