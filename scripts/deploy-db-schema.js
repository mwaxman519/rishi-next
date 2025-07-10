#!/usr/bin/env node
/**
 * Database Schema Deployment Script
 * This script should be run during deployment to ensure database schema is up-to-date
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're in a deployment environment
const isDeployment = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

if (!isDeployment) {
  console.log('Not in deployment environment, skipping schema deployment');
  process.exit(0);
}

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable not found');
  process.exit(1);
}

console.log('Starting database schema deployment...');

try {
  // Run drizzle migrations
  console.log('Running database migrations...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  
  // Check if initial data needs to be seeded
  const seedScript = path.join(__dirname, '..', 'scripts', 'seed-initial-data.js');
  if (fs.existsSync(seedScript)) {
    console.log('Seeding initial data...');
    execSync(`node ${seedScript}`, { stdio: 'inherit' });
  }
  
  console.log('Database schema deployment completed successfully');
} catch (error) {
  console.error('Database schema deployment failed:', error.message);
  process.exit(1);
}