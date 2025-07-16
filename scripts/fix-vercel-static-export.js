#!/usr/bin/env node

/**
 * Fix Vercel Static Export Issues
 * Creates a Vercel-optimized build configuration to eliminate chunk loading issues
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Creating Vercel-optimized static export configuration...\n');

// 1. Replace Next.js config with static export version
const replaceNextConfig = () => {
  const originalConfig = 'next.config.mjs';
  const vercelConfig = 'next.config.vercel.mjs';
  
  if (fs.existsSync(vercelConfig)) {
    // Backup original
    fs.copyFileSync(originalConfig, 'next.config.mjs.backup');
    
    // Replace with Vercel-optimized config
    fs.copyFileSync(vercelConfig, originalConfig);
    
    console.log('✅ Replaced Next.js config with Vercel-optimized version');
    return true;
  }
  
  console.log('❌ Vercel config not found');
  return false;
};

// 2. Replace login page with static export version
const replaceLoginPage = () => {
  const originalPage = 'app/auth/login/page.tsx';
  const vercelPage = 'app/auth/login/page.vercel.tsx';
  
  if (fs.existsSync(vercelPage)) {
    // Backup original
    fs.copyFileSync(originalPage, 'app/auth/login/page.tsx.backup');
    
    // Replace with Vercel-optimized page
    fs.copyFileSync(vercelPage, originalPage);
    
    console.log('✅ Replaced login page with static export version');
    return true;
  }
  
  console.log('❌ Vercel login page not found');
  return false;
};

// 3. Update package.json for Vercel deployment
const updatePackageJson = () => {
  const packagePath = 'package.json';
  
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add Vercel-specific scripts
    pkg.scripts = {
      ...pkg.scripts,
      'build:vercel': 'next build',
      'export:vercel': 'next export',
      'deploy:vercel': 'next build && next export'
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    
    console.log('✅ Updated package.json with Vercel scripts');
    return true;
  }
  
  console.log('❌ Package.json not found');
  return false;
};

// 4. Create .vercelignore file
const createVercelIgnore = () => {
  const vercelIgnore = `.next/
node_modules/
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
*.tsbuildinfo
next-env.d.ts
.vercel
out/
build/
dist/
*.log
`;

  fs.writeFileSync('.vercelignore', vercelIgnore);
  console.log('✅ Created .vercelignore file');
};

// 5. Create vercel.json configuration
const createVercelConfig = () => {
  const vercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "next.config.mjs",
        "use": "@vercel/next"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/$1"
      }
    ],
    "outputDirectory": "out"
  };

  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Created vercel.json configuration');
};

// Execute all fixes
const executeFixes = async () => {
  const fixes = [
    { name: 'Next.js Config', fn: replaceNextConfig },
    { name: 'Login Page', fn: replaceLoginPage },
    { name: 'Package.json', fn: updatePackageJson },
    { name: 'Vercel Ignore', fn: createVercelIgnore },
    { name: 'Vercel Config', fn: createVercelConfig },
  ];

  let allSuccess = true;
  
  for (const fix of fixes) {
    try {
      const success = fix.fn();
      if (!success) allSuccess = false;
    } catch (error) {
      console.error(`❌ Failed to apply ${fix.name}:`, error.message);
      allSuccess = false;
    }
  }

  console.log('\n📊 Summary:');
  if (allSuccess) {
    console.log('✅ All Vercel optimizations applied successfully!');
    console.log('\n🚀 Next steps:');
    console.log('  1. Commit and push changes to trigger Vercel deployment');
    console.log('  2. Vercel will use static export (no chunks)');
    console.log('  3. Login page will work without chunk loading issues');
    console.log('  4. Test authentication after deployment');
  } else {
    console.log('❌ Some optimizations failed. Please check the output above.');
  }
};

executeFixes();

export default { executeFixes };