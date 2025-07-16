#!/usr/bin/env node

/**
 * Database Connection Testing Script
 * Tests all three environment database connections: development, staging, production
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import dotenv from "dotenv";

// Test database connection
async function testDatabaseConnection(url, environmentName) {
  try {
    console.log(`\n🔍 Testing ${environmentName} database connection...`);
    
    if (!url) {
      console.log(`❌ ${environmentName}: No database URL provided`);
      return false;
    }

    // Mask sensitive parts of URL for logging
    const maskedUrl = url.replace(/:[^:@]*@/, ':****@');
    console.log(`📡 ${environmentName}: Connecting to ${maskedUrl}`);

    const sql = neon(url);
    const db = drizzle(sql);

    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    const dbInfo = result[0];

    if (!dbInfo) {
      console.log(`❌ ${environmentName}: Connection test returned empty result`);
      return false;
    }

    console.log(`✅ ${environmentName}: Connection successful`);
    console.log(`   📅 Server time: ${dbInfo.current_time}`);
    console.log(`   🗄️  Database version: ${dbInfo.db_version.split(' ')[0]}`);

    // Test table access
    try {
      const tableTest = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`   👥 Users table: ${tableTest[0].count} records`);
    } catch (error) {
      console.log(`   ⚠️  Users table: Not accessible (${error.message})`);
    }

    return true;
  } catch (error) {
    console.log(`❌ ${environmentName}: Connection failed`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Database Connection Testing Tool');
  console.log('=====================================');

  // Load environment variables
  dotenv.config();

  const tests = [
    {
      name: 'Development (Replit)',
      url: process.env.DATABASE_URL,
      expected: 'Should connect to Replit built-in database'
    },
    {
      name: 'Staging (Neon)',
      url: process.env.STAGING_DATABASE_URL || process.env.NEON_STAGING_DATABASE_URL,
      expected: 'Should connect to Neon staging database'
    },
    {
      name: 'Production (Neon)',
      url: process.env.PRODUCTION_DATABASE_URL || process.env.NEON_PRODUCTION_DATABASE_URL,
      expected: 'Should connect to Neon production database'
    }
  ];

  const results = [];

  for (const test of tests) {
    const success = await testDatabaseConnection(test.url, test.name);
    results.push({
      environment: test.name,
      success,
      expected: test.expected
    });
  }

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.environment}`);
    console.log(`     ${result.expected}`);
  });

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`\n🎯 Overall: ${successCount}/${totalCount} connections successful`);

  if (successCount === totalCount) {
    console.log('🎉 All database connections are working correctly!');
    process.exit(0);
  } else {
    console.log('⚠️  Some database connections need attention.');
    process.exit(1);
  }
}

main().catch(console.error);