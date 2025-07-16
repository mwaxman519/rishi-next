#!/usr/bin/env node

/**
 * Fix Vercel Deployment Issues
 * Addresses the persistent chunk loading failures and CSS syntax errors
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing Vercel deployment issues...\n');

// Fix 1: Disable problematic experimental features
const fixNextConfig = () => {
  const configPath = 'next.config.mjs';
  const content = fs.readFileSync(configPath, 'utf8');
  
  // Remove experimental CSS chunking completely
  const fixedContent = content
    .replace(/cssChunking: false, \/\/ Disabled to fix production chunk loading/g, '')
    .replace(/cssChunking: 'strict', \/\/ Better CSS chunking for production/g, '')
    .replace(/experimental: \{[^}]*\}/g, 'experimental: {}')
    .replace(/,\s*experimental: \{\}/g, '');
  
  fs.writeFileSync(configPath, fixedContent);
  console.log('✅ Removed experimental CSS chunking');
};

// Fix 2: Simplify webpack configuration
const simplifyWebpackConfig = () => {
  const configPath = 'next.config.mjs';
  const content = fs.readFileSync(configPath, 'utf8');
  
  // Simplify chunk splitting
  const fixedContent = content.replace(
    /\/\/ Simplified optimization for better chunk generation[\s\S]*?}\s*}/,
    `// Simplified optimization for Vercel deployment
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }`
  );
  
  fs.writeFileSync(configPath, fixedContent);
  console.log('✅ Simplified webpack configuration');
};

// Fix 3: Add proper fallback for missing chunks
const addChunkErrorHandling = () => {
  const errorPagePath = 'app/error.tsx';
  if (fs.existsSync(errorPagePath)) {
    const content = fs.readFileSync(errorPagePath, 'utf8');
    
    if (!content.includes('ChunkLoadError')) {
      const fixedContent = content.replace(
        /export default function Error\({ error, reset }: ErrorProps\) \{/,
        `export default function Error({ error, reset }: ErrorProps) {
  // Handle chunk loading errors
  if (error.message?.includes('ChunkLoadError') || error.message?.includes('Loading chunk')) {
    console.log('Chunk loading error detected, attempting page reload...');
    window.location.reload();
    return null;
  }`
      );
      
      fs.writeFileSync(errorPagePath, fixedContent);
      console.log('✅ Added chunk error handling');
    }
  }
};

// Fix 4: Create deployment-specific build script
const createDeploymentBuildScript = () => {
  const buildScript = `#!/usr/bin/env node

/**
 * Deployment Build Script
 * Ensures clean build for Vercel deployment
 */

import { spawn } from 'child_process';
import fs from 'fs';

// Clean build artifacts
if (fs.existsSync('.next')) {
  fs.rmSync('.next', { recursive: true, force: true });
}

// Run build with proper environment
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    VERCEL: '1'
  }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully');
  } else {
    console.error('❌ Build failed');
    process.exit(1);
  }
});
`;
  
  fs.writeFileSync('scripts/deployment-build.js', buildScript);
  console.log('✅ Created deployment build script');
};

// Execute all fixes
const fixes = [
  { name: 'Next.js Config', fix: fixNextConfig },
  { name: 'Webpack Config', fix: simplifyWebpackConfig },
  { name: 'Chunk Error Handling', fix: addChunkErrorHandling },
  { name: 'Deployment Build Script', fix: createDeploymentBuildScript }
];

for (const fix of fixes) {
  try {
    fix.fix();
  } catch (error) {
    console.error(`❌ Failed to apply ${fix.name}:`, error.message);
  }
}

console.log('\n🚀 Vercel deployment fixes completed!');
console.log('📝 Next steps:');
console.log('  1. Commit and push changes');
console.log('  2. Vercel will automatically redeploy');
console.log('  3. Test the login page after deployment');

export default { fixes };