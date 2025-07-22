#!/usr/bin/env node

/**
 * Apply Build-Time Safety to API Routes
 * Prevents database calls during Next.js static generation
 */

const fs = require('fs');
const path = require('path');

console.log('🛡️ Applying build-time safety to API routes...');

// Routes that need build-time safety (GET endpoints that might be called during static generation)
const criticalRoutes = [
  'app/api/admin/organizations/route.ts',
  'app/api/admin/users/route.ts', 
  'app/api/admin/locations/route.ts',
  'app/api/bookings/route.ts',
  'app/api/locations/route.ts',
  'app/api/organizations/route.ts'
];

// Build-time safety guard template
const buildSafetyGuard = `    // BUILD-TIME SAFETY: Prevent database calls during static generation
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({
        message: "Build-time: Static generation mode - database operations disabled",
        data: []
      });
    }

`;

let routesUpdated = 0;

criticalRoutes.forEach(routePath => {
  if (fs.existsSync(routePath)) {
    try {
      let content = fs.readFileSync(routePath, 'utf8');
      
      // Add build safety to GET methods if not already present
      if (content.includes('export async function GET') && 
          !content.includes('BUILD-TIME SAFETY') &&
          !content.includes('NEXT_PHASE')) {
        
        // Insert safety guard after the first try block
        content = content.replace(
          /export async function GET[^{]*{\s*try\s*{/,
          match => match + '\n' + buildSafetyGuard
        );
        
        fs.writeFileSync(routePath, content);
        console.log(`✅ Applied build safety to ${routePath}`);
        routesUpdated++;
      } else {
        console.log(`⏭️ Skipped ${routePath} (already safe or no GET method)`);
      }
    } catch (error) {
      console.log(`⚠️ Could not process ${routePath}: ${error.message}`);
    }
  } else {
    console.log(`⚠️ Route not found: ${routePath}`);
  }
});

console.log(`\n🎯 Updated ${routesUpdated} routes with build-time safety`);
console.log('✅ Build safety application complete');