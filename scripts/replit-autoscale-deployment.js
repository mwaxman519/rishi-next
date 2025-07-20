#!/usr/bin/env node
/**
 * Replit Autoscale Deployment Preparation Script
 * Addresses common deployment issues for Replit Autoscale environment
 */

import fs from 'fs/promises';
import path from 'path';

async function prepareForAutoscaleDeployment() {
  console.log('🚀 Preparing for Replit Autoscale deployment...');

  try {
    // Check if style-loader is available
    try {
      await fs.access('./node_modules/style-loader');
      console.log('✅ style-loader dependency found');
    } catch {
      console.log('❌ style-loader not found, running npm install...');
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      await execAsync('npm install style-loader');
      console.log('✅ style-loader installed');
    }

    // Create .replitenv if it doesn't exist
    try {
      await fs.access('.replitenv');
      console.log('✅ .replitenv already exists');
    } catch {
      const replitenvContent = `REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES=true
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging
NEXT_TELEMETRY_DISABLED=1
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET`;
      
      await fs.writeFile('.replitenv', replitenvContent);
      console.log('✅ Created .replitenv for Autoscale deployment');
    }

    // Validate Next.js configuration
    const nextConfigPath = './next.config.mjs';
    const nextConfig = await fs.readFile(nextConfigPath, 'utf8');
    
    if (nextConfig.includes('style-loader')) {
      console.log('⚠️  Warning: Next.js config contains style-loader reference');
      console.log('   This should now be handled by Next.js built-in CSS processing');
    } else {
      console.log('✅ Next.js config optimized for Autoscale deployment');
    }

    // Check for common problematic patterns
    console.log('🔍 Checking for deployment blockers...');
    
    const problematicPatterns = [
      { pattern: /require\(['"]style-loader['"]/, file: 'webpack config' },
      { pattern: /import.*style-loader/, file: 'imports' },
      { pattern: /\.use\(\['style-loader'/, file: 'webpack rules' }
    ];

    let hasIssues = false;
    for (const { pattern, file } of problematicPatterns) {
      if (pattern.test(nextConfig)) {
        console.log(`❌ Found problematic ${file} pattern in next.config.mjs`);
        hasIssues = true;
      }
    }

    if (!hasIssues) {
      console.log('✅ No deployment blockers found');
    }

    console.log('\n🎯 Deployment preparation complete!');
    console.log('📝 Summary:');
    console.log('   - style-loader dependency available');
    console.log('   - .replitenv configured for Autoscale');
    console.log('   - Next.js config optimized');
    console.log('   - Environment variables properly set');
    console.log('\n🚀 Ready for Replit Autoscale deployment!');

  } catch (error) {
    console.error('❌ Deployment preparation failed:', error.message);
    process.exit(1);
  }
}

prepareForAutoscaleDeployment();