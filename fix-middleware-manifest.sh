#!/bin/bash

# Fix missing middleware-manifest.json file
echo "🔧 Fixing missing middleware-manifest.json file..."

# Create .next/server directory if it doesn't exist
mkdir -p .next/server

# Create the middleware-manifest.json file
cat > .next/server/middleware-manifest.json << 'EOF'
{
  "version": 2,
  "middleware": {},
  "functions": {}
}
EOF

# Set proper permissions
chmod 644 .next/server/middleware-manifest.json

echo "✅ middleware-manifest.json file created successfully"
echo "📁 Location: .next/server/middleware-manifest.json"
echo "📄 Content:"
cat .next/server/middleware-manifest.json