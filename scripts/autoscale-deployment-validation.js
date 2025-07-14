#!/usr/bin/env node
/**
 * Autoscale Deployment Validation Script
 * 
 * Validates that the application is properly configured for Replit Autoscale deployment
 * by checking critical files and configurations that commonly cause build failures.
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Validating Replit Autoscale Deployment Configuration...\n');

let hasErrors = false;

// Check 1: EventBusService file exists
const eventBusServicePath = 'app/services/EventBusService.ts';
if (fs.existsSync(eventBusServicePath)) {
    console.log('✅ EventBusService.ts exists (backwards compatibility)');
} else {
    console.log('❌ EventBusService.ts missing - will cause module resolution failures');
    hasErrors = true;
}

// Check 2: next.config.mjs is configured for Replit Autoscale
const nextConfigPath = 'next.config.mjs';
if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check for proper Replit environment handling
    if (nextConfig.includes('process.env.REPLIT') && nextConfig.includes('undefined')) {
        console.log('✅ next.config.mjs properly configured for Replit Autoscale (no static export)');
    } else {
        console.log('❌ next.config.mjs not configured for Replit Autoscale - may cause build failures');
        hasErrors = true;
    }
    
    // Check for static export being disabled for Replit
    if (nextConfig.includes('!process.env.REPLIT')) {
        console.log('✅ Static export properly disabled for Replit Autoscale');
    } else {
        console.log('❌ Static export not properly disabled for Replit Autoscale');
        hasErrors = true;
    }
} else {
    console.log('❌ next.config.mjs missing');
    hasErrors = true;
}

// Check 3: AdvancedEventBus exists
const advancedEventBusPath = 'app/services/infrastructure/AdvancedEventBus.ts';
if (fs.existsSync(advancedEventBusPath)) {
    console.log('✅ AdvancedEventBus.ts exists (unified event system)');
} else {
    console.log('❌ AdvancedEventBus.ts missing - event system will fail');
    hasErrors = true;
}

// Check 4: Critical import compatibility files
const criticalFiles = [
    'app/services/infrastructure/distributedEventBus.ts',
    'app/services/infrastructure/eventBus.ts'
];

criticalFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${filePath} exists (backwards compatibility)`);
    } else {
        console.log(`❌ ${filePath} missing - will cause import failures`);
        hasErrors = true;
    }
});

// Check 5: Environment variable configuration
const envFiles = ['.env.development', '.env.production', '.env.local'];
let envFound = false;

envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
        envFound = true;
        console.log(`✅ ${envFile} exists`);
    }
});

if (!envFound) {
    console.log('⚠️  No environment files found - may cause runtime issues');
}

// Check 6: Database configuration
const dbConfigPath = 'app/db.ts';
if (fs.existsSync(dbConfigPath)) {
    console.log('✅ Database configuration exists');
} else {
    console.log('❌ Database configuration missing - will cause runtime failures');
    hasErrors = true;
}

// Check 7: Package.json for required dependencies
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const requiredDeps = ['next', 'react', 'react-dom', 'drizzle-orm'];
    const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );
    
    if (missingDeps.length === 0) {
        console.log('✅ All required dependencies present');
    } else {
        console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
        hasErrors = true;
    }
} else {
    console.log('❌ package.json missing');
    hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
    console.log('❌ DEPLOYMENT VALIDATION FAILED');
    console.log('   Fix the above issues before attempting Replit Autoscale deployment');
    process.exit(1);
} else {
    console.log('✅ DEPLOYMENT VALIDATION PASSED');
    console.log('   Application is ready for Replit Autoscale deployment');
    console.log('\n🚀 To deploy to Replit Autoscale:');
    console.log('   1. Set environment to production/staging');
    console.log('   2. Ensure REPLIT=true environment variable is set');
    console.log('   3. Run: npm run build (will use serverless mode)');
    console.log('   4. Deploy using Replit Autoscale interface');
}