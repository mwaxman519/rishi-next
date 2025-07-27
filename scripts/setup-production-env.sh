#!/bin/bash

# Rishi Platform - Production Environment Setup Script
# Sets up environment variables for production mobile builds

echo "🔧 Setting up Production Environment Variables..."
echo "==============================================="

# Export production environment variables
export PRODUCTION_DATABASE_URL="postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require"
export NEXTAUTH_SECRET="9P2wQ5eR8tY1uI3oA6sD4fG7hJ0kL5nM8pQ2wE5rT8yU1iO6pA3sD9fG2hJ5kL8n"

echo "✅ Production environment variables exported:"
echo "   • PRODUCTION_DATABASE_URL configured"
echo "   • NEXTAUTH_SECRET configured"
echo ""
echo "🚀 Ready to run production mobile build:"
echo "   ./scripts/build-mobile-production.sh"
