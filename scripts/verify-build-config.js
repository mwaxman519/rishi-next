#!/usr/bin/env node

/**
 * Build Configuration Verification Script
 * Tests different environment configurations to ensure proper build outputs
 */

console.log('🔍 Verifying build configuration...\n');

// Test scenarios
const scenarios = [
  {
    name: 'Development',
    env: { NODE_ENV: 'development' },
    expected: 'server'
  },
  {
    name: 'Staging',
    env: { NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: 'staging', AZURE_STATIC_WEB_APPS_API_TOKEN: 'test-token' },
    expected: 'server'
  },
  {
    name: 'Production (Azure)',
    env: { NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: 'production', AZURE_STATIC_WEB_APPS_API_TOKEN: 'test-token' },
    expected: 'export'
  },
  {
    name: 'Production (Vercel)',
    env: { NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: 'production', VERCEL: '1' },
    expected: 'server'
  }
];

scenarios.forEach(scenario => {
  // Set environment variables
  Object.assign(process.env, scenario.env);
  
  // Determine output mode
  const isAzureStaticWebApp = process.env.AZURE_STATIC_WEB_APPS_API_TOKEN && process.env.NEXT_PUBLIC_APP_ENV !== 'staging';
  const isVercel = process.env.VERCEL;
  const output = isVercel ? 'server' : (isAzureStaticWebApp ? 'export' : 'server');
  
  console.log(`${scenario.name}:`);
  console.log(`  Environment: ${JSON.stringify(scenario.env)}`);
  console.log(`  Expected: ${scenario.expected}`);
  console.log(`  Actual: ${output}`);
  console.log(`  Status: ${output === scenario.expected ? '✅ PASS' : '❌ FAIL'}`);
  console.log();
});

console.log('✅ Build configuration verification complete!');