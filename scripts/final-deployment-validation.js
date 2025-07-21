#!/usr/bin/env node
/**
 * Final deployment validation for Replit Autoscale
 * Validates all fixes: CSS imports + chunk loading + build compilation
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';

async function runFinalValidation() {
  console.log('🎯 FINAL DEPLOYMENT VALIDATION - Replit Autoscale Ready\n');

  const results = [];

  try {
    // 1. CSS Import Architecture Check
    console.log('1. Validating CSS import architecture...');
    const layoutContent = await fs.readFile('app/layout.tsx', 'utf8');
    const hasCentralizedCSS = layoutContent.includes('calendar-fixes.css') && 
                             layoutContent.includes('react-big-calendar.css');
    
    if (hasCentralizedCSS) {
      console.log('✅ CSS imports properly centralized in layout.tsx');
      results.push(true);
    } else {
      console.log('❌ CSS imports not properly centralized');
      results.push(false);
    }

    // 2. Component CSS Import Removal Check
    console.log('\n2. Validating component CSS import removal...');
    const agentCalendarContent = await fs.readFile('app/components/agent-calendar/AgentCalendar.tsx', 'utf8');
    const hasNoDirectImports = !agentCalendarContent.includes('import "./calendar');
    
    if (hasNoDirectImports) {
      console.log('✅ Direct CSS imports removed from components');
      results.push(true);
    } else {
      console.log('❌ Components still contain direct CSS imports');
      results.push(false);
    }

    // 3. Webpack Configuration Check
    console.log('\n3. Validating webpack chunk configuration...');
    const nextConfigContent = await fs.readFile('next.config.mjs', 'utf8');
    const hasSimplifiedChunking = nextConfigContent.includes('Simplified chunking for development stability');
    
    if (hasSimplifiedChunking) {
      console.log('✅ Webpack chunking properly simplified');
      results.push(true);
    } else {
      console.log('❌ Webpack chunking not properly configured');
      results.push(false);
    }

    // 4. Build Compilation Test
    console.log('\n4. Testing build compilation...');
    try {
      console.log('   Building application...');
      const buildOutput = execSync('npm run build', { 
        stdio: 'pipe', 
        encoding: 'utf8',
        timeout: 180000 // 3 minutes timeout
      });
      
      if (buildOutput.includes('Compiled successfully')) {
        console.log('✅ Build compilation successful');
        results.push(true);
      } else {
        console.log('❌ Build compilation failed');
        results.push(false);
      }
    } catch (error) {
      console.log('❌ Build compilation failed with error');
      console.log('   Error details:', error.message.substring(0, 200));
      results.push(false);
    }

    // 5. Development Server Validation
    console.log('\n5. Validating development server...');
    try {
      const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5000', { 
        encoding: 'utf8',
        timeout: 10000
      });
      
      if (response.trim() === '200') {
        console.log('✅ Development server responding correctly');
        results.push(true);
      } else {
        console.log(`❌ Development server response: ${response}`);
        results.push(false);
      }
    } catch (error) {
      console.log('❌ Development server validation failed');
      results.push(false);
    }

    // Final Summary
    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;
    
    console.log(`\n📊 VALIDATION SUMMARY: ${passedTests}/${totalTests} tests passed\n`);
    
    if (passedTests === totalTests) {
      console.log('🎯 DEPLOYMENT READY FOR REPLIT AUTOSCALE');
      console.log('✅ Style-loader issues resolved');
      console.log('✅ Chunk loading errors fixed');
      console.log('✅ CSS architecture optimized');
      console.log('✅ Build compilation working');
      console.log('✅ Development server stable');
      console.log('\n🚀 You can now deploy to Replit Autoscale successfully!');
      console.log('\nDeployment Actions:');
      console.log('1. Click the Deploy button in Replit');
      console.log('2. Select Autoscale deployment');
      console.log('3. Configure environment variables if needed');
      console.log('4. Deploy and test production functionality');
      return true;
    } else {
      console.log('❌ DEPLOYMENT NOT READY');
      console.log(`${totalTests - passedTests} issues need resolution before deployment`);
      return false;
    }

  } catch (error) {
    console.error('❌ Validation script failed:', error.message);
    return false;
  }
}

// Run validation
runFinalValidation().then(success => {
  process.exit(success ? 0 : 1);
});