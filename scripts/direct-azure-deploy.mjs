#!/usr/bin/env node

/**
 * Direct Azure Deployment Strategy
 * Deploys source code directly to Azure Static Web Apps without local build
 */

import fs from "fs";

console.log("Preparing direct Azure deployment...");

// Create Azure-optimized package.json
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

// Azure build script
packageJson.scripts = {
  ...packageJson.scripts,
  "azure:build": "next build",
  "azure:start": "next start",
};

// Write optimized package.json
fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

// Create .deployment file for Azure
const deploymentConfig = `[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
WEBSITE_NODEJS_DEFAULT_VERSION=18.x
`;

fs.writeFileSync(".deployment", deploymentConfig);

// Create web.config for Azure
const webConfig = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="StaticContent">
          <action type="Rewrite" url="public/{R:0}" />
        </rule>
        <rule name="ReactRouter Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>`;

fs.writeFileSync("web.config", webConfig);

console.log("Direct Azure deployment files created");
console.log("Ready for Azure Static Web Apps deployment");
