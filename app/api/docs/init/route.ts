import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { existsSync, mkdirSync, statSync, readdirSync, copyFileSync } from "fs";
import { getDocsDirectory } from "@/lib/utils";

/**
 * Copy directory recursively
 */
function copyDir(src: string, dest: string): void {
  // Create destination directory if it doesn't exist
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  try {
    // Get all files in source directory
    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;

      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy directories
        copyDir(srcPath, destPath);
      } else {
        // Copy files
        copyFileSync(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error(
      `[DOCS INIT] Error copying directory from ${src} to ${dest}:`,
      error,
    );
  }
}

/**
 * Find the Docs directory in potential locations
 * Prioritizes populated directories over empty ones
 */
function findDocsDirectory(): string | null {
  const baseDir = process.cwd();
  // Define paths to check for documentation - ordered by priority
  const possiblePaths = [
    // Common development paths
    `${baseDir}/Docs`, // Standard location

    // Replit-specific paths
    `/home/runner/workspace/Docs`, // Specific for Replit
    `/home/runner/Docs`, // Another possible Replit location

    // Next.js output paths
    `${baseDir}/.next/standalone/Docs`, // Next.js standalone output location
    `${baseDir}/.next/server/Docs`, // Server output location
    `${baseDir}/.next/static/Docs`, // Static output location

    // Secondary locations
    `${baseDir}/.next/server/chunks/Docs`, // Server chunks location
    `${baseDir}/docs-new`, // Alternative docs folder
    `${baseDir}/docs`, // Lowercase alternative
    `${baseDir}/../Docs`, // One level up (sometimes needed in production)
    `/app/Docs`, // Container root
    `/Docs`, // Root directory in some containers
  ];

  console.log(
    "[DOCS INIT] Searching for Docs directory in all potential locations...",
  );

  // First find directories with actual content (preferred)
  const validDirectories: Array<{
    path: string;
    fileCount: number;
    mdCount: number;
    dirCount: number;
  }> = [];
  const emptyDirectories: string[] = [];

  for (const dirPath of possiblePaths) {
    try {
      if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
        // Verify we can read from this directory and it has files
        try {
          const files = readdirSync(dirPath);
          const mdFiles = files.filter(
            (f) => f.endsWith(".md") || f.endsWith(".mdx"),
          );
          const directories = files.filter((f) => {
            try {
              return statSync(dirPath + "/" + f).isDirectory();
            } catch (e) {
              return false;
            }
          });

          if (files.length > 0) {
            console.log(`[DOCS INIT] Found populated directory at: ${dirPath}`);
            console.log(
              `[DOCS INIT] - Contains ${files.length} entries (${mdFiles.length} markdown files, ${directories.length} subdirectories)`,
            );
            console.log(
              `[DOCS INIT] - First few items: ${files.slice(0, 5).join(", ")}`,
            );

            // Directory has content - add to valid directories
            validDirectories.push({
              path: dirPath,
              fileCount: files.length,
              mdCount: mdFiles.length,
              dirCount: directories.length,
            });
          } else {
            console.log(`[DOCS INIT] Found empty directory at: ${dirPath}`);
            emptyDirectories.push(dirPath);
          }
        } catch (readErr) {
          console.error(
            `[DOCS INIT] Directory exists but cannot be read: ${dirPath} - ${readErr instanceof Error ? readErr.message : "Unknown error"}`,
          );
        }
      }
    } catch (err) {
      // Silently continue to next path
    }
  }

  // Prioritize directories with actual content
  if (validDirectories.length > 0) {
    // Sort by number of markdown files (most relevant indicator)
    validDirectories.sort((a, b) => b.mdCount - a.mdCount);

    // The array is non-empty as we're inside the if-block - add non-null assertion
    const bestDir = validDirectories[0]!;
    const dirPath = bestDir.path;
    const fileCount = bestDir.fileCount;
    const mdCount = bestDir.mdCount;

    console.log(`[DOCS INIT] Selected best directory: ${dirPath}`);
    console.log(
      `[DOCS INIT] - Contains ${fileCount} files (${mdCount} markdown files)`,
    );

    return dirPath;
  }

  // If no populated directory found, return the first empty directory for use as a target
  if (emptyDirectories.length > 0) {
    // Use a non-null assertion and explicit type assertion since we know the array has at least one element
    const firstEmptyDir = emptyDirectories[0] as string;
    console.log(
      `[DOCS INIT] No populated directories found. Using empty directory: ${firstEmptyDir}`,
    );
    return firstEmptyDir;
  }

  console.error(
    "[DOCS INIT] Could not find a valid Docs directory in any location",
  );

  // Create a new directory as last resort
  try {
    const newDir = `${baseDir}/Docs`;
    mkdirSync(newDir, { recursive: true });
    console.log(`[DOCS INIT] Created new Docs directory at: ${newDir}`);
    return newDir;
  } catch (createErr) {
    console.error(
      `[DOCS INIT] Failed to create new Docs directory: ${createErr instanceof Error ? createErr.message : "Unknown error"}`,
    );
    return null;
  }
}

