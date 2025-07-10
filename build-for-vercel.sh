#!/bin/bash

# Vercel Build Script for Rishi Platform
# Ensures CSS dependencies are available for build process

set -e

echo "🎨 Installing CSS dependencies for Vercel build..."
npm install tailwindcss postcss autoprefixer

echo "📦 Running Next.js build..."
npm run build

echo "✅ Vercel build completed successfully!"