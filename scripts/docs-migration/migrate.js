/**
 * Documentation Migration Script
 *
 * This script helps migrate documents from the root of the Docs directory
 * into appropriate subdirectories based on their content.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Base directory for documentation
const DOCS_DIRECTORY = path.join(process.cwd(), "Docs");

// Mapping of root files to appropriate subdirectories
const migrationMap = {
  // Development & coding standards
  "0-Project-Overview.md": "getting-started/project-overview.md",
  "1-TypeScript-Guidelines.md": "development-guides/typescript/guidelines.md",
  "2-Build-Optimization.md":
    "development-guides/optimizations/build-optimization.md",
  "3-Database-Best-Practices.md":
    "development-guides/database/best-practices.md",
  "4-CI-CD-and-Deployment.md": "deployment/ci-cd-practices.md",
  "5-Development-Workflow.md": "development-guides/workflow.md",
  "6-Common-TypeScript-Fixes.md":
    "development-guides/typescript/common-fixes.md",
  "typescript-guidelines.md":
    "development-guides/typescript/detailed-guidelines.md",

  // System architecture files
  "auth-rbac-system.md": "architecture/authentication-rbac-system.md",
  "mobile-app-strategy.md": "architecture/mobile-architecture/strategy.md",

  // Deployment & operations
  "deployment-guide.md": "deployment/guide.md",
  "production-deployment.md": "deployment/production.md",
  "replit-staging-guide.md": "deployment/replit-staging.md",
  "replit-standalone-deployment.md": "deployment/replit-standalone.md",

  // Database & middleware
  "database-guide.md": "development-guides/database/guide.md",
  "middleware-guide.md": "development-guides/middleware/guide.md",

  // Miscellaneous
  "chunk-error-fixes.md":
    "development-guides/troubleshooting/chunk-error-fixes.md",
  "test-document.md": "testing/test-document.md",
  "DEPRECATED.md": "archive/deprecated.md",
  "README.md": "README.md", // Keep in root but make sure content is appropriate for documentation home
};

// Ensure target directories exist
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
    console.log(`Created directory: ${dirname}`);
  }
}

// Perform the migration
function migrateDocuments() {
  console.log("Starting documentation migration...");

  for (const [sourceFile, targetPath] of Object.entries(migrationMap)) {
    const sourcePath = path.join(DOCS_DIRECTORY, sourceFile);
    const targetFullPath = path.join(DOCS_DIRECTORY, targetPath);

    if (fs.existsSync(sourcePath)) {
      ensureDirectoryExists(targetFullPath);

      try {
        // Read content
        const content = fs.readFileSync(sourcePath, "utf-8");

        // Update content with better frontmatter if needed
        const updatedContent = addOrUpdateFrontmatter(
          content,
          path.basename(targetPath, ".md"),
        );

        // Write to new location
        fs.writeFileSync(targetFullPath, updatedContent);
        console.log(`Migrated: ${sourceFile} -> ${targetPath}`);

        // Keep original files until the migration is verified
        // fs.renameSync(sourcePath, sourcePath + '.migrated');
        // console.log(`Renamed original to: ${sourceFile}.migrated`);
      } catch (err) {
        console.error(`Error migrating ${sourceFile}:`, err);
      }
    } else {
      console.warn(`Source file not found: ${sourceFile}`);
    }
  }

  console.log("Documentation migration completed!");
}

// Add or update frontmatter in documents
function addOrUpdateFrontmatter(content, title) {
  // Check if the document already has frontmatter
  if (content.startsWith("---")) {
    // Extract existing frontmatter
    const frontmatterEndIndex = content.indexOf("---", 3);
    if (frontmatterEndIndex !== -1) {
      const frontmatter = content.substring(0, frontmatterEndIndex + 3);
      const documentContent = content.substring(frontmatterEndIndex + 3);

      // Check if title is already in frontmatter
      if (!frontmatter.includes("title:")) {
        const updatedFrontmatter = frontmatter.replace(
          /---\n/,
          `---\ntitle: ${formatTitle(title)}\n`,
        );
        return updatedFrontmatter + documentContent;
      }

      return content;
    }
  }

  // Add new frontmatter
  const today = new Date().toISOString().split("T")[0];
  const newFrontmatter = `---
title: ${formatTitle(title)}
description: 
lastUpdated: ${today}
---

`;

  return newFrontmatter + content;
}

// Format title from filename
function formatTitle(filename) {
  return filename
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// Run the migration
migrateDocuments();
