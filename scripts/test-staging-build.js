#!/usr/bin/env node

/**
 * Test staging build configuration
 * Simulates the staging build environment without the Azure token
 */

console.log('🧪 Testing staging build configuration...\n');

// Set staging environment variables
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_APP_ENV = 'staging';
// Remove Azure token for staging
delete process.env.AZURE_STATIC_WEB_APPS_API_TOKEN;

console.log('Environment variables set:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_APP_ENV:', process.env.NEXT_PUBLIC_APP_ENV);
console.log('AZURE_STATIC_WEB_APPS_API_TOKEN:', process.env.AZURE_STATIC_WEB_APPS_API_TOKEN || 'undefined');

// Test the output configuration logic
const isAzureStaticWebApp = process.env.AZURE_STATIC_WEB_APPS_API_TOKEN && process.env.NEXT_PUBLIC_APP_ENV !== 'staging';
const output = isAzureStaticWebApp ? 'export' : undefined;

console.log('\nOutput configuration:');
console.log('Static export enabled:', !!isAzureStaticWebApp);
console.log('Output mode:', output || 'server');

console.log('\n✅ Staging build should use server mode (no static export)');