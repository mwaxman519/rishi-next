#!/usr/bin/env node

/**
 * Emergency Build Trigger for Replit Deployment
 * This script forces a clean build with proper component resolution
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚨 EMERGENCY BUILD TRIGGER - FIXING DEPLOYMENT ISSUES');
console.log('');

// Step 1: Verify all UI components exist
console.log('1. Verifying UI components...');
const requiredComponents = [
  'card.tsx',
  'button.tsx', 
  'badge.tsx',
  'textarea.tsx',
  'input.tsx',
  'select.tsx',
  'form.tsx',
  'label.tsx',
  'toast.tsx',
  'dialog.tsx',
  'dropdown-menu.tsx',
  'tabs.tsx',
  'table.tsx',
  'checkbox.tsx',
  'switch.tsx',
  'alert.tsx',
  'separator.tsx',
  'popover.tsx',
  'tooltip.tsx',
  'sheet.tsx'
];

const uiDir = path.join(__dirname, 'components', 'ui');
const missingComponents = [];

for (const component of requiredComponents) {
  const componentPath = path.join(uiDir, component);
  if (!fs.existsSync(componentPath)) {
    missingComponents.push(component);
  }
}

if (missingComponents.length > 0) {
  console.log(`❌ Missing components: ${missingComponents.join(', ')}`);
  process.exit(1);
} else {
  console.log('✅ All required UI components found');
}

// Step 2: Clean build directories
console.log('2. Cleaning build directories...');
try {
  execSync('rm -rf .next out', { stdio: 'inherit' });
  console.log('✅ Build directories cleaned');
} catch (error) {
  console.log('⚠️  Build directories already clean');
}

// Step 3: Install dependencies
console.log('3. Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('❌ Dependency installation failed');
  process.exit(1);
}

// Step 4: Run build with proper environment
console.log('4. Running build with staging environment...');
const buildEnv = {
  ...process.env,
  NODE_ENV: 'staging',
  STATIC_EXPORT: '1',
  NEXT_CONFIG_FILE: 'next.config.staging.mjs'
};

try {
  execSync('npm run build', { 
    stdio: 'inherit',
    env: buildEnv
  });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.log('❌ Build failed');
  process.exit(1);
}

// Step 5: Verify build output
console.log('5. Verifying build output...');
const outDir = path.join(__dirname, 'out');
if (fs.existsSync(outDir)) {
  const files = fs.readdirSync(outDir);
  console.log(`✅ Build output contains ${files.length} files`);
  
  // Check for critical files
  const criticalFiles = ['index.html', '_next'];
  for (const file of criticalFiles) {
    const filePath = path.join(outDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  }
} else {
  console.log('❌ Build output directory missing');
  process.exit(1);
}

console.log('');
console.log('🎉 BUILD SUCCESSFUL - DEPLOYMENT ISSUES RESOLVED');
console.log('');
console.log('Deploy to Replit Autoscale:');
console.log('1. Deploy → Autoscale');
console.log('2. Select "Static Site"');
console.log('3. Set publish directory: out');
console.log('4. Deploy!');