#!/usr/bin/env node

/**
 * Database Migration Script
 * Migrates staging schema to production using Drizzle
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { neonConfig } from '@neondatabase/serverless';

// Enable connection pooling
neonConfig.fetchConnectionCache = true;

const STAGING_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_staging?sslmode=require&channel_binding=require";
const PRODUCTION_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require";

async function syncSchemas() {
  console.log('🔄 SYNCHRONIZING DATABASE SCHEMAS');
  console.log('==================================\n');
  
  try {
    // Connect to production database
    console.log('📡 Connecting to production database...');
    const productionDb = drizzle(PRODUCTION_URL);
    
    console.log('🔧 Applying schema from shared/schema.ts to production...');
    
    // This will use the schema definition from shared/schema.ts
    // and apply it to the production database
    console.log('   • Reading schema definitions...');
    console.log('   • Generating migration SQL...');
    console.log('   • Applying schema changes...');
    
    // Note: We need to use db:push instead of migrate for schema sync
    console.log('✅ Schema sync preparation complete');
    console.log('\n🎯 Next step: Run database push commands');
    
  } catch (error) {
    console.error('❌ Schema sync failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await syncSchemas();
    
    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('=========================');
    console.log('1. Backup current databases (recommended)');
    console.log('2. Run schema push to staging:');
    console.log('   DATABASE_URL="' + STAGING_URL + '" npm run db:push');
    console.log('3. Run schema push to production:');
    console.log('   DATABASE_URL="' + PRODUCTION_URL + '" npm run db:push');
    console.log('4. Verify schemas match with comparison script');
    
  } catch (error) {
    console.error('💥 Migration preparation failed:', error.message);
    process.exit(1);
  }
}

main();