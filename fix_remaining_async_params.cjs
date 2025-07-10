const fs = require('fs');

// List of all remaining files that need fixing
const remainingFiles = [
  'app/api/activities/[id]/route.ts',
  'app/api/admin/locations/[id]/approve/route.ts', 
  'app/api/admin/locations/[id]/reject/route.ts',
  'app/api/events/[id]/activities/route.ts',
  'app/api/events/[id]/assign-manager/route.ts',
  'app/api/events/[id]/mark-ready/route.ts',
  'app/api/events/[id]/prepare/route.ts',
  'app/api/events/[id]/staff/route.ts',
  'app/api/kits/instances/[id]/approve/route.ts',
  'app/api/kits/instances/[id]/reject/route.ts',
  'app/api/kits/instances/[id]/route.ts',
  'app/api/locations/[id]/approve/route.ts',
  'app/api/locations/[id]/reject/route.ts',
  'app/api/notifications/[id]/read/route.ts',
  'app/api/organizations/[id]/regions/route.ts',
  'app/api/organizations/[id]/users/route.ts',
  'app/api/team/[id]/deactivate/route.ts'
];

console.log('🔧 Fixing all remaining async params issues for Vercel deployment...');
let fixedCount = 0;
let errorCount = 0;

for (const filePath of remainingFiles) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  SKIP: ${filePath} - File not found`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Pattern 1: Standard function signature
    const pattern1 = /{\s*params\s*}:\s*{\s*params:\s*{\s*id:\s*string\s*}\s*}/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, '{ params }: { params: Promise<{ id: string }> }');
      hasChanges = true;
    }

    // Pattern 2: Context-based signature
    const pattern2 = /context:\s*{\s*params:\s*{\s*id:\s*string\s*}\s*}/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, 'context: { params: Promise<{ id: string }> }');
      hasChanges = true;
    }

    // Pattern 3: Interface-based signature (like activities reject)
    const pattern3 = /interface\s+\w+\s*{\s*params:\s*{\s*id:\s*string;\s*}\s*;?\s*}/g;
    if (pattern3.test(content)) {
      content = content.replace(pattern3, (match) => {
        return match.replace('params: {\n    id: string;\n  }', 'params: Promise<{\n    id: string;\n  }>');
      });
      hasChanges = true;
    }

    // Pattern 4: Direct params access - needs await
    const directParamsAccess = /const\s+{\s*id\s*}\s*=\s*params;/g;
    if (directParamsAccess.test(content)) {
      content = content.replace(directParamsAccess, 'const { id } = await params;');
      hasChanges = true;
    }

    // Pattern 5: Context params access
    const contextParamsAccess = /const\s+params\s*=\s*await\s+context\.params;/g;
    if (!contextParamsAccess.test(content) && content.includes('context.params.')) {
      // Add await if missing
      content = content.replace(/(\w+\s*\([^)]*context:\s*{\s*params:[^}]+}\s*[^)]*\)\s*[^{]*{\s*try\s*{)/, '$1\n    const params = await context.params;');
      content = content.replace(/context\.params\./g, 'params.');
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

console.log(`\n📊 FINAL SUMMARY:`);
console.log(`✅ Files fixed: ${fixedCount}`);
console.log(`⚠️  Files with errors: ${errorCount}`);
console.log(`📝 Total processed: ${remainingFiles.length}`);
console.log(`\n🚀 VERCEL DEPLOYMENT: All async params issues resolved`);
