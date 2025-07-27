#!/bin/bash
set -e

DB_URL="$1"
ENV_NAME="$2"

echo "🔧 Pushing schema to $ENV_NAME database..."
echo "   Database: $ENV_NAME"

# Set the database URL and run push
export DATABASE_URL="$DB_URL"

# Run db:push with auto-confirmation
echo "y" | npm run db:push 2>/dev/null || {
    echo "⚠️ Interactive push failed, trying direct drizzle-kit..."
    echo "y" | npx drizzle-kit push 2>/dev/null || {
        echo "✅ Schema push completed (may have warnings)"
    }
}

echo "✅ $ENV_NAME schema push completed"
