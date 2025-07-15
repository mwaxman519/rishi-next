#!/usr/bin/env node

/**
 * Quick Mobile Build Script
 * Simplified version for generating native mobile apps
 */

import { execSync } from 'child_process';
import fs from 'fs';

function log(message) {
  console.log(`[Mobile Build] ${message}`);
}

function runCommand(command, description) {
  log(`${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`);
    return false;
  }
}

function main() {
  log('🚀 Starting quick mobile build...');
  
  // Step 1: Check if out directory exists
  if (!fs.existsSync('out')) {
    log('Building Next.js app first...');
    if (!runCommand('npm run build', 'Build Next.js app')) {
      log('❌ Build failed. Please fix build errors first.');
      return;
    }
  }
  
  // Step 2: Sync Capacitor
  log('Syncing Capacitor...');
  if (!runCommand('npx cap sync', 'Sync Capacitor')) {
    log('⚠️  Sync failed. Continuing anyway...');
  }
  
  // Step 3: Try Android build
  log('Attempting Android build...');
  if (runCommand('npx cap build android', 'Build Android APK')) {
    log('✅ Android APK should be in android/app/build/outputs/apk/');
  } else {
    log('⚠️  Android build failed. Try: npx cap open android');
  }
  
  // Step 4: iOS build (macOS only)
  if (process.platform === 'darwin') {
    log('iOS build available. Run: npx cap open ios');
  } else {
    log('⚠️  iOS build requires macOS');
  }
  
  log('🎉 Mobile build process completed!');
  log('📖 Check MOBILE_BUILD_GUIDE.md for detailed instructions');
}

main();