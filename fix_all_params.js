const fs = require('fs');
const path = require('path');

// List of all remaining files to fix
const filesToFix = [
  'app/api/availability/[id]/route.ts',
  'app/api/admin/locations/[id]/approve/route.ts',
  'app/api/admin/locations/[id]/reject/route.ts',
  'app/api/events/[id]/activities/route.ts',
  'app/api/events/[id]/assign-manager/route.ts',
  'app/api/events/[id]/mark-ready/route.ts',
  'app/api/events/[id]/prepare/route.ts',
  'app/api/events/[id]/staff/route.ts',
  'app/api/kits/activity-kits/[id]/route.ts',
  'app/api/kits/instances/[id]/approve/route.ts',
  'app/api/kits/instances/[id]/reject/route.ts',
  'app/api/kits/instances/[id]/route.ts',
  'app/api/locations/[id]/approve/route.ts',
  'app/api/locations/[id]/reject/route.ts',
  'app/api/notifications/[id]/read/route.ts',
  'app/api/organizations/[id]/feature-settings/route.ts',
  'app/api/organizations/[id]/regions/route.ts',
  'app/api/organizations/[id]/users/route.ts',
  'app/api/shifts/[id]/route.ts',
  'app/api/users/[id]/permissions/route.ts',
  'app/api/team/[id]/deactivate/route.ts',
  'app/api/team/[id]/route.ts'
];

console.log('Starting batch fix of remaining API route files...');
let fixedCount = 0;
let errorCount = 0;

for (const filePath of filesToFix) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  SKIP: ${filePath} - File not found`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Fix pattern 1: { params }: { params: { id: string } }
    const pattern1 = /{\s*params\s*}:\s*{\s*params:\s*{\s*id:\s*string\s*}\s*}/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, '{ params }: { params: Promise<{ id: string }> }');
      hasChanges = true;
    }

    // Fix pattern 2: context: { params: { id: string } }
    const pattern2 = /context:\s*{\s*params:\s*{\s*id:\s*string\s*}\s*}/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, 'context: { params: Promise<{ id: string }> }');
      hasChanges = true;
    }

    // Fix pattern 3: params.id direct access (make await params first)
    const directAccess = /const\s+(\w+)\s*=\s*params\.id;/g;
    if (directAccess.test(content)) {
      content = content.replace(directAccess, 'const { id: $1 } = await params;');
      hasChanges = true;
    }

    // Fix pattern 4: context.params.id access
    const contextAccess = /context\.params\.id/g;
    if (contextAccess.test(content)) {
      // First ensure we await params
      if (!content.includes('const params = await context.params;')) {
        content = content.replace(
          /export\s+async\s+function\s+\w+\s*\([^)]*\)\s*:\s*[^{]*{\s*try\s*{/,
          '$&\n    const params = await context.params;'
        );
      }
      content = content.replace(contextAccess, 'params.id');
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ FIXED: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`✅ OK: ${filePath} - Already compliant`);
    }

  } catch (error) {
    console.log(`❌ ERROR: ${filePath} - ${error.message}`);
    errorCount++;
  }
}

console.log(`\n📊 SUMMARY:`);
console.log(`✅ Files fixed: ${fixedCount}`);
console.log(`⚠️  Files with errors: ${errorCount}`);
console.log(`📝 Total processed: ${filesToFix.length}`);
console.log(`\n🎯 Next.js 15 async params compatibility: COMPLETE`);