/**
 * Create sample documentation if no docs are found
 * This creates a minimal set of documentation files to prevent application errors
 */
function createSampleDocumentation(targetDir: string): boolean {
  console.log(
    `[DOCS INIT] Creating minimal documentation samples in ${targetDir}`,
  );

  try {
    // Ensure the target directory exists
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Create the README.md file
    const readmePath = path.join(targetDir, "README.md");
    const readmeContent = `# Documentation Home
    
## Welcome to the Documentation Portal

This is a generated placeholder for the documentation. The actual documentation content will be available soon.

## Available Sections

- [Getting Started](/docs/getting-started)
- [API Reference](/docs/api)
- [Development Guides](/docs/development-guides)

## Recent Updates

- **Documentation System**: Initial documentation portal setup
- **API References**: Placeholder for API documentation
- **Development Guides**: Placeholder for development guides
`;
    try {
      copyFileSync(readmePath, readmePath + ".bak");
    } catch (e) {
      // Ignore backup error
    }
    fs.writeFile(readmePath, readmeContent);

    // Create basic directory structure
    const directories = [
      "api",
      "architecture",
      "development-guides",
      "features",
      "getting-started",
    ];

    for (const dir of directories) {
      const dirPath = path.join(targetDir, dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }

      // Create a README.md in each directory
      const dirReadmePath = path.join(dirPath, "README.md");
      const dirReadmeContent = `# ${dir.charAt(0).toUpperCase() + dir.slice(1).replace(/-/g, " ")}

This section contains documentation about ${dir.replace(/-/g, " ")}.

## Contents

Documentation for this section is being prepared.
`;
      fs.writeFile(dirReadmePath, dirReadmeContent);
    }

    console.log(
      `[DOCS INIT] Successfully created sample documentation with ${directories.length + 1} files`,
    );
    return true;
  } catch (error) {
    console.error(
      `[DOCS INIT] Error creating sample documentation: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return false;
  }
}

/**
 * Main documentation initialization function
 * @param forceInit Whether to force reinitialization regardless of current state
 */
async function initDocs(forceInit: boolean = false) {
  console.log("=== Documentation Initialization ===");
  console.log(`Force initialization: ${forceInit ? "YES" : "NO"}`);

  // First, find the source Docs directory
  const sourceDir = findDocsDirectory();

  // Setup mode - we're either copying real docs or creating samples
  let isCreateMode = false;
  let workingSourceDir = sourceDir ?? "";

  // If force initialization is enabled, create sample documentation even if a source exists
  if (forceInit && sourceDir) {
    console.log(
      "[DOCS INIT] Force initialization enabled - creating fresh documentation",
    );

    try {
      // Create sample documentation in the source directory
      if (createSampleDocumentation(sourceDir)) {
        console.log(
          "[DOCS INIT] Created fresh sample documentation due to force flag",
        );
        isCreateMode = true;
      }
    } catch (err) {
      console.error(
        `[DOCS INIT] Error creating fresh documentation: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  if (!sourceDir) {
    console.error("[DOCS INIT] Failed to find a source Docs directory.");

    // Create new directory for sample docs
    const baseDir = process.cwd();
    const newDir = `${baseDir}/Docs`;

    try {
      mkdirSync(newDir, { recursive: true });
      console.log(`[DOCS INIT] Created new directory at: ${newDir}`);

      // Create sample documentation
      if (createSampleDocumentation(newDir)) {
        console.log(
          "[DOCS INIT] Created sample documentation. Will use this as source.",
        );
        workingSourceDir = newDir;
        isCreateMode = true;
      } else {
        console.error(
          "[DOCS INIT] Failed to create sample documentation. Process aborted.",
        );
        return false;
      }
    } catch (err) {
      console.error(
        `[DOCS INIT] Failed to create directory: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      return false;
    }
  } else {
    // Check if source directory has content
    try {
      const files = readdirSync(workingSourceDir);
      if (files.length === 0) {
        console.warn(
          `[DOCS INIT] Source directory is empty. Creating sample content.`,
        );
        if (createSampleDocumentation(workingSourceDir)) {
          console.log(
            "[DOCS INIT] Created sample documentation in source directory.",
          );
          isCreateMode = true;
        }
      }
    } catch (err) {
      console.error(
        `[DOCS INIT] Error checking source directory: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  // Define only essential target locations to copy to
  const baseDir = process.cwd();

  // Create a list of potential directories, filtering out nulls
  // Use proper type safety for TypeScript
  const potentialDirs: string[] = [
    // Standard locations - this is the primary location
    path.join(baseDir, "Docs"),

    // Public directory for static serving
    path.join(baseDir, "public/Docs"),
  ];

  // Only add production directories when in production
  if (process.env.NODE_ENV === "production") {
    potentialDirs.push(path.join(baseDir, ".next/standalone/Docs"));
  }

  // Only add Replit workspace location in Replit environment
  if (process.env.REPL_ID) {
    potentialDirs.push("/home/runner/workspace/Docs");
  }

  // Filter out directories that match the source directory
  const targetDirs = potentialDirs.filter((dir) => {
    // Only include directories different from source
    // workingSourceDir is guaranteed to be a string, but might be empty
    if (workingSourceDir === "") return true;
    const normalized1 = path.normalize(dir);
    const normalized2 = path.normalize(workingSourceDir);
    return normalized1 !== normalized2;
  });

  console.log(
    `[DOCS INIT] Will copy from ${workingSourceDir} to ${targetDirs.length} locations`,
  );

  // Copy to each target directory
  let successCount = 0;
  let failCount = 0;

  for (const targetDir of targetDirs) {
    console.log(`[DOCS INIT] Copying to ${targetDir}...`);
    try {
      // Ensure parent directory exists
      const parentDir = path.dirname(targetDir);
      if (!existsSync(parentDir)) {
        try {
          mkdirSync(parentDir, { recursive: true });
        } catch (mkdirErr) {
          // Ignore if we can't create parent directories
          console.warn(
            `[DOCS INIT] Could not create parent directory ${parentDir}: ${mkdirErr instanceof Error ? mkdirErr.message : "Unknown error"}`,
          );
        }
      }

      // Safety check for source directory
      if (workingSourceDir === "") {
        console.error(
          `[DOCS INIT] Cannot copy from empty source directory to ${targetDir}`,
        );
        failCount++;
        continue;
      }

      // Attempt to copy with improved error handling
      try {
        const copyResult = copyDir(workingSourceDir, targetDir);

        // Verify the copy worked by checking if files exist
        if (existsSync(targetDir)) {
          try {
            const files = readdirSync(targetDir);
            if (files.length > 0) {
              console.log(
                `[DOCS INIT] ✓ Successfully copied to ${targetDir} (${files.length} items)`,
              );
              successCount++;
            } else {
              console.error(
                `[DOCS INIT] ✗ Copy completed but target directory is empty: ${targetDir}`,
              );
              failCount++;
            }
          } catch (readErr) {
            console.error(
              `[DOCS INIT] ✗ Cannot verify copy, directory not readable: ${targetDir}`,
            );
            failCount++;
          }
        } else {
          console.error(
            `[DOCS INIT] ✗ Target directory does not exist after copy: ${targetDir}`,
          );
          failCount++;
        }
      } catch (copyError) {
        console.error(
          `[DOCS INIT] ✗ Error during copy process: ${copyError instanceof Error ? copyError.message : "Unknown error"}`,
        );
        failCount++;
      }
    } catch (error) {
      console.error(
        `[DOCS INIT] ✗ Error copying to ${targetDir}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      failCount++;
    }
  }

  // Summary
  console.log("\n=== Copy Process Summary ===");
  console.log(`[DOCS INIT] Successfully copied to ${successCount} locations`);
  console.log(`[DOCS INIT] Failed to copy to ${failCount} locations`);

  if (successCount > 0) {
    console.log(
      "[DOCS INIT] ✅ Documentation successfully copied to at least one location",
    );

    if (isCreateMode) {
      console.log(
        "[DOCS INIT] NOTE: Sample documentation was created since no actual docs were found",
      );
    }

    // Success
    return true;
  } else {
    console.error(
      "[DOCS INIT] ❌ Documentation copy process failed completely",
    );
    return false;
  }
}

/**
 * GET handler for docs initialization API
 * This route initializes the documentation system
 */
export async function GET(request: Request) {
  console.log("[DOCS INIT API] Documentation initialization started");

  try {
    // Check request parameters
    const url = new URL(request.url);
    const isEmergency = url.(searchParams.get("emergency") || undefined) === "true";
    const forceInit = url.(searchParams.get("force") || undefined) === "true";

    // Run in both production and development, but with different levels of verbosity
    const isProduction = process.env.NODE_ENV === "production";

    console.log(
      `[DOCS INIT API] Running in ${isProduction ? "PRODUCTION" : "DEVELOPMENT"} mode${isEmergency ? " (EMERGENCY MODE)" : ""}${forceInit ? " (FORCE REINITIALIZATION)" : ""}`,
    );

    // Get the current docs dir before initialization to compare
    const beforeDocsDir = await getDocsDirectory();
    console.log(
      `[DOCS INIT API] Current docs directory before initialization: ${beforeDocsDir ?? "Not found"}`,
    );

    if (beforeDocsDir) {
      try {
        const beforeFiles = await fs.readdir(beforeDocsDir);
        console.log(
          `[DOCS INIT API] BEFORE: Directory contains ${beforeFiles.length} items`,
        );
        console.log(
          `[DOCS INIT API] BEFORE: First few items: ${beforeFiles.slice(0, 5).join(", ")}`,
        );
      } catch (err) {
        console.error(
          `[DOCS INIT API] Cannot read docs directory: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    }

    // In production or emergency mode, attempt to copy documentation from public directory
    // This is necessary because in some hosting environments, only the /public folder is reliably preserved
    if (isProduction || isEmergency) {
      try {
        const publicDocsDir = path.join(process.cwd(), "public", "Docs");
        const targetDir = path.join(process.cwd(), "Docs");

        const publicDirExists = await fs
          .access(publicDocsDir)
          .then(() => true)
          .catch(() => false);
        if (publicDirExists) {
          console.log(
            `[DOCS INIT API] Found public/Docs directory - copying to main Docs directory`,
          );
          try {
            // Make sure target exists
            await fs.mkdir(targetDir, { recursive: true });

            // Get a list of files to copy
            const entries = readdirSync(publicDocsDir, { withFileTypes: true });
            let copyCount = 0;

            // Copy each file
            for (const entry of entries) {
              try {
                const srcPath = path.join(publicDocsDir, entry.name);
                const destPath = path.join(targetDir, entry.name);

                if (entry.isDirectory()) {
                  copyDir(srcPath, destPath);
                  copyCount++;
                } else {
                  copyFileSync(srcPath, destPath);
                  copyCount++;
                }
              } catch (e) {
                console.error(
                  `[DOCS INIT API] Error copying ${entry.name}: ${e instanceof Error ? e.message : "Unknown error"}`,
                );
              }
            }

            console.log(
              `[DOCS INIT API] Copied ${copyCount} items from public/Docs to main Docs directory`,
            );
          } catch (e) {
            console.error(
              `[DOCS INIT API] Error copying from public/Docs: ${e instanceof Error ? e.message : "Unknown error"}`,
            );
          }
        } else {
          console.log(
            `[DOCS INIT API] public/Docs directory not found - skipping public directory copy`,
          );
        }
      } catch (e) {
        console.error(
          `[DOCS INIT API] Error during public directory check: ${e instanceof Error ? e.message : "Unknown error"}`,
        );
      }
    }

    // Always run initialization process, but log differently
    console.log(
      `[DOCS INIT API] Running initialization in ${isProduction ? "PRODUCTION" : "DEVELOPMENT"} mode${forceInit ? " with FORCE flag" : ""}`,
    );
    const result = await initDocs(forceInit);

    if (result) {
      // Confirm current location of docs directory for the app
      const docsDir = await getDocsDirectory();
      const docsDirPath = docsDir ?? "No docs directory found";
      console.log(
        `[DOCS INIT API] Current docs directory after initialization: ${docsDirPath}`,
      );

      // Check if the directory is readable and print detailed information
      if (docsDir) {
        try {
          const files = await fs.readdir(docsDir);
          console.log(
            `[DOCS INIT API] AFTER: Docs directory contains ${files.length} items`,
          );
          console.log(
            `[DOCS INIT API] AFTER: First few items: ${files.slice(0, 5).join(", ")}`,
          );

          // In production, do more thorough validation of files
          if (isProduction) {
            // Check subdirectories
            const allDirectories = files.filter((file) => {
              try {
                return statSync(path.join(docsDir, file)).isDirectory();
              } catch (e) {
                return false;
              }
            });

            console.log(
              `[DOCS INIT API] Found ${allDirectories.length} subdirectories: ${allDirectories.join(", ")}`,
            );

            // Check a few key files to ensure complete copy
            const keyFilesToCheck = [
              "README.md",
              "api/README.md",
              "architecture/README.md",
              "getting-started/README.md",
            ];

            for (const keyFile of keyFilesToCheck) {
              const keyFilePath = path.join(docsDir, keyFile);
              const keyFileExists = existsSync(keyFilePath);
              console.log(
                `[DOCS INIT API] Key file ${keyFile}: ${keyFileExists ? "EXISTS" : "MISSING"}`,
              );
            }
          }
        } catch (err) {
          console.error(
            `[DOCS INIT API] Cannot read docs directory: ${err instanceof Error ? err.message : "Unknown error"}`,
          );
        }
      } else {
        console.error(
          "[DOCS INIT API] No docs directory was found to read from after initialization",
        );
      }

      return NextResponse.json({
        success: true,
        message: `Documentation initialization completed successfully in ${isProduction ? "production" : "development"} mode`,
        docsDirectory: docsDir,
        filesCount: docsDir
          ? (await fs.readdir(docsDir).catch(() => [])).length
          : 0,
      });
    } else {
      return NextResponse.json(
        {
          error: `Documentation initialization failed in ${isProduction ? "production" : "development"} mode`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error initializing documentation:", error);
    return NextResponse.json(
      { error: "Failed to initialize documentation" },
      { status: 500 },
    );
  }
}

/**
 * POST handler for docs initialization API
 * Provides the same functionality as GET but allows for POST requests
 */
export async function POST(request: Request) {
  console.log(
    "[DOCS INIT API] Documentation initialization started via POST request",
  );

  try {
    // Try to parse request body for potential force flag
    let forceInit = false;

    try {
      const body = await request.json();
      forceInit = body?.force === true;
    } catch (e) {
      // If JSON parsing fails, it's OK - we'll use default value
    }

    console.log(
      `[DOCS INIT API] POST request${forceInit ? " with FORCE flag" : ""}`,
    );

    // Run docs initialization with same logic as GET handler
    const initSuccess = await initDocs(forceInit);

    if (initSuccess) {
      // Get the updated docs directory
      const docsDir = await getDocsDirectory();
      console.log(
        `[DOCS INIT API] Docs directory after initialization: ${docsDir ?? "Not found"}`,
      );

      // Check for key files to verify initialization worked
      if (docsDir) {
        try {
          const filesAfter = await fs.readdir(docsDir);
          console.log(
            `[DOCS INIT API] AFTER: Directory contains ${filesAfter.length} items`,
          );
          console.log(
            `[DOCS INIT API] AFTER: First few items: ${filesAfter.slice(0, 5).join(", ")}`,
          );

          // Check for key files that should exist in any docs setup
          const keyFiles = ["README.md", "api", "getting-started"];
          for (const keyFile of keyFiles) {
            const keyFilePath = path.join(docsDir, keyFile);
            const keyFileExists = existsSync(keyFilePath);
            console.log(
              `[DOCS INIT API] Key file ${keyFile}: ${keyFileExists ? "EXISTS" : "MISSING"}`,
            );
          }
        } catch (err) {
          console.error(
            `[DOCS INIT API] Cannot read docs directory: ${err instanceof Error ? err.message : "Unknown error"}`,
          );
        }
      } else {
        console.error(
          "[DOCS INIT API] No docs directory was found to read from after initialization",
        );
      }

      return NextResponse.json({
        success: true,
        message: `Documentation initialization completed successfully via POST`,
        docsDirectory: docsDir,
        filesCount: docsDir
          ? (await fs.readdir(docsDir).catch(() => [])).length
          : 0,
      });
    } else {
      return NextResponse.json(
        { error: `Documentation initialization failed via POST` },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error initializing documentation via POST:", error);
    return NextResponse.json(
      { error: "Failed to initialize documentation" },
      { status: 500 },
    );
  }
}
