#!/usr/bin/env node

/**
 * Quick Build Test Script
 * Tests if the main compilation issues are fixed
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Testing build fixes...');

// Test 1: Check if problematic files exist and have correct syntax
const problematicFiles = [
  'app/api/availability/route.ts',
  'app/api/kits/route.ts', 
  'app/kits/templates/client-page.tsx'
];

console.log('\n📋 Checking problematic files:');
problematicFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
    
    // Check for specific issues
    const content = fs.readFileSync(file, 'utf8');
    
    if (file.includes('availability/route.ts')) {
      if (!content.includes('availabilityService.createAvailabilityBlock')) {
        console.log(`   ✅ AvailabilityService call removed`);
      } else {
        console.log(`   ❌ AvailabilityService call still present`);
      }
    }
    
    if (file.includes('kits/route.ts')) {
      const userDeclarations = (content.match(/const user = await getCurrentUser\(\)/g) || []).length;
      if (userDeclarations === 1) {
        console.log(`   ✅ Duplicate user declaration fixed`);
      } else {
        console.log(`   ❌ Found ${userDeclarations} user declarations`);
      }
    }
    
    if (file.includes('client-page.tsx')) {
      if (!content.includes('SelectContent>') || content.trim().endsWith('}')) {
        console.log(`   ✅ Orphaned JSX removed`);
      } else {
        console.log(`   ❌ Orphaned JSX still present`);
      }
    }
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🏗️ Testing compilation (quick check)...');
try {
  // Just check TypeScript compilation without full build
  execSync('npx tsc --noEmit --skipLibCheck', { 
    stdio: 'pipe',
    timeout: 30000
  });
  console.log('✅ TypeScript compilation passed');
} catch (error) {
  console.log('❌ TypeScript compilation failed:');
  console.log(error.stdout?.toString() || error.message);
}

console.log('\n✨ Test complete!');