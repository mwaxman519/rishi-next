import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import * as schema from "../shared/schema";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

async function main() {
  console.log("Generating migrations...");

  try {
    // Run drizzle-kit to generate migrations
    const { stdout, stderr } = await execPromise(
      "npx drizzle-kit generate:pg --schema=./shared/schema.ts --out=./drizzle",
    );

    if (stderr) {
      console.error("Error generating migrations:", stderr);
      process.exit(1);
    }

    console.log(stdout);
    console.log("Migrations generated successfully");
  } catch (error) {
    console.error("Migration generation failed:", error);
    process.exit(1);
  }
}

main();
