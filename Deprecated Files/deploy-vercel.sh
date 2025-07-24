#!/bin/bash

# Vercel Deployment Script for Rishi Platform
echo "🚀 Starting Vercel deployment for Rishi Platform..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami 2>/dev/null || {
    echo "Please login to Vercel:"
    vercel login
}

# Set environment variables for Vercel deployment
export VERCEL=1
export NODE_ENV=production

# Deploy to production
echo "🎯 Deploying to Vercel production..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔍 Check your Vercel dashboard for the deployment URL"
echo "📋 Don't forget to set the environment variables in your Vercel project settings"