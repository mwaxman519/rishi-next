#!/usr/bin/env node

/**
 * Mobile App Build Script
 * Builds native Android APK and iOS IPA files from Next.js PWA
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function log(message) {
  console.log(`[Mobile Build] ${message}`);
}

function execCommand(command, description) {
  log(`${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`);
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`);
    process.exit(1);
  }
}

function createMobileDirectories() {
  const dirs = ['mobile-dist', 'mobile-dist/android', 'mobile-dist/ios'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`);
    }
  });
}

function checkPrerequisites() {
  log('Checking prerequisites...');
  
  // Check if Android Studio and SDK are installed
  try {
    execSync('android --version', { stdio: 'ignore' });
    log('✅ Android SDK found');
  } catch (error) {
    log('⚠️  Android SDK not found. Install Android Studio for APK building.');
  }
  
  // Check if Xcode is installed (macOS only)
  if (process.platform === 'darwin') {
    try {
      execSync('xcode-select --version', { stdio: 'ignore' });
      log('✅ Xcode found');
    } catch (error) {
      log('⚠️  Xcode not found. Install Xcode for iOS building.');
    }
  }
  
  // Check if Capacitor CLI is installed
  try {
    execSync('npx cap --version', { stdio: 'ignore' });
    log('✅ Capacitor CLI found');
  } catch (error) {
    log('❌ Capacitor CLI not found. Installing...');
    execCommand('npm install -g @capacitor/cli', 'Install Capacitor CLI');
  }
}

function buildNextApp() {
  log('Building Next.js app for mobile...');
  
  // Set environment for static export
  process.env.NEXT_PUBLIC_APP_ENV = 'production';
  process.env.NODE_ENV = 'production';
  
  execCommand('npm run build', 'Build Next.js app');
  
  // Verify build output
  if (!fs.existsSync('out')) {
    log('❌ Build output directory "out" not found');
    process.exit(1);
  }
  
  log('✅ Next.js build completed successfully');
}

function initializeCapacitor() {
  log('Initializing Capacitor...');
  
  // Initialize Capacitor if not already done
  if (!fs.existsSync('capacitor.config.ts')) {
    execCommand('npx cap init "Rishi Platform" "com.rishi.platform" --web-dir=out', 'Initialize Capacitor');
  }
  
  // Add platforms if they don't exist
  if (!fs.existsSync('android')) {
    execCommand('npx cap add android', 'Add Android platform');
  }
  
  if (!fs.existsSync('ios')) {
    execCommand('npx cap add ios', 'Add iOS platform');
  }
  
  log('✅ Capacitor initialization completed');
}

function syncCapacitor() {
  log('Syncing Capacitor...');
  execCommand('npx cap sync', 'Sync Capacitor');
  log('✅ Capacitor sync completed');
}

function buildAndroid() {
  log('Building Android APK...');
  
  try {
    // Build the Android app
    execCommand('npx cap build android', 'Build Android app');
    
    // Copy APK to distribution folder
    const apkSource = 'android/app/build/outputs/apk/debug/app-debug.apk';
    const apkDest = 'mobile-dist/android/rishi-platform.apk';
    
    if (fs.existsSync(apkSource)) {
      fs.copyFileSync(apkSource, apkDest);
      log(`✅ Android APK created: ${apkDest}`);
    } else {
      log('⚠️  APK file not found. Building in Android Studio may be required.');
    }
    
  } catch (error) {
    log('⚠️  Android build failed. You may need to:');
    log('   1. Install Android Studio');
    log('   2. Set up Android SDK');
    log('   3. Run: npx cap open android');
    log('   4. Build manually in Android Studio');
  }
}

function buildIOS() {
  if (process.platform !== 'darwin') {
    log('⚠️  iOS build skipped (macOS required)');
    return;
  }
  
  log('Building iOS app...');
  
  try {
    // Build the iOS app
    execCommand('npx cap build ios', 'Build iOS app');
    
    log('✅ iOS build completed');
    log('📱 To create IPA file:');
    log('   1. Run: npx cap open ios');
    log('   2. Open project in Xcode');
    log('   3. Archive and export IPA');
    
  } catch (error) {
    log('⚠️  iOS build failed. You may need to:');
    log('   1. Install Xcode');
    log('   2. Set up iOS development certificates');
    log('   3. Run: npx cap open ios');
    log('   4. Build manually in Xcode');
  }
}

function generateBuildInstructions() {
  const instructions = `
# Mobile App Build Instructions

## Android APK
- Location: mobile-dist/android/rishi-platform.apk
- Install: Enable "Unknown Sources" in Android settings, then install APK

## iOS IPA (macOS only)
- Requires Xcode and iOS Developer Account
- Run: npx cap open ios
- Build and archive in Xcode
- Export IPA for distribution

## Manual Build Commands
- Android: npx cap build android
- iOS: npx cap build ios
- Open in IDE: npx cap open android/ios

## Distribution
- Android: Upload APK to Google Play Console or distribute directly
- iOS: Upload IPA to App Store Connect or TestFlight

## Troubleshooting
- Missing Android SDK: Install Android Studio
- Missing Xcode: Install from Mac App Store
- Build failures: Check platform-specific requirements
`;
  
  fs.writeFileSync('mobile-dist/BUILD_INSTRUCTIONS.md', instructions);
  log('✅ Build instructions created: mobile-dist/BUILD_INSTRUCTIONS.md');
}

function main() {
  log('Starting mobile app build process...');
  
  createMobileDirectories();
  checkPrerequisites();
  buildNextApp();
  initializeCapacitor();
  syncCapacitor();
  buildAndroid();
  buildIOS();
  generateBuildInstructions();
  
  log('🎉 Mobile build process completed!');
  log('📁 Check mobile-dist/ folder for output files');
  log('📖 Read mobile-dist/BUILD_INSTRUCTIONS.md for next steps');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}