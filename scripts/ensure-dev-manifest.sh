#!/bin/bash

# Ensure all required manifest files exist for development server
echo "🔧 Ensuring development server manifest files exist..."

# Create .next directories if they don't exist
mkdir -p .next/server

# Routes manifest
ROUTES_MANIFEST=".next/routes-manifest.json"
if [ ! -f "$ROUTES_MANIFEST" ]; then
    echo "Creating missing routes-manifest.json for development..."
    cat > "$ROUTES_MANIFEST" << 'EOF'
{"version":3,"caseSensitive":false,"basePath":"","rewrites":{"beforeFiles":[],"afterFiles":[],"fallback":[]},"redirects":[{"source":"/:path+/","destination":"/:path+","permanent":true,"internal":true,"regex":"^(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))\\/$"}],"headers":[]}
EOF
    echo "✅ Created routes-manifest.json"
else
    echo "✅ routes-manifest.json already exists"
fi

# App paths manifest
APP_PATHS_MANIFEST=".next/server/app-paths-manifest.json"
if [ ! -f "$APP_PATHS_MANIFEST" ]; then
    echo "Creating missing app-paths-manifest.json for development..."
    cat > "$APP_PATHS_MANIFEST" << 'EOF'
{}
EOF
    echo "✅ Created app-paths-manifest.json"
else
    echo "✅ app-paths-manifest.json already exists"
fi