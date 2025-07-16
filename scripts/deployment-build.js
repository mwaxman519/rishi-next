#!/usr/bin/env node

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
