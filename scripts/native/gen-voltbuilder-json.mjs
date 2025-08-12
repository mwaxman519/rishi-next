#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version || '1.0.0';

// Read environment variables
const appName = process.env.NATIVE_APP_NAME || 'Rishi';
const androidAppId = process.env.NATIVE_ANDROID_APP_ID || 'co.rishi.app';
const iosBundle = process.env.NATIVE_IOS_BUNDLE_ID || 'co.rishi.app';
const channel = process.env.NATIVE_CHANNEL || 'prod';
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rishi-next.vercel.app';

// Manage android version code
const versionCodeFile = path.join(__dirname, '.android_version_code');
let androidVersionCode = 1;

if (fs.existsSync(versionCodeFile)) {
  try {
    const currentCode = parseInt(fs.readFileSync(versionCodeFile, 'utf8').trim(), 10);
    androidVersionCode = currentCode + 1;
  } catch (e) {
    console.warn('Warning: Could not read version code file, using default');
  }
}

fs.writeFileSync(versionCodeFile, androidVersionCode.toString());

// Generate VoltBuilder configuration
const voltbuilderConfig = {
  title: appName,
  id: androidAppId,
  version: version,
  author: {
    name: "Rishi Team",
    email: "support@rishi.co",
    href: apiBase
  },
  description: `${appName} - Advanced mobile field management platform`,
  build: {
    phonegap: "12.0.0"
  },
  platforms: [
    "android",
    "ios"
  ],
  plugins: {
    "cordova-plugin-whitelist": "^1.3.4",
    "cordova-plugin-statusbar": "^2.4.2",
    "cordova-plugin-device": "^2.0.3",
    "cordova-plugin-splashscreen": "^5.0.4",
    "cordova-plugin-inappbrowser": "^3.2.0",
    "cordova-plugin-file": "^6.0.2",
    "cordova-plugin-media": "^5.0.3",
    "cordova-plugin-camera": "^4.1.0",
    "cordova-plugin-geolocation": "^4.1.0",
    "cordova-plugin-network-information": "^2.0.2"
  },
  preferences: {
    "DisallowOverscroll": "true",
    "Orientation": "default",
    "EnableViewportScale": "false",
    "MediaPlaybackRequiresUserAction": "false",
    "AllowInlineMediaPlayback": "true",
    "BackupWebStorage": "none",
    "TopActivityIndicator": "gray",
    "KeyboardDisplayRequiresUserAction": "true",
    "SuppressesIncrementalRendering": "false",
    "android-minSdkVersion": "24",
    "android-targetSdkVersion": "34",
    "android-compileSdkVersion": "34"
  },
  // Platform specific configurations
  android: {
    app_id: androidAppId,
    version_code: androidVersionCode,
    package_type: "apk",
    keystore: `rishi-android-${channel}`,
    alias: `rishi-${channel}`
  },
  ios: {
    app_id: iosBundle,
    package_type: "app-store",
    mobileprovision: `rishi-ios-${channel}`,
    p12: `rishi-ios-${channel}`,
    bundle_version: androidVersionCode.toString()
  },
  // Access permissions
  access: [
    {
      origin: "*"
    }
  ],
  // Content Security Policy
  "content-security-policy": "default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: gap: https://ssl.gstatic.com 'unsafe-inline'; object-src 'self'; connect-src * 'self' https://api.rishi.co wss://* ws://*"
};

// Write voltbuilder.json to project root
fs.writeFileSync('voltbuilder.json', JSON.stringify(voltbuilderConfig, null, 2));

console.log('✅ Generated voltbuilder.json');
console.log('📱 App Name:', appName);
console.log('📦 Version:', version);
console.log('🤖 Android App ID:', androidAppId);
console.log('🍎 iOS Bundle ID:', iosBundle);
console.log('🔢 Android Version Code:', androidVersionCode);
console.log('🌍 API Base URL:', apiBase);
console.log('🏷️ Channel:', channel);