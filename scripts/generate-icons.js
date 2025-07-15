#!/usr/bin/env node

/**
 * Mobile Icon Generation Script
 * Generates Android and iOS app icons from source icon
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ICON_SOURCE = 'public/icons/icon-512x512.svg';

const ANDROID_ICONS = [
  { size: 36, folder: 'drawable-ldpi', name: 'ic_launcher.png' },
  { size: 48, folder: 'drawable-mdpi', name: 'ic_launcher.png' },
  { size: 72, folder: 'drawable-hdpi', name: 'ic_launcher.png' },
  { size: 96, folder: 'drawable-xhdpi', name: 'ic_launcher.png' },
  { size: 144, folder: 'drawable-xxhdpi', name: 'ic_launcher.png' },
  { size: 192, folder: 'drawable-xxxhdpi', name: 'ic_launcher.png' },
];

const IOS_ICONS = [
  { size: 20, name: 'icon-20.png' },
  { size: 29, name: 'icon-29.png' },
  { size: 40, name: 'icon-40.png' },
  { size: 58, name: 'icon-58.png' },
  { size: 60, name: 'icon-60.png' },
  { size: 80, name: 'icon-80.png' },
  { size: 87, name: 'icon-87.png' },
  { size: 120, name: 'icon-120.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 167, name: 'icon-167.png' },
  { size: 180, name: 'icon-180.png' },
  { size: 1024, name: 'icon-1024.png' },
];

function log(message) {
  console.log(`[Icon Generator] ${message}`);
}

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`);
  }
}

async function generateAndroidIcons() {
  log('Generating Android icons...');
  
  for (const icon of ANDROID_ICONS) {
    const outputDir = `android/app/src/main/res/${icon.folder}`;
    ensureDirectoryExists(outputDir);
    
    const outputPath = path.join(outputDir, icon.name);
    
    await sharp(ICON_SOURCE)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);
    
    log(`✅ Generated ${icon.folder}/${icon.name} (${icon.size}x${icon.size})`);
  }
  
  // Generate round icons
  for (const icon of ANDROID_ICONS) {
    const outputDir = `android/app/src/main/res/${icon.folder}`;
    const outputPath = path.join(outputDir, 'ic_launcher_round.png');
    
    await sharp(ICON_SOURCE)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);
  }
  
  log('✅ Android icons generated');
}

async function generateIOSIcons() {
  log('Generating iOS icons...');
  
  const outputDir = 'ios/App/App/Assets.xcassets/AppIcon.appiconset';
  ensureDirectoryExists(outputDir);
  
  for (const icon of IOS_ICONS) {
    const outputPath = path.join(outputDir, icon.name);
    
    await sharp(ICON_SOURCE)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);
    
    log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }
  
  // Generate Contents.json for iOS
  const contentsJson = {
    "images": [
      {
        "idiom": "iphone",
        "size": "20x20",
        "scale": "2x",
        "filename": "icon-40.png"
      },
      {
        "idiom": "iphone",
        "size": "20x20",
        "scale": "3x",
        "filename": "icon-60.png"
      },
      {
        "idiom": "iphone",
        "size": "29x29",
        "scale": "2x",
        "filename": "icon-58.png"
      },
      {
        "idiom": "iphone",
        "size": "29x29",
        "scale": "3x",
        "filename": "icon-87.png"
      },
      {
        "idiom": "iphone",
        "size": "40x40",
        "scale": "2x",
        "filename": "icon-80.png"
      },
      {
        "idiom": "iphone",
        "size": "40x40",
        "scale": "3x",
        "filename": "icon-120.png"
      },
      {
        "idiom": "iphone",
        "size": "60x60",
        "scale": "2x",
        "filename": "icon-120.png"
      },
      {
        "idiom": "iphone",
        "size": "60x60",
        "scale": "3x",
        "filename": "icon-180.png"
      },
      {
        "idiom": "ipad",
        "size": "20x20",
        "scale": "1x",
        "filename": "icon-20.png"
      },
      {
        "idiom": "ipad",
        "size": "20x20",
        "scale": "2x",
        "filename": "icon-40.png"
      },
      {
        "idiom": "ipad",
        "size": "29x29",
        "scale": "1x",
        "filename": "icon-29.png"
      },
      {
        "idiom": "ipad",
        "size": "29x29",
        "scale": "2x",
        "filename": "icon-58.png"
      },
      {
        "idiom": "ipad",
        "size": "40x40",
        "scale": "1x",
        "filename": "icon-40.png"
      },
      {
        "idiom": "ipad",
        "size": "40x40",
        "scale": "2x",
        "filename": "icon-80.png"
      },
      {
        "idiom": "ipad",
        "size": "76x76",
        "scale": "1x",
        "filename": "icon-76.png"
      },
      {
        "idiom": "ipad",
        "size": "76x76",
        "scale": "2x",
        "filename": "icon-152.png"
      },
      {
        "idiom": "ipad",
        "size": "83.5x83.5",
        "scale": "2x",
        "filename": "icon-167.png"
      },
      {
        "idiom": "ios-marketing",
        "size": "1024x1024",
        "scale": "1x",
        "filename": "icon-1024.png"
      }
    ],
    "info": {
      "version": 1,
      "author": "xcode"
    }
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  
  log('✅ iOS icons generated');
}

async function generateSplashScreens() {
  log('Generating splash screens...');
  
  // Android splash
  const androidSplashDir = 'android/app/src/main/res/drawable';
  ensureDirectoryExists(androidSplashDir);
  
  await sharp(ICON_SOURCE)
    .resize(512, 512)
    .png()
    .toFile(path.join(androidSplashDir, 'splash.png'));
  
  // iOS splash
  const iosSplashDir = 'ios/App/App/Assets.xcassets/Splash.imageset';
  ensureDirectoryExists(iosSplashDir);
  
  await sharp(ICON_SOURCE)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(iosSplashDir, 'splash.png'));
  
  log('✅ Splash screens generated');
}

async function main() {
  log('Starting icon generation...');
  
  // Check if source icon exists
  if (!fs.existsSync(ICON_SOURCE)) {
    log(`❌ Source icon not found: ${ICON_SOURCE}`);
    log('Please ensure you have an icon file at public/icons/icon-512x512.svg');
    return;
  }
  
  try {
    await generateAndroidIcons();
    await generateIOSIcons();
    await generateSplashScreens();
    log('🎉 Icon generation completed successfully!');
  } catch (error) {
    log(`❌ Icon generation failed: ${error.message}`);
    log('You may need to install sharp: npm install sharp');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}