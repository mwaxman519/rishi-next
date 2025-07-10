#!/usr/bin/env node

/**
 * List files with @/ imports for batch processing
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to find files with @/ imports
function findFilesWithAtImports() {
  try {
    // Use grep to find files with @/ imports
    const result = execSync(
      'find app -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "@/"',
    ).toString();
    return result.trim().split("\n");
  } catch (error) {
    console.error("Error finding files with @/ imports:", error.message);
    return [];
  }
}

// Main execution
async function main() {
  const files = findFilesWithAtImports();

  if (files.length === 0) {
    console.log("No files with @/ imports found");
    return;
  }

  console.log(`Found ${files.length} files with @/ imports:`);

  // Group files by directory for easier processing
  const filesByDir = {};
  files.forEach((file) => {
    const dir = path.dirname(file);
    if (!filesByDir[dir]) {
      filesByDir[dir] = [];
    }
    filesByDir[dir].push(file);
  });

  // Print files by directory with counts
  Object.keys(filesByDir)
    .sort()
    .forEach((dir) => {
      console.log(`\n${dir} (${filesByDir[dir].length} files):`);
      filesByDir[dir].forEach((file) => {
        console.log(`  ${path.basename(file)}`);
      });
    });

  // Create a batch file to convert files in chunks
  console.log("\nCreating batch conversion commands:");

  // Create commands for batch conversion
  const batchSize = 10;
  let batchCommands = "";

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchCmd = `node scripts/fix-imports.js ${batch.join(" ")}\n`;
    batchCommands += batchCmd;
    console.log(batchCmd.trim());
  }

  // Write the batch commands to a file
  fs.writeFileSync(
    "scripts/convert-batches.sh",
    "#!/bin/bash\n\n" + batchCommands,
    "utf8",
  );
  console.log("\nBatch commands written to scripts/convert-batches.sh");
  console.log(
    "Run: chmod +x scripts/convert-batches.sh && ./scripts/convert-batches.sh",
  );
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
