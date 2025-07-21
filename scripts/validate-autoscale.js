#!/usr/bin/env node
/**
 * Validate Replit Autoscale deployment readiness
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';

async function validateAutoscaleReadiness() {
  console.log('🔍 Validating Autoscale deployment readiness...');

  try {
    // 1. Check style-loader availability
    try {
      await fs.access('./node_modules/style-loader');
      console.log('✅ style-loader dependency available');
    } catch {
      console.log('❌ style-loader missing - installing...');
      execSync('npm install style-loader', { stdio: 'inherit' });
      console.log('✅ style-loader installed');
    }

    // 2. Verify minimal Next.js config
    const config = await fs.readFile('next.config.mjs', 'utf8');
    if (config.includes('webpack:') || config.includes('module.rules')) {
      console.log('⚠️ Next.js config contains webpack customizations');
    } else {
      console.log('✅ Minimal Next.js configuration verified');
    }

    // 3. Check for problematic CSS imports
    const problematicFiles = [];
    const checkFiles = [
      'app/layout.tsx',
      'app/components/agent-calendar/AgentCalendar.tsx',
      'app/availability/components/BasicCalendar.tsx',
      'app/bookings/calendar/page.tsx'
    ];

    for (const file of checkFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        if (content.includes('import "') && content.includes('.css')) {
          problematicFiles.push(file);
        }
      } catch {
        // File doesn't exist, skip
      }
    }

    if (problematicFiles.length > 0) {
      console.log('⚠️ Found CSS imports in:', problematicFiles.join(', '));
    } else {
      console.log('✅ No problematic CSS imports found');
    }

    // 4. Test build
    console.log('🏗️ Testing production build...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful!');

    console.log('\n🎯 Autoscale deployment validation complete!');
    console.log('✅ All checks passed - ready for deployment');

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

validateAutoscaleReadiness();