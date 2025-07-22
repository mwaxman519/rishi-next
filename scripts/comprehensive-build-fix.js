#!/usr/bin/env node

/**
 * Comprehensive VoltBuilder Build Fix
 * Applies all necessary fixes for successful mobile app builds
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Comprehensive VoltBuilder Build Fix\n');

// 1. Fix API routes with build-time safety
console.log('1️⃣ Applying build-time safety guards...');

const criticalFiles = [
  'app/api/admin/organizations/route.ts',
  'app/api/admin/users/route.ts',
  'app/api/organizations/route.ts',
  'app/api/users/route.ts'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (!content.includes('BUILD-TIME SAFETY') && content.includes('export async function GET')) {
      // Add build-time guard
      content = content.replace(
        /(export async function GET[^{]*{\s*try\s*{)/,
        `$1
    // BUILD-TIME SAFETY: Return empty data during static generation
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ data: [], message: "Build-time static generation" });
    }
`
      );
      
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed ${file}`);
    }
  }
});

// 2. Verify environment configuration
console.log('\n2️⃣ Verifying environment configuration...');

const voltbuilderEnv = `.env.voltbuilder`;
if (fs.existsSync(voltbuilderEnv)) {
  const envContent = fs.readFileSync(voltbuilderEnv, 'utf8');
  if (envContent.includes('DATABASE_URL=') && envContent.includes('NODE_ENV=production')) {
    console.log('✅ VoltBuilder environment configured correctly');
  } else {
    console.log('⚠️ VoltBuilder environment needs verification');
  }
} else {
  console.log('❌ .env.voltbuilder not found');
}

// 3. Check build script
console.log('\n3️⃣ Verifying build script...');

const buildScript = 'scripts/build-for-voltbuilder.sh';
if (fs.existsSync(buildScript)) {
  console.log('✅ VoltBuilder build script exists');
} else {
  console.log('❌ VoltBuilder build script missing');
}

console.log('\n🎯 Comprehensive build fix completed');
console.log('Ready for VoltBuilder deployment testing');