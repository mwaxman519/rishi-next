#!/usr/bin/env node

// Test script to validate environment segregation
const { exec } = require('child_process');
const fs = require('fs');

console.log('🔍 Testing Environment Segregation...\n');

// Test 1: Verify staging environment validation
console.log('Test 1: Staging database validation');
const testStagingValidation = () => {
  // Set environment to staging with production database (should fail)
  process.env.NODE_ENV = 'staging';
  process.env.NEXT_PUBLIC_APP_ENV = 'staging';
  process.env.DATABASE_URL = 'postgresql://rishinext_owner:npg_R9Nls4nUkrZt@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext?sslmode=require&channel_binding=require';
  
  try {
    // This should throw an error
    require('./lib/db.ts');
    console.log('❌ FAILED: Staging accepted production database');
  } catch (error) {
    if (error.message.includes('CRITICAL: Staging environment cannot use production database!')) {
      console.log('✅ PASSED: Staging correctly rejected production database');
    } else {
      console.log('❌ FAILED: Unexpected error:', error.message);
    }
  }
};

// Test 2: Verify staging with correct database works
console.log('\nTest 2: Staging with correct database');
const testStagingCorrect = () => {
  process.env.NODE_ENV = 'staging';
  process.env.NEXT_PUBLIC_APP_ENV = 'staging';
  process.env.DATABASE_URL = 'postgresql://rishinext_owner:npg_R9Nls4nUkrZt@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext_staging?sslmode=require&channel_binding=require';
  
  try {
    delete require.cache[require.resolve('./lib/db.ts')];
    require('./lib/db.ts');
    console.log('✅ PASSED: Staging accepted correct staging database');
  } catch (error) {
    console.log('❌ FAILED: Staging rejected correct database:', error.message);
  }
};

// Test 3: Verify production database works
console.log('\nTest 3: Production database');
const testProduction = () => {
  process.env.NODE_ENV = 'production';
  process.env.NEXT_PUBLIC_APP_ENV = 'production';
  process.env.DATABASE_URL = 'postgresql://rishinext_owner:npg_R9Nls4nUkrZt@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext?sslmode=require&channel_binding=require';
  
  try {
    delete require.cache[require.resolve('./lib/db.ts')];
    require('./lib/db.ts');
    console.log('✅ PASSED: Production accepted production database');
  } catch (error) {
    console.log('❌ FAILED: Production rejected production database:', error.message);
  }
};

// Run tests
testStagingValidation();
testStagingCorrect();
testProduction();

console.log('\n✅ Environment segregation validation complete!');