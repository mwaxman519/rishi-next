#!/bin/bash
echo "🔧 Fixing static export routes for VoltBuilder..."

# Find all dynamic route files that need generateStaticParams
DYNAMIC_ROUTES=$(find app/api -path "*/[*" -name "route.ts" | head -20)

for route in $DYNAMIC_ROUTES; do
  echo "📁 Processing: $route"
  
  # Get the directory containing the route
  route_dir=$(dirname "$route")
  
  # Create generateStaticParams.ts if it doesn't exist
  if [ ! -f "$route_dir/generateStaticParams.ts" ]; then
    echo "export function generateStaticParams() { return []; }" > "$route_dir/generateStaticParams.ts"
    echo "✅ Created generateStaticParams.ts for $route"
  fi
  
  # Check if the route file imports generateStaticParams
  if ! grep -q "generateStaticParams" "$route"; then
    # Add the import and export to the route file
    echo 'import { generateStaticParams } from "./generateStaticParams";' | cat - "$route" > temp && mv temp "$route"
    echo "" >> "$route"
    echo "export { generateStaticParams };" >> "$route"
    echo "✅ Added generateStaticParams to $route"
  fi
done

echo "🎯 Static export routes fixed for VoltBuilder compatibility"