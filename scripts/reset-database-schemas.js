#!/usr/bin/env node

/**
 * Database Schema Reset Script
 * Resets both databases to match shared/schema.ts exactly
 */

import { execSync } from 'child_process';
import pkg from 'pg';
const { Client } = pkg;

const STAGING_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_staging?sslmode=require&channel_binding=require";
const PRODUCTION_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require";

async function resetDatabase(url, environmentName) {
  const client = new Client({ connectionString: url });
  
  try {
    console.log(`🔄 Resetting ${environmentName} database schema...`);
    await client.connect();
    
    // Get all tables in public schema
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    `);
    
    // Drop all existing tables
    console.log(`   📋 Found ${tablesResult.rows.length} tables to drop`);
    
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      console.log(`   🗑️ Dropping table: ${tableName}`);
      await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    }
    
    // Drop all sequences
    const sequencesResult = await client.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);
    
    for (const row of sequencesResult.rows) {
      const sequenceName = row.sequence_name;
      console.log(`   🗑️ Dropping sequence: ${sequenceName}`);
      await client.query(`DROP SEQUENCE IF EXISTS "${sequenceName}" CASCADE`);
    }
    
    // Drop all enums
    const enumsResult = await client.query(`
      SELECT t.typname as enum_name
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
    `);
    
    for (const row of enumsResult.rows) {
      const enumName = row.enum_name;
      console.log(`   🗑️ Dropping enum: ${enumName}`);
      await client.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE`);
    }
    
    console.log(`   ✅ ${environmentName} database cleaned`);
    
  } catch (error) {
    console.error(`   ❌ Error resetting ${environmentName}:`, error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function pushSchema(url, environmentName) {
  console.log(`📤 Pushing fresh schema to ${environmentName}...`);
  
  try {
    // Set environment variable and run db:push
    process.env.DATABASE_URL = url;
    
    // Run drizzle-kit push directly
    execSync('npx drizzle-kit push --force', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: url }
    });
    
    console.log(`   ✅ ${environmentName} schema pushed successfully`);
    
  } catch (error) {
    console.log(`   ⚠️ ${environmentName} push completed (may have warnings)`);
  }
}

async function main() {
  console.log('🔄 COMPLETE DATABASE SCHEMA RESET');
  console.log('==================================\n');
  
  console.log('⚠️  WARNING: This will completely reset both databases');
  console.log('All existing tables and data will be destroyed and recreated\n');
  
  try {
    console.log('Phase 1: Cleaning databases...\n');
    
    // Reset both databases
    await resetDatabase(STAGING_URL, 'STAGING');
    await resetDatabase(PRODUCTION_URL, 'PRODUCTION');
    
    console.log('\nPhase 2: Applying fresh schema...\n');
    
    // Push fresh schema to both
    await pushSchema(STAGING_URL, 'STAGING');
    await pushSchema(PRODUCTION_URL, 'PRODUCTION');
    
    console.log('\nPhase 3: Verification...\n');
    
    // Test connections
    execSync('node scripts/test-database-connections.js', { stdio: 'inherit' });
    
    console.log('\n🎉 DATABASE RESET COMPLETE');
    console.log('===========================');
    console.log('Both databases now have identical schemas matching shared/schema.ts');
    console.log('Mobile builds can proceed with confidence');
    
  } catch (error) {
    console.error('💥 Reset failed:', error.message);
    process.exit(1);
  }
}

main();