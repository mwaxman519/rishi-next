#!/usr/bin/env node

/**
 * Script to fix imports in multiple files at once
 * This script replaces common @/ import patterns with relative paths
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Common replacement patterns
const replacements = [
  // Lib imports
  {
    pattern: /@\/lib\/([^'"]+)/g,
    replacement: (match, p1, offset, string, filepath) =>
      getRelativePath(filepath, `app/lib/${p1}`),
  },

  // Components imports
  {
    pattern: /@\/components\/([^'"]+)/g,
    replacement: (match, p1, offset, string, filepath) =>
      getRelativePath(filepath, `app/components/${p1}`),
  },

  // Shared imports
  {
    pattern: /@\/shared\/([^'"]+)/g,
    replacement: (match, p1, offset, string, filepath) =>
      getRelativePath(filepath, `shared/${p1}`),
  },

  // Hooks imports
  {
    pattern: /@\/hooks\/([^'"]+)/g,
    replacement: (match, p1, offset, string, filepath) =>
      getRelativePath(filepath, `app/hooks/${p1}`),
  },

  // Services imports
  {
    pattern: /@\/services\/([^'"]+)/g,
    replacement: (match, p1, offset, string, filepath) =>
      getRelativePath(filepath, `app/services/${p1}`),
  },

  // Types imports
  {
    pattern: /@\/types\/([^'"]+)/g,
    replacement: (match, p1, offset, string, filepath) =>
      getRelativePath(filepath, `app/types/${p1}`),
  },

  // Utils imports
  {
    pattern: /@\/utils\/([^'"]+)/g,
    replacement: (match, p1, offset, string, filepath) =>
      getRelativePath(filepath, `app/utils/${p1}`),
  },

  // Actions imports
  {
    pattern: /@\/actions\/([^'"]+)/g,
    replacement: (match, p1, offset, string, filepath) =>
      getRelativePath(filepath, `app/actions/${p1}`),
  },

  // Root app imports
  {
    pattern: /@\/([^'"\/]+)/g,
    replacement: (match, p1, offset, string, filepath) =>
      getRelativePath(filepath, `app/${p1}`),
  },
];

/**
 * Calculate relative path from source file to target
 */
function getRelativePath(sourceFile, targetPath) {
  const sourceDir = path.dirname(sourceFile);
  let relativePath = path.relative(sourceDir, targetPath);

  // Make sure it starts with ./ or ../
  if (!relativePath.startsWith(".")) {
    relativePath = "./" + relativePath;
  }

  // Fix Windows-style paths
  relativePath = relativePath.replace(/\\/g, "/");

  return relativePath;
}

/**
 * Apply replacements to a single file
 */
function processFile(filepath) {
  try {
    // Read file content
    const content = fs.readFileSync(filepath, "utf8");

    // Apply all replacements
    let newContent = content;
    let changes = 0;

    replacements.forEach(({ pattern, replacement }) => {
      // Reset pattern's lastIndex
      pattern.lastIndex = 0;

      // Replace all occurrences with the calculated relative path
      newContent = newContent.replace(pattern, (match, p1) => {
        const result = replacement(match, p1, 0, newContent, filepath);
        changes++;
        return result;
      });
    });

    // Only write if changes were made
    if (newContent !== content) {
      fs.writeFileSync(filepath, newContent, "utf8");
      console.log(`✓ Updated ${filepath} (${changes} changes)`);
      return true;
    } else {
      console.log(`- No changes needed in ${filepath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filepath}:`, error.message);
    return false;
  }
}

/**
 * Batch process multiple files
 */
function processFiles(files) {
  let successCount = 0;
  let errorCount = 0;

  files.forEach((file) => {
    try {
      const success = processFile(file);
      if (success) {
        successCount++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      errorCount++;
    }
  });

  console.log(`\nSummary: ${successCount} files updated, ${errorCount} errors`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  // Check if specific files were provided
  if (args.length > 0) {
    console.log(`Processing ${args.length} files...`);
    processFiles(args);
    return;
  }

  // Find all TypeScript/TSX files with @/ imports
  try {
    console.log("Finding files with @/ imports...");
    const result = execSync(
      'find app -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "@/"',
    ).toString();
    const files = result.trim().split("\n");

    console.log(`Found ${files.length} files with @/ imports`);

    // Process in chunks to avoid overwhelming the system
    const chunkSize = 10;
    for (let i = 0; i < files.length; i += chunkSize) {
      const chunk = files.slice(i, i + chunkSize);
      console.log(
        `\nProcessing chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(files.length / chunkSize)}...`,
      );
      processFiles(chunk);
    }
  } catch (error) {
    console.error("Error finding/processing files:", error.message);
    process.exit(1);
  }
}

main();
