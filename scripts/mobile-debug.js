#!/usr/bin/env node

/**
 * Mobile Debug Helper Script
 * Provides better debugging capabilities for Capacitor mobile builds
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Mobile Debug Helper');
console.log('======================');

// Check if we're in a mobile build environment
const isMobileBuild = process.env.MOBILE_BUILD === 'true';
const capacitorConfigExists = fs.existsSync('capacitor.config.ts');
const androidDirExists = fs.existsSync('android');
const outDirExists = fs.existsSync('out');

console.log('\n📱 Mobile Environment Check:');
console.log(`   Mobile Build Flag: ${isMobileBuild ? '✅' : '❌'}`);
console.log(`   Capacitor Config: ${capacitorConfigExists ? '✅' : '❌'}`);
console.log(`   Android Directory: ${androidDirExists ? '✅' : '❌'}`);
console.log(`   Static Export: ${outDirExists ? '✅' : '❌'}`);

if (outDirExists) {
  const indexHtmlPath = path.join('out', 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    console.log('\n📄 Static Export Analysis:');
    console.log(`   Index.html Size: ${(indexContent.length / 1024).toFixed(1)}KB`);
    console.log(`   Contains React: ${indexContent.includes('react') ? '✅' : '❌'}`);
    console.log(`   Contains Scripts: ${indexContent.includes('<script') ? '✅' : '❌'}`);
    console.log(`   Contains Mobile Code: ${indexContent.includes('mobile') || indexContent.includes('Mobile') ? '✅' : '❌'}`);
    console.log(`   Contains Capacitor: ${indexContent.includes('capacitor') || indexContent.includes('Capacitor') ? '✅' : '❌'}`);
    
    // Check for potential issues
    if (indexContent.includes('404') || indexContent.includes('Not Found')) {
      console.log('   ⚠️  WARNING: Index contains 404/Not Found content');
    }
    
    if (indexContent.length < 1000) {
      console.log('   ⚠️  WARNING: Index.html is very small, might be missing content');
    }
  }
}

// Check Capacitor configuration
if (capacitorConfigExists) {
  const capacitorConfig = fs.readFileSync('capacitor.config.ts', 'utf8');
  
  console.log('\n⚙️  Capacitor Configuration:');
  console.log(`   Has Server URL: ${capacitorConfig.includes('server:') && capacitorConfig.includes('url:') ? '✅' : '❌'}`);
  console.log(`   WebDir set to 'out': ${capacitorConfig.includes("webDir: 'out'") ? '✅' : '❌'}`);
  console.log(`   App ID configured: ${capacitorConfig.includes('appId:') ? '✅' : '❌'}`);
  
  if (capacitorConfig.includes('url:')) {
    const serverMatch = capacitorConfig.match(/url:\s*['"`]([^'"`]+)['"`]/);
    if (serverMatch) {
      console.log(`   Server URL: ${serverMatch[1]}`);
    }
  }
}

// Suggest debugging steps
console.log('\n🔍 Debugging Recommendations:');
console.log('   1. Use the in-app debug console (🔧 button)');
console.log('   2. Enable USB debugging on Android device');
console.log('   3. Use Chrome DevTools: chrome://inspect');
console.log('   4. Check VoltBuilder compilation logs');
console.log('   5. Test app with Android Studio emulator first');

// Create debugging checklist
const checklistPath = 'MOBILE_DEBUG_CHECKLIST.md';
const checklistContent = `# Mobile App Debugging Checklist

## Pre-Build Checks
- [ ] Capacitor config points to correct webDir ('out')
- [ ] Static export contains React scripts and components
- [ ] No server URL dependency (for offline capability)
- [ ] App ID and name configured correctly

## Build Checks  
- [ ] Static export completed successfully (npm run build)
- [ ] Capacitor sync completed (npx cap sync)
- [ ] Android directory contains updated assets
- [ ] VoltBuilder package includes all necessary files

## Device Testing
- [ ] App installs successfully on device
- [ ] App launches without immediate crash
- [ ] Check in-app debug console (🔧 button)
- [ ] Test basic navigation and interactions
- [ ] Verify network requests (if any)

## Advanced Debugging
- [ ] Enable USB debugging on Android
- [ ] Connect to Chrome DevTools (chrome://inspect)
- [ ] Check Android logcat for errors
- [ ] Test on Android emulator first
- [ ] Verify all Capacitor plugins load correctly

## Common Issues
- Blank screen: Usually static export or routing issue
- App crashes: Check device logs and plugin compatibility
- Network errors: Verify CORS and server configuration
- UI not responsive: Check viewport and touch handlers

## Debug Tools Available
- In-app debug console (🔧 button in mobile build)
- Chrome remote debugging
- Android Studio logcat
- VoltBuilder build logs
`;

fs.writeFileSync(checklistPath, checklistContent);
console.log(`\n📝 Created debugging checklist: ${checklistPath}`);

console.log('\n✅ Mobile debug helper completed');
console.log('   Use the in-app debugger for real-time device diagnostics');