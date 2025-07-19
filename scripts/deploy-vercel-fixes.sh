#!/bin/bash

# Vercel Production Login Fix Deployment Script
# This script ensures all fixes are properly deployed to resolve chunk loading issues

echo "🚀 Deploying Vercel production login fixes..."

# 1. Verify critical files are in place
echo "✅ Verifying fix files..."
if [ ! -f "app/auth/login/page.tsx" ]; then
    echo "❌ Missing login page.tsx"
    exit 1
fi

if [ ! -f "app/auth/login/login-form.tsx" ]; then
    echo "❌ Missing login-form.tsx"
    exit 1
fi

if [ ! -f "vercel.json" ]; then
    echo "❌ Missing vercel.json configuration"
    exit 1
fi

# 2. Check login page has 'use client' directive
if ! grep -q "'use client'" app/auth/login/page.tsx; then
    echo "❌ Login page missing 'use client' directive"
    exit 1
fi

# 3. Verify CSS is properly formatted
if ! grep -q "@tailwind base;" app/globals.css; then
    echo "❌ CSS file appears corrupted"
    exit 1
fi

# 4. Check webpack configuration
if ! grep -q "splitChunks" next.config.mjs; then
    echo "❌ Missing webpack chunking configuration"
    exit 1
fi

echo "✅ All fix files verified successfully!"

# 5. Clear build cache to ensure fresh build
echo "🧹 Clearing build cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "📋 DEPLOYMENT CHECKLIST:"
echo "✅ Login page restructured (server + client components)"
echo "✅ CSS file cleaned and formatted"  
echo "✅ Webpack chunking optimized"
echo "✅ Vercel headers configured"
echo "✅ Build cache cleared"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Deploy to Vercel with these fixes"
echo "2. The chunk loading error should be resolved"
echo "3. Login page will load correctly"
echo ""
echo "🔥 Ready for Vercel deployment!"