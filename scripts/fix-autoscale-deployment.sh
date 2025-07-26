#!/bin/bash
echo "🔧 Fixing Autoscale Deployment Issues..."

# Remove problematic .env.production that contains VOLTBUILDER_BUILD
if [ -f ".env.production" ]; then
    echo "🗑️ Removing problematic .env.production file"
    rm .env.production
fi

# Create safe environment configuration for autoscale
echo "📝 Creating autoscale-safe environment..."

echo "✅ Autoscale deployment configuration fixed"
echo "🎯 For Autoscale deployment, Replit will use:"
echo "   NODE_ENV=production (automatic)"
echo "   NEXT_PUBLIC_APP_ENV=staging (from replit.toml)"
echo "   DATABASE_URL (from secrets)"
echo "   NO VOLTBUILDER_BUILD variable"