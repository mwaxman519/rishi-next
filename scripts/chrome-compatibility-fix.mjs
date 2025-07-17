#!/usr/bin/env node

/**
 * Chrome Compatibility Fix Script
 * Addresses Chrome-specific issues with static asset serving
 */

import fs from 'fs';
import path from 'path';

function fixChromeCompatibility() {
  console.log('Applying Chrome compatibility fixes...');
  
  // 1. Create a more robust vercel.json that handles Chrome's strict MIME type checking
  const vercelConfig = {
    "framework": "nextjs",
    "buildCommand": "npm run build && node scripts/create-middleware-manifest.mjs",
    "outputDirectory": ".next",
    "installCommand": "npm install",
    "devCommand": "npm run dev",
    "functions": {
      "app/api/**/*.ts": {
        "maxDuration": 30
      }
    },
    "headers": [
      {
        "source": "/_next/static/chunks/(.*).js",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/javascript; charset=utf-8"
          },
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          }
        ]
      },
      {
        "source": "/_next/static/css/(.*).css",
        "headers": [
          {
            "key": "Content-Type",
            "value": "text/css; charset=utf-8"
          },
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          }
        ]
      },
      {
        "source": "/_next/static/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ]
  };
  
  const vercelPath = path.join(process.cwd(), 'vercel.json');
  fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
  console.log('✓ Updated vercel.json for Chrome compatibility');
  
  // 2. Create a public/_headers file for additional header control
  const headersContent = `/_next/static/chunks/*
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/_next/static/css/*
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable`;
  
  const headersPath = path.join(process.cwd(), 'public', '_headers');
  fs.writeFileSync(headersPath, headersContent);
  console.log('✓ Created public/_headers for additional header control');
  
  console.log('Chrome compatibility fixes applied!');
}

fixChromeCompatibility();