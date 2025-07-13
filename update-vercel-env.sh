#!/bin/bash
echo "Updating Vercel environment variables for production..."

# Set the correct production database URL
npx vercel env add DATABASE_URL production << HEREDOC
postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require
HEREDOC

# Set app environment to production
npx vercel env add NEXT_PUBLIC_APP_ENV production << HEREDOC
production
HEREDOC

# Update JWT secrets for production
npx vercel env add JWT_SECRET production << HEREDOC
production-jwt-secret-key-change-this-in-production
HEREDOC

echo "Environment variables updated. Redeploying..."
npx vercel --prod
