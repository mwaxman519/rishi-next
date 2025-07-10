#!/bin/bash

echo "Creating minimal deployment build..."

# Create clean directory
rm -rf minimal-deployment
mkdir -p minimal-deployment

# Copy essential core files
cp package.json minimal-deployment/
cp next.config.mjs minimal-deployment/
cp tsconfig.json minimal-deployment/
cp tailwind.config.js minimal-deployment/
cp postcss.config.mjs minimal-deployment/
cp .env.example minimal-deployment/
cp drizzle.config.ts minimal-deployment/

# Copy essential app structure
mkdir -p minimal-deployment/app
cp app/layout.tsx minimal-deployment/app/
cp app/page.tsx minimal-deployment/app/
cp app/providers.tsx minimal-deployment/app/
cp app/global-error.tsx minimal-deployment/app/
cp app/error.tsx minimal-deployment/app/
cp app/not-found.tsx minimal-deployment/app/

# Copy core lib
mkdir -p minimal-deployment/app/lib
cp -r app/lib/auth minimal-deployment/app/lib/
cp -r app/lib/db minimal-deployment/app/lib/
cp -r app/lib/rbac minimal-deployment/app/lib/
cp app/lib/utils.ts minimal-deployment/app/lib/ 2>/dev/null || true

# Copy essential API routes
mkdir -p minimal-deployment/app/api
cp -r app/api/auth minimal-deployment/app/api/

# Copy dashboard
mkdir -p minimal-deployment/app/dashboard
cp -r app/dashboard minimal-deployment/app/ 2>/dev/null || true

# Copy admin essentials
mkdir -p minimal-deployment/app/admin
cp -r app/admin/users minimal-deployment/app/admin/ 2>/dev/null || true
cp -r app/admin/roles minimal-deployment/app/admin/ 2>/dev/null || true

# Copy essential components
mkdir -p minimal-deployment/app/components/ui
cp -r app/components/ui minimal-deployment/app/components/ 2>/dev/null || true
cp -r app/components/navigation minimal-deployment/app/components/ 2>/dev/null || true

# Copy shared schema
mkdir -p minimal-deployment/shared
cp shared/schema.ts minimal-deployment/shared/
cp shared/types.ts minimal-deployment/shared/ 2>/dev/null || true
cp -r shared/rbac minimal-deployment/shared/ 2>/dev/null || true

# Copy middleware
cp middleware.ts minimal-deployment/ 2>/dev/null || true

# Count files
echo "Minimal deployment created with $(find minimal-deployment -type f | wc -l) files"
echo "Original project has $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l) TypeScript files"