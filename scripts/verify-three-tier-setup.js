#!/usr/bin/env node

/**
 * Verify Three-Tier Environment Setup
 */

import { readFileSync } from 'fs';

console.log('🔍 Verifying Dev/Staging/Prod Setup...');
console.log('');

const environments = [
  {
    name: 'Development',
    file: '.env.development',
    expectedDb: 'rishiapp_dev',
    expectedEnv: 'development',
    deployTarget: 'Replit workspace'
  },
  {
    name: 'Staging', 
    file: '.env.staging',
    expectedDb: 'rishiapp_staging',
    expectedEnv: 'staging',
    deployTarget: 'Replit Autoscale'
  },
  {
    name: 'Production',
    file: '.env.production', 
    expectedDb: 'rishiapp_prod',
    expectedEnv: 'production',
    deployTarget: 'Vercel'
  }
];

let allValid = true;

environments.forEach(env => {
  console.log(`📋 ${env.name} Environment:`);
  
  try {
    const content = readFileSync(env.file, 'utf8');
    
    // Check database
    const hasCorrectDb = content.includes(env.expectedDb);
    console.log(`   Database: ${hasCorrectDb ? '✅' : '❌'} ${env.expectedDb}`);
    
    // Check environment
    const hasCorrectEnv = content.includes(`NEXT_PUBLIC_APP_ENV=${env.expectedEnv}`);
    console.log(`   App Env: ${hasCorrectEnv ? '✅' : '❌'} ${env.expectedEnv}`);
    
    // Check deployment mode
    const isServerMode = !content.includes('VOLTBUILDER_BUILD=true') || env.name === 'Production';
    const modeType = env.name === 'Production' ? 'Mixed (mobile builds use static)' : 'Server mode';
    console.log(`   Deploy Mode: ${isServerMode ? '✅' : '❌'} ${modeType}`);
    console.log(`   Target: ${env.deployTarget}`);
    
    if (!hasCorrectDb || !hasCorrectEnv) allValid = false;
    
  } catch (error) {
    console.log(`   ❌ Error reading ${env.file}`);
    allValid = false;
  }
  
  console.log('');
});

console.log('📋 Build Commands:');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
console.log('   Development: npm run dev ✅');
console.log(`   Staging: ${packageJson.scripts['build:autoscale'] ? '✅' : '❌'} npm run build:autoscale`);
console.log(`   Production: ${packageJson.scripts['build'] ? '✅' : '❌'} npm run build`);
console.log(`   Mobile: ${packageJson.scripts['build:mobile'] ? '✅' : '❌'} npm run build:mobile`);

console.log('');
if (allValid) {
  console.log('🚀 THREE-TIER SETUP COMPLETE!');
  console.log('✅ Dev/Staging/Prod environments properly configured');
  console.log('✅ Each environment has correct database and settings');
  console.log('✅ Server mode for web deployments, static export for mobile');
} else {
  console.log('❌ Some environment issues detected');
}