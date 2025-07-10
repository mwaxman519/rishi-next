#!/usr/bin/env node

/**
 * Check Secrets Script for Deployment
 * Validates that all required secrets are present for deployment
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking deployment secrets...');

const requiredSecrets = [
  'DATABASE_URL',
  'NEON_DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
];

const missingSecrets = [];

requiredSecrets.forEach(secret => {
  if (!process.env[secret]) {
    missingSecrets.push(secret);
  }
});

if (missingSecrets.length > 0) {
  console.log('❌ Missing required secrets:');
  missingSecrets.forEach(secret => {
    console.log(`  - ${secret}`);
  });
  
  console.log('\n📋 To fix deployment, set these secrets in your deployment environment:');
  console.log('For Vercel: Use the dashboard or `vercel env add`');
  console.log('For Replit: Use the Secrets tab');
  console.log('For Azure: Use environment variables in configuration');
  
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
} else {
  console.log('✅ All required secrets are present');
}

// Check database connectivity
if (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL) {
  console.log('✅ Database URL configured');
} else {
  console.log('❌ No database URL configured');
}

console.log('✅ Secret check completed');