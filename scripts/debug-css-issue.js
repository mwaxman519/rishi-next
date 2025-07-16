#!/usr/bin/env node

/**
 * Debug CSS Issue Script
 * Investigates the CSS syntax error in production builds
 */

import https from 'https';
import fs from 'fs';

async function debugCSSIssue() {
  console.log('🔍 Debugging CSS Issue in Production...');
  
  // Check if the CSS file exists and what its content looks like
  try {
    const cssUrl = 'https://rishi-next.vercel.app/_next/static/css/app/layout.css';
    console.log(`📥 Fetching CSS from: ${cssUrl}`);
    
    const response = await fetch(cssUrl);
    const cssContent = await response.text();
    const headers = Object.fromEntries(response.headers);
    
    console.log('📋 Response Headers:');
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    console.log('\n📄 CSS Content (first 500 chars):');
    console.log(cssContent.substring(0, 500));
    
    // Check for JavaScript-like content in CSS
    const jsPatterns = [
      /function\s*\(/,
      /var\s+/,
      /const\s+/,
      /let\s+/,
      /import\s+/,
      /export\s+/,
      /window\./,
      /document\./
    ];
    
    console.log('\n🔍 Checking for JavaScript patterns in CSS:');
    jsPatterns.forEach((pattern, index) => {
      if (pattern.test(cssContent)) {
        console.log(`  ❌ Found JS pattern ${index + 1}: ${pattern}`);
      } else {
        console.log(`  ✅ No JS pattern ${index + 1}: ${pattern}`);
      }
    });
    
    // Save content for analysis
    fs.writeFileSync('/tmp/debug-css-content.txt', cssContent);
    console.log('\n💾 CSS content saved to /tmp/debug-css-content.txt');
    
  } catch (error) {
    console.error('❌ Error debugging CSS:', error.message);
  }
}

debugCSSIssue();