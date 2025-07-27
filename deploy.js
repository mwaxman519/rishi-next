#!/usr/bin/env node

/**
 * Deployment script for Rishi Platform
 * Alternative to shell scripts for better cross-platform compatibility
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function log(message) {
  console.log(`[DEPLOY] ${message}`);
}

function execCommand(command, description) {
  log(description);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✓ ${description} completed successfully`);
  } catch (error) {
    log(`✗ ${description} failed: ${error.message}`);
    process.exit(1);
  }
}

function ensureExecutablePermissions() {
  const scripts = ['build.sh', 'start.sh'];
  
  scripts.forEach(script => {
    if (fs.existsSync(script)) {
      try {
        fs.chmodSync(script, '755');
        log(`✓ Made ${script} executable`);
      } catch (error) {
        log(`Warning: Could not make ${script} executable: ${error.message}`);
      }
    }
  });
}

function main() {
  log('Starting Rishi Platform deployment...');
  
  // Ensure shell scripts have proper permissions
  ensureExecutablePermissions();
  
  // Set environment variables
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  
  // Install dependencies
  execCommand('npm ci --no-audit', 'Installing dependencies');
  
  // Push database schema changes
  try {
    execCommand('npm run db:push', 'Pushing database schema changes');
  } catch (error) {
    log('Warning: Database schema push failed, continuing with build');
  }
  
  // Build the application
  execCommand('npm run build', 'Building Next.js application');
  
  log('✓ Deployment completed successfully!');
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}

export { main, ensureExecutablePermissions };