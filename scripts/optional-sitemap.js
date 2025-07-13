#!/usr/bin/env node
/**
 * Optional sitemap generation script
 * Runs next-sitemap if available, otherwise continues successfully
 */

const { execSync } = require('child_process');

try {
  console.log('Attempting to generate sitemap...');
  execSync('npx next-sitemap', { stdio: 'inherit' });
  console.log('✓ Sitemap generated successfully');
} catch (error) {
  console.log('⚠️  Sitemap generation skipped (not critical for deployment)');
  console.log('Deployment will continue without sitemap generation');
  // Exit with success code to not block deployment
  process.exit(0);
}