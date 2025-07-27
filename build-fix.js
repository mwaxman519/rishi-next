#!/usr/bin/env node

/**
 * Build Fix Script for Deployment
 * Ensures all components are properly available during build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Running build fix script...');

// Ensure lib directory exists
const libDir = path.join(__dirname, 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
  console.log('✅ Created lib directory');
}

// Check if components exist
const componentsDir = path.join(__dirname, 'components', 'ui');
if (fs.existsSync(componentsDir)) {
  console.log('✅ Components directory exists');
} else {
  console.log('⚠️  Components directory missing');
}

// Create fallback DATABASE_URL if needed
if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
  console.log('⚠️  DATABASE_URL not set - build may fail');
  
  // Check if this is a build environment
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.REPLIT_DEPLOYMENT) {
    console.log('🚨 Production build detected without DATABASE_URL');
    process.exit(1);
  }
}

console.log('✅ Build fix script completed');