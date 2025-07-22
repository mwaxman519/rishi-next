#!/usr/bin/env node

/**
 * Environment Separation Validation Script
 * Ensures proper database separation between environments
 */

console.log('🔐 Environment Separation Validation\n');

// Check environment variables
const envs = {
  'NODE_ENV': process.env.NODE_ENV,
  'VERCEL_ENV': process.env.VERCEL_ENV,
  'NEXT_PHASE': process.env.NEXT_PHASE,
  'DATABASE_URL': process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET',
  'DEV_DATABASE_URL': process.env.DEV_DATABASE_URL ? '✅ SET' : '❌ NOT SET',
  'STAGING_DATABASE_URL': process.env.STAGING_DATABASE_URL ? '✅ SET' : '❌ NOT SET',
  'PRODUCTION_DATABASE_URL': process.env.PRODUCTION_DATABASE_URL ? '✅ SET' : '❌ NOT SET',
  'FORCE_ENVIRONMENT': process.env.FORCE_ENVIRONMENT || 'NOT SET'
};

console.log('Environment Variables:');
Object.entries(envs).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('\n🧪 Testing Environment Detection:');

// Test different scenarios
const scenarios = [
  { 
    name: 'Development Server',
    env: { NODE_ENV: 'development' },
    expected: 'development'
  },
  { 
    name: 'Production Build',
    env: { NODE_ENV: 'production', NEXT_PHASE: 'phase-production-build' },
    expected: 'staging' // Should use staging unless PRODUCTION_DATABASE_URL is set
  },
  { 
    name: 'Vercel Production',
    env: { VERCEL_ENV: 'production' },
    expected: 'production'
  },
  { 
    name: 'Replit Autoscale',
    env: { REPLIT: '1' },
    expected: 'staging'
  }
];

// Simulate environment detection function
function detectEnvironment(testEnv) {
  const originalEnv = { ...process.env };
  
  // Set test environment
  Object.assign(process.env, testEnv);
  
  // Simulate the logic
  if (process.env.FORCE_ENVIRONMENT) {
    return process.env.FORCE_ENVIRONMENT;
  }
  
  if (process.env.NODE_ENV === "development" && 
      process.env.NEXT_PHASE !== 'phase-production-build') {
    return "development";
  }
  
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL === "1") {
    return "production";
  }
  
  if (process.env.REPLIT === "1" || 
      process.env.REPLIT_DEPLOYMENT === "1" || 
      process.env.REPLIT_DOMAINS ||
      process.env.DEPLOY_ENV === "staging" ||
      process.env.NEXT_PUBLIC_APP_ENV === "staging") {
    return "staging";
  }
  
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    if (process.env.PRODUCTION_DATABASE_URL || process.env.FORCE_ENVIRONMENT === "production") {
      return "production";
    }
    return "staging";
  }
  
  if (process.env.NODE_ENV === "production") {
    return "production";
  }
  
  // Restore original environment
  process.env = originalEnv;
  
  return "development";
}

scenarios.forEach(scenario => {
  const result = detectEnvironment(scenario.env);
  const status = result === scenario.expected ? '✅' : '❌';
  console.log(`  ${status} ${scenario.name}: ${result} (expected: ${scenario.expected})`);
});

console.log('\n🛡️ Security Recommendations:');

if (!process.env.DEV_DATABASE_URL && !process.env.STAGING_DATABASE_URL && !process.env.PRODUCTION_DATABASE_URL) {
  console.log('⚠️  Consider setting environment-specific database URLs:');
  console.log('   DEV_DATABASE_URL=postgresql://dev-database-url');
  console.log('   STAGING_DATABASE_URL=postgresql://staging-database-url');
  console.log('   PRODUCTION_DATABASE_URL=postgresql://production-database-url');
}

if (process.env.NODE_ENV === 'development' && process.env.DATABASE_URL?.includes('prod')) {
  console.log('🚨 WARNING: Development environment may be using production database!');
}

console.log('\n✅ Environment separation check complete');