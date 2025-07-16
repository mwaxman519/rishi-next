#!/usr/bin/env node

/**
 * Test Production Issues Script
 * Tests the current production deployment status and issues
 */

const PRODUCTION_URL = 'https://rishi-next.vercel.app';

async function testProductionIssues() {
  console.log('🔍 Testing Production Issues...');
  
  const tests = [
    {
      name: 'CSS File Serving',
      url: `${PRODUCTION_URL}/_next/static/css/app/layout.css`,
      expected: 'text/css'
    },
    {
      name: 'Documentation Main Page',
      url: `${PRODUCTION_URL}/docs`,
      expected: 'text/html'
    },
    {
      name: 'Documentation README',
      url: `${PRODUCTION_URL}/docs/README`,
      expected: 'text/html'
    },
    {
      name: 'Authentication Login',
      url: `${PRODUCTION_URL}/api/auth-service/login`,
      expected: 'application/json'
    },
    {
      name: 'Error Monitor',
      url: `${PRODUCTION_URL}/api/error-monitor`,
      expected: 'application/json'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n📋 Testing: ${test.name}`);
      const response = await fetch(test.url);
      const contentType = response.headers.get('content-type');
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Content-Type: ${contentType}`);
      
      if (response.status === 200) {
        console.log(`  ✅ ${test.name} - OK`);
      } else {
        console.log(`  ❌ ${test.name} - ERROR ${response.status}`);
        if (response.status === 500) {
          const errorText = await response.text();
          console.log(`  Error preview: ${errorText.substring(0, 200)}...`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} - FAILED: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Summary: Production deployment needs updates to fix these issues');
}

testProductionIssues();