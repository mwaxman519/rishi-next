#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Fix quote escaping issues for VoltBuilder ESLint compliance
function fixQuoteEscaping(content) {
  // Fix unescaped single quotes in JSX text content
  content = content.replace(/(\s)([^"]*)'([^"]*?)'/g, (match, space, before, after) => {
    // Only replace if it's in JSX text content (not in strings or attributes)
    if (before.includes('"') || after.includes('"')) {
      return match; // Skip if already in quotes
    }
    return `${space}${before}&apos;${after}`;
  });
  
  // Fix unescaped double quotes in JSX text content
  content = content.replace(/(\s)([^']*)"([^']*?)"/g, (match, space, before, after) => {
    // Only replace if it's in JSX text content (not in strings or attributes)
    if (before.includes("'") || after.includes("'")) {
      return match; // Skip if already in quotes
    }
    return `${space}${before}&quot;${after}`;
  });
  
  // More specific patterns for common cases
  content = content.replace(/Are you sure you want to delete the "([^"]+)"/g, 
    'Are you sure you want to delete the &quot;$1&quot;');
  
  content = content.replace(/Create new "([^"]+)" role/g, 
    'Create new &quot;$1&quot; role');
    
  content = content.replace(/organization's/g, 'organization&apos;s');
  content = content.replace(/user's/g, 'user&apos;s');
  content = content.replace(/can't/g, 'can&apos;t');
  content = content.replace(/don't/g, 'don&apos;t');
  content = content.replace(/won't/g, 'won&apos;t');
  content = content.replace(/isn't/g, 'isn&apos;t');
  content = content.replace(/doesn't/g, 'doesn&apos;t');
  content = content.replace(/haven't/g, 'haven&apos;t');
  content = content.replace(/couldn't/g, 'couldn&apos;t');
  content = content.replace(/wouldn't/g, 'wouldn&apos;t');
  content = content.replace(/shouldn't/g, 'shouldn&apos;t');
  
  return content;
}

function fixReactHooksIssues(content) {
  // Fix conditional hooks by moving them to the top of the component
  // This is a simple fix - more complex cases might need manual review
  
  // Pattern: if (condition) return <div>...</div>; followed by hooks
  content = content.replace(
    /(if\s*\([^)]+\)\s*return\s*<[^>]+>.*?<\/[^>]+>;)\s*(const\s+\[[^\]]+\]\s*=\s*useState)/gm,
    '$2\n\n  $1'
  );
  
  // Pattern: if (condition) { return <div>...</div>; } followed by hooks  
  content = content.replace(
    /(if\s*\([^)]+\)\s*{\s*return\s*<[^>]+>.*?<\/[^>]+>;\s*})\s*(const\s+\[[^\]]+\]\s*=\s*useState)/gm,
    '$2\n\n  $1'
  );
  
  return content;
}

function processFiles() {
  const filesToFix = [
    'app/admin/features/page.tsx',
    'app/admin/layout.tsx', 
    'app/admin/locations/[id]/not-found.tsx',
    'app/admin/locations/[id]/page.tsx',
    'app/admin/organizations/page.tsx',
    'app/admin/organizations/settings/page.tsx',
    'app/admin/rbac/users/[id]/page.tsx',
    'app/admin/roles/page.tsx',
    'app/admin/settings/page.tsx',
    'app/admin/system-settings/page.tsx',
    'app/admin/users/create/page.tsx',
    'app/admin/users/page.tsx',
    'app/availability/components/AgentAvailabilitySettings.tsx',
    'app/availability/standalone-page.tsx',
    'app/availability/team/calendar/page.tsx',
    'app/availability/team/page.tsx',
    'app/availability/working-page.tsx',
    'app/client-management/locations/page.tsx',
    'components/SidebarLayout.tsx'
  ];
  
  let fixedCount = 0;
  
  filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing ${filePath}...`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      content = fixQuoteEscaping(content);
      content = fixReactHooksIssues(content);
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        fixedCount++;
        console.log(`  ✅ Fixed quote escaping and hooks issues`);
      } else {
        console.log(`  ⏭️  No changes needed`);
      }
    } else {
      console.log(`  ❌ File not found: ${filePath}`);
    }
  });
  
  console.log(`\n🎉 Fixed ${fixedCount} files for VoltBuilder ESLint compliance`);
}

processFiles();