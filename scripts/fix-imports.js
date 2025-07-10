#!/usr/bin/env node

/**
 * Script to convert @/ import paths to relative paths
 * This helps standardize imports for better build compatibility
 */

const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// Functions to calculate relative paths
function calculateRelativePath(fromFile, toModule) {
  // Get the directory of the current file
  const fromDir = path.dirname(fromFile);

  // Map @/ paths to their actual locations
  let targetPath;
  if (toModule.startsWith("@/lib/")) {
    targetPath = path.join("app/lib", toModule.substring("@/lib/".length));
  } else if (toModule.startsWith("@/components/")) {
    targetPath = path.join(
      "app/components",
      toModule.substring("@/components/".length),
    );
  } else if (toModule.startsWith("@/shared/")) {
    targetPath = path.join("shared", toModule.substring("@/shared/".length));
  } else if (toModule.startsWith("@/")) {
    targetPath = path.join("app", toModule.substring("@/".length));
  } else {
    // Not an @/ import
    return null;
  }

  // Calculate the relative path
  let relativePath = path.relative(fromDir, targetPath);

  // Ensure the path starts with ./ or ../
  if (!relativePath.startsWith(".")) {
    relativePath = "./" + relativePath;
  }

  // Fix Windows-style paths if any
  relativePath = relativePath.replace(/\\/g, "/");

  return relativePath;
}

// Function to convert imports in a file
async function convertFileImports(filePath) {
  try {
    // Read the file
    const content = await readFile(filePath, "utf8");

    // Regular expressions to match different import styles
    const importRegex =
      /import\s+(?:{[^}]*}|\*\s+as\s+[^;]*|[^;]*)\s+from\s+['"](@\/[^'"]*)['"]/g;
    const requireRegex =
      /(?:const|let|var)\s+[^=]*\s*=\s*require\(['"](@\/[^'"]*)['"]\)/g;
    const dynamicImportRegex = /import\(['"](@\/[^'"]*)['"]\)/g;

    // Keep track of replaced imports for logging
    const replacedImports = [];

    // Replace all @/ imports with relative paths
    let newContent = content.replace(importRegex, (match, importPath) => {
      const relativePath = calculateRelativePath(filePath, importPath);
      if (relativePath) {
        // Extract the import statement parts
        const beforePath = match.substring(0, match.indexOf(importPath) - 1); // -1 for the quote
        const afterPath = match.substring(
          match.indexOf(importPath) + importPath.length + 1,
        ); // +1 for the quote

        replacedImports.push(`${importPath} → ${relativePath}`);
        return `${beforePath}${relativePath}${afterPath}`;
      }
      return match;
    });

    // Replace require statements
    newContent = newContent.replace(requireRegex, (match, importPath) => {
      const relativePath = calculateRelativePath(filePath, importPath);
      if (relativePath) {
        // Extract the require statement parts
        const beforePath = match.substring(0, match.indexOf(importPath) - 1); // -1 for the quote
        const afterPath = match.substring(
          match.indexOf(importPath) + importPath.length + 1,
        ); // +1 for the quote

        replacedImports.push(`${importPath} → ${relativePath}`);
        return `${beforePath}${relativePath}${afterPath}`;
      }
      return match;
    });

    // Replace dynamic imports
    newContent = newContent.replace(dynamicImportRegex, (match, importPath) => {
      const relativePath = calculateRelativePath(filePath, importPath);
      if (relativePath) {
        replacedImports.push(`${importPath} → ${relativePath}`);
        return `import('${relativePath}')`;
      }
      return match;
    });

    // If we made changes, write back to the file
    if (content !== newContent) {
      await writeFile(filePath, newContent, "utf8");
      console.log(`✅ Updated ${filePath}`);
      if (replacedImports.length > 0) {
        console.log(`   ${replacedImports.join("\n   ")}`);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process a list of files
async function processFiles(files) {
  let changedCount = 0;

  for (const file of files) {
    const changed = await convertFileImports(file);
    if (changed) changedCount++;
  }

  console.log(`\nCompleted: Updated ${changedCount}/${files.length} files`);
}

// Main execution
async function main() {
  // Check if files were provided as arguments
  const filesToProcess = process.argv.slice(2);

  if (filesToProcess.length === 0) {
    console.error("Please provide one or more files to process");
    console.error(
      "Usage: node fix-imports.js path/to/file1.ts path/to/file2.tsx ...",
    );
    process.exit(1);
  }

  console.log(`Processing ${filesToProcess.length} files...`);
  await processFiles(filesToProcess);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
