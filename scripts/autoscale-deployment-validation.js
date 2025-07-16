#!/usr/bin/env node

/**
 * Autoscale Deployment Validation Script
 * Validates that the application is ready for Replit Autoscale deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Validating Replit Autoscale deployment readiness...\n');

const validationChecks = [
  {
    name: 'Next.js Configuration',
    check: () => {
      const configPath = 'next.config.mjs';
      if (!fs.existsSync(configPath)) return { success: false, message: 'next.config.mjs not found' };
      
      const config = fs.readFileSync(configPath, 'utf8');
      if (config.includes('output: "export"')) return { success: false, message: 'Static export detected - use server mode for Autoscale' };
      if (config.includes('serverExternalPackages')) return { success: true, message: 'Server external packages configured' };
      
      return { success: true, message: 'Configuration looks good' };
    }
  },
  {
    name: 'Login Page Structure',
    check: () => {
      const loginPath = 'app/auth/login/page.tsx';
      if (!fs.existsSync(loginPath)) return { success: false, message: 'Login page not found' };
      
      const content = fs.readFileSync(loginPath, 'utf8');
      if (!content.includes('export default function LoginPage')) return { success: false, message: 'Invalid login page export' };
      
      return { success: true, message: 'Login page structure valid' };
    }
  },
  {
    name: 'Database Configuration',
    check: () => {
      const dbPath = 'app/lib/db-connection.ts';
      if (!fs.existsSync(dbPath)) return { success: false, message: 'Database connection file not found' };
      
      const content = fs.readFileSync(dbPath, 'utf8');
      if (!content.includes('DATABASE_URL')) return { success: false, message: 'DATABASE_URL not configured' };
      
      return { success: true, message: 'Database configuration present' };
    }
  },
  {
    name: 'API Routes Structure',
    check: () => {
      const apiPath = 'app/api';
      if (!fs.existsSync(apiPath)) return { success: false, message: 'API routes directory not found' };
      
      const authServicePath = path.join(apiPath, 'auth-service');
      if (!fs.existsSync(authServicePath)) return { success: false, message: 'Auth service routes not found' };
      
      return { success: true, message: 'API routes structure valid' };
    }
  },
  {
    name: 'Environment Variables',
    check: () => {
      const envPath = '.env.production';
      if (!fs.existsSync(envPath)) return { success: false, message: 'Production environment file not found' };
      
      const content = fs.readFileSync(envPath, 'utf8');
      if (!content.includes('NODE_ENV=production')) return { success: false, message: 'NODE_ENV not set to production' };
      
      return { success: true, message: 'Environment configuration looks good' };
    }
  }
];

let allPassed = true;

for (const check of validationChecks) {
  const result = check.check();
  const status = result.success ? '✅' : '❌';
  console.log(`${status} ${check.name}: ${result.message}`);
  
  if (!result.success) {
    allPassed = false;
  }
}

console.log('\n📊 Validation Summary:');
if (allPassed) {
  console.log('✅ All checks passed! Ready for Replit Autoscale deployment.');
} else {
  console.log('❌ Some checks failed. Please fix the issues above before deploying.');
}

console.log('\n🔗 Next steps:');
console.log('  1. Click "Deploy" button in Replit');
console.log('  2. Select "Autoscale" deployment option');
console.log('  3. Configure environment variables in deployment settings');
console.log('  4. Monitor deployment logs for any issues');

export default { validationChecks, allPassed };