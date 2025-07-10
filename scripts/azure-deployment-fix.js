#!/usr/bin/env node

/**
 * Azure Static Web Apps Deployment Fix
 * Ensures optimal configuration for successful deployment
 */

import fs from "fs";
import path from "path";

function log(message) {
  console.log(`[Azure Deploy Fix] ${message}`);
}

function createOptimizedTailwindConfig() {
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
  fs.writeFileSync("tailwind.config.js", tailwindConfig);
  log("Created optimized Tailwind configuration");
}

function createOptimizedPostCSSConfig() {
  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
  fs.writeFileSync("postcss.config.mjs", postcssConfig);
  log("Created optimized PostCSS configuration");
}

function updatePackageJsonForAzure() {
  const packagePath = "package.json";
  if (!fs.existsSync(packagePath)) {
    log("Warning: package.json not found");
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  // Ensure build script exists
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = "next build";
  pkg.scripts["build:azure"] =
    "npm install autoprefixer postcss tailwindcss && next build";

  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  log("Updated package.json for Azure deployment");
}

function createStaticWebAppConfig() {
  const config = {
    routes: [
      {
        route: "/api/*",
        allowedRoles: ["anonymous"],
      },

      {
        route: "/*",
        serve: "/index.html",
        statusCode: 200,
      },
    ],
    navigationFallback: {
      rewrite: "/index.html",
    },
    responseOverrides: {
      401: {
        redirect: "/auth",
        statusCode: 302,
      },
    },
    globalHeaders: {
      "content-security-policy":
        "default-src https: 'unsafe-eval' 'unsafe-inline'; object-src 'none'",
    },
    mimeTypes: {
      ".json": "application/json",
    },
  };

  fs.writeFileSync("staticwebapp.config.json", JSON.stringify(config, null, 2));
  log("Created Static Web App configuration");
}

function main() {
  log("Starting Azure deployment optimization...");

  try {
    createOptimizedTailwindConfig();
    createOptimizedPostCSSConfig();
    updatePackageJsonForAzure();
    createStaticWebAppConfig();

    log("Azure deployment optimization complete!");
    log("Ready for GitHub deployment pipeline");
  } catch (error) {
    console.error("Error during optimization:", error);
    process.exit(1);
  }
}

main();
