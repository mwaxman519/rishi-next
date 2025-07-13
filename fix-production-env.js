/**
 * Production Environment Variables Fix
 * This script ensures production uses the correct database
 */

const fs = require('fs');
const path = require('path');

// Ensure environment files exist
const envProd = `DATABASE_URL=postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
`;

fs.writeFileSync('.env.production', envProd);
console.log('✅ .env.production file updated');

// Create a small change to trigger deployment
const timestamp = new Date().toISOString();
const deploymentTrigger = `# Production Database Fix - ${timestamp}
This file triggers a new deployment to apply the updated DATABASE_URL environment variable.
Production database: rishiapp_prod
Status: Ready for deployment
`;

fs.writeFileSync('DEPLOYMENT_TRIGGER.md', deploymentTrigger);
console.log('✅ Deployment trigger created');
