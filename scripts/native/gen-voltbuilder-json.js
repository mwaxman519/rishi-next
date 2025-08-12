#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version || '1.0.0';

// Get environment variables
const appName = process.env.NATIVE_APP_NAME || 'Rishi Platform';
const androidAppId = process.env.NATIVE_ANDROID_APP_ID || 'co.rishi.app';
const iosBundle = process.env.NATIVE_IOS_BUNDLE_ID || 'co.rishi.app';
const channel = process.env.NATIVE_CHANNEL || 'prod';

// Read or create android version code
const versionCodeFile = path.join(__dirname, '.android_version_code');
let androidVersionCode = 1;
if (fs.existsSync(versionCodeFile)) {
  try {
    androidVersionCode = parseInt(fs.readFileSync(versionCodeFile, 'utf8').trim()) || 1;
  } catch (e) {
    androidVersionCode = 1;
  }
}
androidVersionCode += 1;
fs.writeFileSync(versionCodeFile, androidVersionCode.toString());

// Generate VoltBuilder configuration
const voltbuilderConfig = {
  app_name: appName,
  app_id: androidAppId,
  version: version,
  android_version_code: androidVersionCode,
  package_type: {
    android: "apk",
    ios: "app-store"
  },
  platforms: ["android", "ios"],
  android: {
    applicationId: androidAppId,
    keystore: {
      alias: `rishi-android-${channel}`,
      keystore: `rishi-android-${channel}.keystore`
    },
    permissions: [
      "android.permission.CAMERA",
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE"
    ],
    features: [
      "android.hardware.camera"
    ]
  },
  ios: {
    bundle_id: iosBundle,
    provisioning_profile: `rishi-ios-${channel}`,
    certificate: `rishi-ios-dist-${channel}`,
    deployment_target: "13.0"
  },
  icon: {
    src: "resources/icon.png",
    sizes: [57, 60, 72, 76, 114, 120, 144, 152, 167, 180, 1024]
  },
  splash: {
    src: "resources/splash.png"
  },
  preferences: {
    fullscreen: false,
    orientation: "default",
    target_device: "universal"
  }
};

// Write voltbuilder.json
fs.writeFileSync('voltbuilder.json', JSON.stringify(voltbuilderConfig, null, 2));

console.log(`✅ Generated voltbuilder.json for ${channel} build:`);
console.log(`   App: ${appName}`);
console.log(`   Android: ${androidAppId} (v${androidVersionCode})`);
console.log(`   iOS: ${iosBundle}`);
console.log(`   Version: ${version}`);
console.log(`   API Base: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET'}`);