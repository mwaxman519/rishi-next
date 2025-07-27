#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests staging and production Neon database connections
 */

import pkg from 'pg';
const { Client } = pkg;

// Database URLs
const STAGING_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_staging?sslmode=require&channel_binding=require";
const PRODUCTION_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require";

async function testConnection(url, environmentName) {
  const client = new Client({ connectionString: url });
  
  try {
    console.log(`🔌 Testing ${environmentName} database connection...`);
    
    // Connect to database
    await client.connect();
    console.log(`✅ Connected to ${environmentName} database successfully`);
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, current_database() as database_name');
    const { current_time, database_name } = result.rows[0];
    
    console.log(`   📊 Database: ${database_name}`);
    console.log(`   ⏰ Server Time: ${current_time}`);
    
    // Check if tables exist (basic schema validation)
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`   📋 Tables: ${tablesResult.rows.length} found`);
    if (tablesResult.rows.length > 0) {
      const tableNames = tablesResult.rows.slice(0, 5).map(row => row.table_name).join(', ');
      console.log(`   📝 Sample tables: ${tableNames}${tablesResult.rows.length > 5 ? '...' : ''}`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ ${environmentName} connection failed:`);
    console.log(`   Error: ${error.message}`);
    return false;
    
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('🔍 RISHI PLATFORM DATABASE CONNECTION TEST');
  console.log('==========================================');
  console.log('');
  
  const results = {
    staging: false,
    production: false
  };
  
  // Test staging database
  results.staging = await testConnection(STAGING_URL, 'STAGING');
  console.log('');
  
  // Test production database
  results.production = await testConnection(PRODUCTION_URL, 'PRODUCTION');
  console.log('');
  
  // Summary
  console.log('📊 CONNECTION TEST SUMMARY');
  console.log('===========================');
  console.log(`Staging Database:    ${results.staging ? '✅ CONNECTED' : '❌ FAILED'}`);
  console.log(`Production Database: ${results.production ? '✅ CONNECTED' : '❌ FAILED'}`);
  console.log('');
  
  if (results.staging && results.production) {
    console.log('🎉 ALL DATABASE CONNECTIONS SUCCESSFUL!');
    console.log('Mobile builds can proceed with confidence.');
  } else {
    console.log('⚠️  Some database connections failed.');
    console.log('Please check credentials and network connectivity.');
  }
  
  process.exit(results.staging && results.production ? 0 : 1);
}

main().catch(error => {
  console.error('💥 Test script error:', error.message);
  process.exit(1);
});