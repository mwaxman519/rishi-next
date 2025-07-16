#!/usr/bin/env node

/**
 * Quick Build Test
 * Tests if the build can complete without chunk conflicts
 */

import { spawn } from 'child_process';

console.log('Testing build without chunk splitting...');

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'pipe',
  timeout: 180000, // 3 minutes
});

let buildOutput = '';
buildProcess.stdout.on('data', (data) => {
  buildOutput += data.toString();
  process.stdout.write(data);
});

buildProcess.stderr.on('data', (data) => {
  buildOutput += data.toString();
  process.stderr.write(data);
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Build successful!');
    console.log('📦 No chunk conflicts detected');
    console.log('🚀 Ready for Vercel deployment');
  } else {
    console.log('\n❌ Build failed with code:', code);
    if (buildOutput.includes('SplitChunksPlugin')) {
      console.log('🔧 Still having chunk conflicts - need different approach');
    }
  }
});

buildProcess.on('error', (error) => {
  console.error('Build process error:', error.message);
});