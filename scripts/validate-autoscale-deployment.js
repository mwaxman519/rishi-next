#!/usr/bin/env node
/**
 * Comprehensive Replit Autoscale deployment validation
 * Verifies that the style-loader issues have been resolved
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';

async function validateDeployment() {
  console.log('🔍 Validating Replit Autoscale deployment readiness...\n');

  const checks = [];

  try {
    // 1. Check that CSS imports are centralized in layout.tsx
    console.log('1. Checking CSS import centralization...');
    const layoutContent = await fs.readFile('app/layout.tsx', 'utf8');
    const hasCalendarCSS = layoutContent.includes('calendar-fixes.css') && 
                          layoutContent.includes('calendar-buttons.css') && 
                          layoutContent.includes('react-big-calendar.css');
    
    if (hasCalendarCSS) {
      console.log('✅ CSS imports properly centralized in layout.tsx');
      checks.push(true);
    } else {
      console.log('❌ CSS imports missing from layout.tsx');
      checks.push(false);
    }

    // 2. Check that components no longer have direct CSS imports
    console.log('\n2. Checking component CSS import removal...');
    const agentCalendarContent = await fs.readFile('app/components/agent-calendar/AgentCalendar.tsx', 'utf8');
    const basicCalendarContent = await fs.readFile('app/availability/components/BasicCalendar.tsx', 'utf8');
    const bookingsCalendarContent = await fs.readFile('app/bookings/calendar/page.tsx', 'utf8');
    
    const hasDirectImports = agentCalendarContent.includes('import "./calendar') ||
                            basicCalendarContent.includes('import "../../components/agent-calendar') ||
                            bookingsCalendarContent.includes('import "react-big-calendar/lib/css');
    
    if (!hasDirectImports) {
      console.log('✅ Direct CSS imports removed from components');
      checks.push(true);
    } else {
      console.log('❌ Components still contain direct CSS imports');
      checks.push(false);
    }

    // 3. Check style-loader dependency availability
    console.log('\n3. Checking style-loader dependency...');
    try {
      execSync('npm list style-loader', { stdio: 'ignore' });
      console.log('✅ style-loader dependency available');
      checks.push(true);
    } catch {
      console.log('❌ style-loader dependency missing');
      checks.push(false);
    }

    // 4. Test build compilation
    console.log('\n4. Testing build compilation...');
    try {
      console.log('   Running test build...');
      execSync('NEXT_TELEMETRY_DISABLED=1 npm run build', { stdio: 'pipe' });
      console.log('✅ Build compilation successful');
      checks.push(true);
    } catch (error) {
      console.log('❌ Build compilation failed');
      console.log('   Error:', error.message);
      checks.push(false);
    }

    // 5. Check environment configuration
    console.log('\n5. Checking environment configuration...');
    try {
      const replitEnv = await fs.readFile('.replitenv', 'utf8');
      const hasRequiredVars = replitEnv.includes('REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES=true') &&
                             replitEnv.includes('NODE_ENV=production') &&
                             replitEnv.includes('NEXT_PUBLIC_APP_ENV=staging');
      
      if (hasRequiredVars) {
        console.log('✅ Environment variables properly configured');
        checks.push(true);
      } else {
        console.log('❌ Missing required environment variables');
        checks.push(false);
      }
    } catch {
      console.log('❌ .replitenv file not found');
      checks.push(false);
    }

    // Summary
    const passedChecks = checks.filter(Boolean).length;
    const totalChecks = checks.length;
    
    console.log(`\n📊 Validation Summary: ${passedChecks}/${totalChecks} checks passed\n`);
    
    if (passedChecks === totalChecks) {
      console.log('🎯 DEPLOYMENT READY');
      console.log('✅ All style-loader issues resolved');
      console.log('✅ CSS imports properly centralized');
      console.log('✅ Build compilation successful');
      console.log('✅ Environment configuration complete');
      console.log('\n🚀 Ready for Replit Autoscale deployment!');
      return true;
    } else {
      console.log('❌ DEPLOYMENT NOT READY');
      console.log(`${totalChecks - passedChecks} issues need to be resolved before deployment`);
      return false;
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

// Run validation
validateDeployment().then(success => {
  process.exit(success ? 0 : 1);
});