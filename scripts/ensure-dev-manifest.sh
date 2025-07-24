#!/bin/bash

# Ensure routes-manifest.json exists for development server
MANIFEST_FILE=".next/routes-manifest.json"

if [ ! -f "$MANIFEST_FILE" ]; then
    echo "Creating missing routes-manifest.json for development..."
    mkdir -p .next
    cat > "$MANIFEST_FILE" << 'EOF'
{"version":3,"caseSensitive":false,"basePath":"","rewrites":{"beforeFiles":[],"afterFiles":[],"fallback":[]},"redirects":[{"source":"/:path+/","destination":"/:path+","permanent":true,"internal":true,"regex":"^(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))\\/$"}],"headers":[]}
EOF
    echo "✅ Created routes-manifest.json"
else
    echo "✅ routes-manifest.json already exists"
fi