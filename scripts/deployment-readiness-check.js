#!/usr/bin/env node

/**
 * Deployment Readiness Check Script
 * Validates that all fixes are ready for production deployment
 */

import fs from 'fs';
import path from 'path';

function checkDeploymentReadiness() {
  console.log('🔍 Checking Deployment Readiness...');
  
  const checks = [
    {
      name: 'CSS MIME Type Fix',
      check: () => {
        const nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
        return nextConfig.includes('Content-Type') && nextConfig.includes('text/css');
      }
    },
    {
      name: 'Vercel Configuration',
      check: () => {
        return fs.existsSync('vercel.json');
      }
    },
    {
      name: 'Documentation Error Handling',
      check: () => {
        return fs.existsSync('app/docs/error.tsx') && fs.existsSync('app/docs/not-found.tsx');
      }
    },
    {
      name: 'Production Documentation Safety',
      check: () => {
        const docsSlugPage = fs.readFileSync('app/docs/[...slug]/page.tsx', 'utf8');
        return docsSlugPage.includes('process.env.NODE_ENV === \'production\'');
      }
    },
    {
      name: 'Documentation Main Page Production Safety',
      check: () => {
        const docsPage = fs.readFileSync('app/docs/page.tsx', 'utf8');
        return docsPage.includes('process.env.NODE_ENV === \'production\'');
      }
    },
    {
      name: 'Authentication Cookie Fix',
      check: () => {
        const authCheckRoute = fs.readFileSync('app/api/auth/check-permission/route.ts', 'utf8');
        return authCheckRoute.includes('auth_token') && !authCheckRoute.includes('auth-token');
      }
    },
    {
      name: 'Package.json Build Scripts',
      check: () => {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return packageJson.scripts.build && packageJson.scripts.postbuild;
      }
    }
  ];

  let allPassed = true;
  
  checks.forEach(check => {
    try {
      const result = check.check();
      if (result) {
        console.log(`✅ ${check.name} - READY`);
      } else {
        console.log(`❌ ${check.name} - NEEDS ATTENTION`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${check.name} - ERROR: ${error.message}`);
      allPassed = false;
    }
  });
  
  console.log('\n🎯 DEPLOYMENT READINESS SUMMARY:');
  if (allPassed) {
    console.log('✅ All checks passed - READY FOR DEPLOYMENT');
    console.log('🚀 The following fixes are ready for production:');
    console.log('   - CSS MIME type headers configuration');
    console.log('   - Vercel static asset handling');
    console.log('   - Documentation error handling system');
    console.log('   - Production documentation safety measures');
    console.log('   - Authentication cookie name correction');
    console.log('');
    console.log('📋 DEPLOYMENT INSTRUCTIONS:');
    console.log('1. Commit all changes to git');
    console.log('2. Deploy to Vercel (will automatically apply fixes)');
    console.log('3. Test production URLs after deployment');
  } else {
    console.log('❌ Some checks failed - REVIEW NEEDED');
  }
}

checkDeploymentReadiness();