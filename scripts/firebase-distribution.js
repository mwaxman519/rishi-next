#!/usr/bin/env node

/**
 * Firebase App Distribution Helper
 * Helps set up and manage Firebase App Distribution
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function log(message) {
  console.log(`[Firebase Distribution] ${message}`);
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

function setupFirebaseDistribution() {
  log('🔥 Setting up Firebase App Distribution...');
  
  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'ignore' });
  } catch (error) {
    log('Installing Firebase CLI...');
    if (!runCommand('npm install -g firebase-tools', 'Install Firebase CLI')) {
      return false;
    }
  }
  
  // Login to Firebase
  log('Please login to Firebase...');
  if (!runCommand('firebase login', 'Login to Firebase')) {
    return false;
  }
  
  // Initialize project
  log('Initializing Firebase project...');
  if (!runCommand('firebase init', 'Initialize Firebase project')) {
    return false;
  }
  
  return true;
}

function uploadToFirebase(apkPath, ipaPath) {
  log('📱 Uploading apps to Firebase Distribution...');
  
  // Upload Android APK
  if (apkPath && fs.existsSync(apkPath)) {
    log('Uploading Android APK...');
    const androidCommand = `firebase appdistribution:distribute "${apkPath}" --app ANDROID_APP_ID --release-notes "Rishi Platform update"`;
    runCommand(androidCommand, 'Upload Android APK');
  }
  
  // Upload iOS IPA
  if (ipaPath && fs.existsSync(ipaPath)) {
    log('Uploading iOS IPA...');
    const iosCommand = `firebase appdistribution:distribute "${ipaPath}" --app IOS_APP_ID --release-notes "Rishi Platform update"`;
    runCommand(iosCommand, 'Upload iOS IPA');
  }
}

function createFirebaseConfig() {
  const firebaseConfig = {
    "projects": {
      "default": "rishi-platform"
    },
    "targets": {},
    "etags": {}
  };
  
  fs.writeFileSync('.firebaserc', JSON.stringify(firebaseConfig, null, 2));
  log('✅ Firebase configuration created');
}

function main() {
  log('🎯 Firebase App Distribution setup...');
  
  if (setupFirebaseDistribution()) {
    log('🎉 Firebase setup completed!');
    log('');
    log('Next steps:');
    log('1. Go to https://console.firebase.google.com/');
    log('2. Create new project: "Rishi Platform"');
    log('3. Enable App Distribution');
    log('4. Add your Android/iOS apps');
    log('5. Get app IDs and update this script');
    log('6. Upload APK/IPA files via dashboard or CLI');
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  main();
} else if (args[0] === 'upload') {
  const apkPath = args[1];
  const ipaPath = args[2];
  uploadToFirebase(apkPath, ipaPath);
} else {
  log('Usage: node firebase-distribution.js [upload <apk_path> <ipa_path>]');
}