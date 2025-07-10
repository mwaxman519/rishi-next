/**
 * Documentation Linking Script
 *
 * This script creates a symbolic link from the public/Docs directory to the Docs directory
 * to ensure documentation is accessible without duplication.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// Get current file directory and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Define source and destination directories
const sourceDir = path.join(projectRoot, "Docs");
const destDir = path.join(projectRoot, "public", "Docs");

// Main execution
function linkDocs() {
  console.log("Setting up documentation access...");

  if (!fs.existsSync(sourceDir)) {
    console.error(
      `Error: Source documentation directory not found at ${sourceDir}`,
    );
    process.exit(1);
  }

  // Check if destination exists
  if (fs.existsSync(destDir)) {
    const stats = fs.lstatSync(destDir);

    // If it's already a symlink, check if it points to the right place
    if (stats.isSymbolicLink()) {
      const target = fs.readlinkSync(destDir);
      if (target === sourceDir) {
        console.log("Symbolic link already exists and is correct.");
        return;
      } else {
        console.log("Removing outdated symbolic link...");
        fs.unlinkSync(destDir);
      }
    } else {
      // If it's a directory, remove it
      console.log("Removing existing Docs directory from public...");
      if (process.platform === "win32") {
        execSync(`rmdir /s /q "${destDir}"`);
      } else {
        execSync(`rm -rf "${destDir}"`);
      }
    }
  }

  // Ensure parent directory exists
  const parentDir = path.dirname(destDir);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Create symbolic link
  try {
    // For Windows compatibility, use relative paths
    const relativeSourceDir = path.relative(path.dirname(destDir), sourceDir);

    if (process.platform === "win32") {
      // Windows requires admin privileges for symlinks
      // Fall back to junction which doesn't require admin
      fs.symlinkSync(relativeSourceDir, destDir, "junction");
    } else {
      fs.symlinkSync(relativeSourceDir, destDir, "dir");
    }

    console.log(`Created symbolic link: public/Docs -> ${relativeSourceDir}`);
  } catch (error) {
    console.error("Error creating symbolic link:", error);

    // Fallback method for environments that don't support symlinks
    console.log("Falling back to alternative method...");

    try {
      // Create a redirect file to handle documentation requests
      const indexPath = path.join(path.dirname(destDir), "docs-redirect.js");
      const indexContent = `// This file redirects documentation requests to the actual files
const express = require('express');
const path = require('path');
const router = express.Router();

// Serve documentation from the actual Docs directory
router.use('/Docs', express.static(path.join(process.cwd(), 'Docs')));

module.exports = router;`;

      fs.writeFileSync(indexPath, indexContent);
      console.log("Created documentation redirect file.");

      // Add an instruction file in the destination directory
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(
        path.join(destDir, "README.md"),
        "# Documentation\n\nDocumentation is served from the main `Docs` directory rather than being duplicated here.",
      );

      console.log("Created fallback documentation access.");
    } catch (fallbackError) {
      console.error("Error creating fallback access:", fallbackError);
      process.exit(1);
    }
  }

  console.log("Documentation access setup complete!");
}

// Execute the link
linkDocs();
