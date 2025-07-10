#!/usr/bin/env node

/**
 * Build Diagnostics Script
 * Provides detailed analysis of build issues before running the actual build
 */

import fs from "fs";
import path from "path";

console.log("🔍 BUILD DIAGNOSTICS STARTING...\n");

// 1. Check critical files
const criticalFiles = [
  "package.json",
  "next.config.mjs",
  "shared/schema.ts",
  "app/lib/rbac/index.ts",
  "app/lib/session.ts",
  "app/lib/auth.ts",
];

console.log("=== CRITICAL FILES CHECK ===");
criticalFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - EXISTS`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// 2. Check schema exports
console.log("\n=== SCHEMA EXPORTS CHECK ===");
const schemaPath = "shared/schema.ts";
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, "utf8");
  const requiredExports = [
    "items",
    "activityTypes",
    "activityAssignments",
    "organizationUsers",
    "organizationSettings",
    "userOrganizationPreferences",
    "rolePermissions",
    "bookingComments",
    "eventInstances",
    "promotionTypes",
  ];

  requiredExports.forEach((exportName) => {
    if (schemaContent.includes(`export const ${exportName}`)) {
      console.log(`✅ ${exportName} - EXPORTED`);
    } else {
      console.log(`❌ ${exportName} - MISSING EXPORT`);
    }
  });
}

// 3. Check RBAC exports
console.log("\n=== RBAC EXPORTS CHECK ===");
const rbacPath = "app/lib/rbac/index.ts";
if (fs.existsSync(rbacPath)) {
  const rbacContent = fs.readFileSync(rbacPath, "utf8");
  const requiredRbacExports = [
    "hasPermission",
    "getAllPermissions",
    "hasRoutePermission",
    "routePermissions",
  ];

  requiredRbacExports.forEach((exportName) => {
    if (rbacContent.includes(exportName)) {
      console.log(`✅ ${exportName} - FOUND`);
    } else {
      console.log(`❌ ${exportName} - MISSING`);
    }
  });
}

// 4. Check for common import errors
console.log("\n=== IMPORT ANALYSIS ===");
const checkImports = (dir) => {
  const issues = [];

  const scanDirectory = (currentDir) => {
    if (!fs.existsSync(currentDir)) return;

    const files = fs.readdirSync(currentDir, { withFileTypes: true });

    files.forEach((file) => {
      if (
        file.isDirectory() &&
        !file.name.startsWith(".") &&
        file.name !== "node_modules"
      ) {
        scanDirectory(path.join(currentDir, file.name));
      } else if (file.name.endsWith(".ts") || file.name.endsWith(".tsx")) {
        const filePath = path.join(currentDir, file.name);
        const content = fs.readFileSync(filePath, "utf8");

        // Check for problematic imports
        const problematicImports = [
          {
            pattern: /from '@\/components\/ui\/Checkbox'/,
            issue: "Capital C in Checkbox import",
          },
          {
            pattern: /from '.*\/rbac'.*getAllPermissions/,
            issue: "getAllPermissions import issue",
          },
          {
            pattern: /from '.*schema'.*organizationSettings/,
            issue: "organizationSettings import issue",
          },
        ];

        problematicImports.forEach(({ pattern, issue }) => {
          if (pattern.test(content)) {
            issues.push(`${filePath}: ${issue}`);
          }
        });
      }
    });
  };

  scanDirectory(dir);
  return issues;
};

const importIssues = checkImports("app");
if (importIssues.length > 0) {
  console.log("❌ IMPORT ISSUES FOUND:");
  importIssues.forEach((issue) => console.log(`   ${issue}`));
} else {
  console.log("✅ NO OBVIOUS IMPORT ISSUES DETECTED");
}

// 5. Check TypeScript config
console.log("\n=== TYPESCRIPT CONFIG CHECK ===");
const tsConfigPath = "tsconfig.json";
if (fs.existsSync(tsConfigPath)) {
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, "utf8"));
  console.log(`✅ TypeScript config exists`);
  console.log(
    `   Strict mode: ${tsConfig.compilerOptions?.strict || "not set"}`,
  );
  console.log(
    `   Module resolution: ${tsConfig.compilerOptions?.moduleResolution || "not set"}`,
  );
} else {
  console.log("❌ tsconfig.json missing");
}

// 6. Check build dependencies
console.log("\n=== BUILD DEPENDENCIES CHECK ===");
const packageJsonPath = "package.json";
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const buildDeps = ["next", "typescript", "@types/node", "@types/react"];

  buildDeps.forEach((dep) => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep} - INSTALLED`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
    }
  });
}

console.log("\n🔍 BUILD DIAGNOSTICS COMPLETED\n");
