#!/usr/bin/env node

/**
 * Script to update critical @/ imports to relative paths for deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Critical directories/files that must be fixed for deployment
const CRITICAL_PATHS = [
  'app/lib',
  'app/api',
  'middleware.ts',
  'app/layout.tsx',
  'app/page.tsx',
  'app/auth',
  'app/components/ui',
  'app/components/shared',
  'app/hooks',
  'app/services',
  'app/startup.ts',
  'app/providers.tsx',
  'app/global-error.tsx',
  'app/error.tsx',
  'app/actions',
  'app/kits',
  'app/dashboard',
  'app/events'
];

// Common replacements
function fixImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Get the directory of the file for calculating relative paths
    const fileDir = path.dirname(filePath);
    
    // Pattern to find @/ imports
    const importPattern = /from\s+['"]@\/([^'"]+)['"]/g;
    
    // Replace @/ imports with relative paths
    let newContent = content.replace(importPattern, (match, importPath) => {
      // Calculate correct relative path
      let targetPath;
      if (importPath.startsWith('lib/')) {
        targetPath = path.join('app/lib', importPath.substring('lib/'.length));
      } else if (importPath.startsWith('components/')) {
        targetPath = path.join('app/components', importPath.substring('components/'.length));
      } else if (importPath.startsWith('shared/')) {
        targetPath = path.join('shared', importPath.substring('shared/'.length));
      } else if (importPath.startsWith('hooks/')) {
        targetPath = path.join('app/hooks', importPath.substring('hooks/'.length));
      } else {
        targetPath = path.join('app', importPath);
      }
      
      // Calculate relative path
      let relativePath = path.relative(fileDir, targetPath);
      
      // Ensure it starts with ./ or ../
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      
      // Fix Windows-style paths if any
      relativePath = relativePath.replace(/\\/g, '/');
      
      return `from '${relativePath}'`;
    });
    
    // Also fix dynamic imports
    const dynamicImportPattern = /import\(['"]@\/([^'"]+)['"]\)/g;
    newContent = newContent.replace(dynamicImportPattern, (match, importPath) => {
      // Calculate correct relative path
      let targetPath;
      if (importPath.startsWith('lib/')) {
        targetPath = path.join('app/lib', importPath.substring('lib/'.length));
      } else if (importPath.startsWith('components/')) {
        targetPath = path.join('app/components', importPath.substring('components/'.length));
      } else if (importPath.startsWith('shared/')) {
        targetPath = path.join('shared', importPath.substring('shared/'.length));
      } else if (importPath.startsWith('hooks/')) {
        targetPath = path.join('app/hooks', importPath.substring('hooks/'.length));
      } else {
        targetPath = path.join('app', importPath);
      }
      
      // Calculate relative path
      let relativePath = path.relative(fileDir, targetPath);
      
      // Ensure it starts with ./ or ../
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      
      // Fix Windows-style paths if any
      relativePath = relativePath.replace(/\\/g, '/');
      
      return `import('${relativePath}')`;
    });
    
    // If changes were made, write back to file
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing imports in ${filePath}:`, error.message);
    return false;
  }
}

// Get all TypeScript/TSX files in a directory
function getAllTsFiles(directory) {
  try {
    const result = execSync(`find ${directory} -type f -name "*.ts" -o -name "*.tsx"`).toString();
    return result.trim().split('\n').filter(f => f);
  } catch (error) {
    console.error(`Error finding files in ${directory}:`, error.message);
    return [];
  }
}

// Main function
function main() {
  let totalFixed = 0;
  let totalFiles = 0;
  
  // Process each critical path
  for (const criticalPath of CRITICAL_PATHS) {
    console.log(`\nProcessing ${criticalPath}...`);
    
    try {
      // Handle both directories and individual files
      const stats = fs.statSync(criticalPath);
      
      if (stats.isDirectory()) {
        // Get all TypeScript files in directory
        const files = getAllTsFiles(criticalPath);
        totalFiles += files.length;
        
        // Fix imports in each file
        let fixedCount = 0;
        for (const file of files) {
          if (fixImportsInFile(file)) {
            console.log(`✓ Fixed imports in ${file}`);
            fixedCount++;
            totalFixed++;
          }
        }
        
        console.log(`Fixed ${fixedCount}/${files.length} files in ${criticalPath}`);
      } else {
        // Handle individual file
        totalFiles++;
        if (fixImportsInFile(criticalPath)) {
          console.log(`✓ Fixed imports in ${criticalPath}`);
          totalFixed++;
        }
      }
    } catch (error) {
      console.error(`Error processing ${criticalPath}:`, error.message);
    }
  }
  
  console.log(`\nTotal: Fixed imports in ${totalFixed}/${totalFiles} files`);
}

main();
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log("Running critical import fixer...");

// Ensure directories exist
const directories = [
  'components/ui',
  'contexts',
  'lib',
  'services/infrastructure/messaging'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create fixed import path mapping
const importFixes = [
  {
    file: 'app/components/kits/KitTemplateDetail.tsx',
    search: "import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'",
    replace: "import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible'"
  },
  {
    file: 'app/components/kits/KitTemplateList.tsx',
    search: "import { useOrganization } from '@/contexts/organization-context'",
    replace: "import { useOrganization } from '../../../contexts/organization-context'"
  }
];

// Apply fixes if files exist
importFixes.forEach(fix => {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8');
    if (content.includes(fix.search)) {
      content = content.replace(fix.search, fix.replace);
      fs.writeFileSync(fix.file, content);
      console.log(`Fixed imports in ${fix.file}`);
    }
  } else {
    console.log(`Warning: File ${fix.file} not found, skipping fix`);
  }
});

console.log("Import fixing completed");
