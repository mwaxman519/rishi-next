#!/usr/bin/env node

/**
 * Package Project for VoltBuilder
 * Creates a zip file with all necessary files for cloud builds
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

function log(message) {
  console.log(`[VoltBuilder Package] ${message}`);
}

function runCommand(command, description) {
  log(`${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: projectRoot });
    log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`);
    return false;
  }
}

function createVoltBuilderPackage() {
  log('🚀 Creating VoltBuilder package...');
  
  // Ensure build exists
  if (!fs.existsSync(path.join(projectRoot, 'out'))) {
    log('Building Next.js app...');
    if (!runCommand('npm run build', 'Build Next.js app')) {
      return false;
    }
  }
  
  // Ensure Capacitor is synced
  log('Syncing Capacitor...');
  runCommand('npx cap sync', 'Sync Capacitor platforms');
  
  // Create package directory
  const packageDir = path.join(projectRoot, 'voltbuilder-package');
  if (fs.existsSync(packageDir)) {
    fs.rmSync(packageDir, { recursive: true });
  }
  fs.mkdirSync(packageDir);
  
  // Copy essential files
  const filesToCopy = [
    'capacitor.config.ts',
    'package.json',
    'out',
    'android',
    'ios',
    'public',
    'src',
    'components',
    'lib',
    'app'
  ];
  
  filesToCopy.forEach(file => {
    const srcPath = path.join(projectRoot, file);
    const destPath = path.join(packageDir, file);
    
    if (fs.existsSync(srcPath)) {
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
        log(`📁 Copied directory: ${file}`);
      } else {
        fs.copyFileSync(srcPath, destPath);
        log(`📄 Copied file: ${file}`);
      }
    }
  });
  
  // Create zip file
  const zipName = `rishi-platform-${new Date().toISOString().split('T')[0]}.zip`;
  const zipPath = path.join(projectRoot, zipName);
  
  log('Creating zip file...');
  if (runCommand(`cd voltbuilder-package && zip -r ../${zipName} .`, 'Create zip package')) {
    log(`✅ VoltBuilder package created: ${zipName}`);
    log(`📦 Upload this file to VoltBuilder dashboard`);
    
    // Cleanup
    fs.rmSync(packageDir, { recursive: true });
    
    return zipPath;
  }
  
  return false;
}

function main() {
  log('🎯 Starting VoltBuilder package creation...');
  
  const packagePath = createVoltBuilderPackage();
  
  if (packagePath) {
    log('🎉 Package ready for VoltBuilder!');
    log('');
    log('Next steps:');
    log('1. Go to https://voltbuilder.com/');
    log('2. Create new project');
    log(`3. Upload: ${path.basename(packagePath)}`);
    log('4. Configure build settings');
    log('5. Build and download APK/IPA');
  } else {
    log('❌ Package creation failed');
  }
}

main();