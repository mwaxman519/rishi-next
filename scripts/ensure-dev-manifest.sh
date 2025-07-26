#!/bin/bash

# Ensure development manifests exist
mkdir -p .next/server

# Create minimal middleware manifest
cat > .next/server/middleware-manifest.json << 'EOF'
{
  "version": 2,
  "middleware": {},
  "functions": {},
  "matchers": []
}
EOF

# Create minimal routes manifest  
cat > .next/routes-manifest.json << 'EOF'
{
  "version": 3,
  "pages404": true,
  "basePath": "",
  "headers": [],
  "rewrites": {
    "beforeFiles": [],
    "afterFiles": [],
    "fallback": []
  },
  "redirects": []
}
EOF

echo "✅ Development manifests restored"