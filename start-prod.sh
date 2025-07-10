#!/bin/bash

# Production start script for Replit Autoscale
echo "🚀 Starting Rishi Platform for Production..."

# Set production environment
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Install dependencies if needed
npm ci --silent

# Start the application in production mode
echo "Starting Next.js server on port 5000..."
npm start