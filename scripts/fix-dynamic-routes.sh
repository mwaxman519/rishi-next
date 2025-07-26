#!/bin/bash
echo "🔧 Fixing dynamic API routes for static export..."

# Find all dynamic API route files
DYNAMIC_ROUTES=$(find app/api -name "*.ts" -path "*\[*\]*" | grep -v "generateStaticParams")

echo "Found dynamic routes:"
echo "$DYNAMIC_ROUTES"

# Add generateStaticParams to each dynamic route
for route in $DYNAMIC_ROUTES; do
    echo "Processing: $route"
    
    # Check if generateStaticParams already exists
    if grep -q "generateStaticParams" "$route"; then
        echo "  ✓ Already has generateStaticParams"
        continue
    fi
    
    # Add generateStaticParams export to the file
    echo "" >> "$route"
    echo "// Required for static export with dynamic routes" >> "$route"
    echo "export async function generateStaticParams() {" >> "$route"
    echo "  // Skip static generation for dynamic API routes" >> "$route"
    echo "  return [];" >> "$route"
    echo "}" >> "$route"
    
    echo "  ✓ Added generateStaticParams"
done

echo "✅ All dynamic API routes updated for static export"