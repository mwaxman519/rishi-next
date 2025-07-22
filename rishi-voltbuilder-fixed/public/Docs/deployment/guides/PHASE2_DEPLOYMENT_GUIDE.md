# Phase 2: Next.js Static Export Deployment

## Overview

Deploy the Rishi Platform as a Next.js static export to Azure Static Web Apps.

## Files to Replace in rishiapptest Repository

### 1. package.json

Replace existing package.json with Next.js dependencies and build scripts.

### 2. next.config.mjs

Next.js configuration optimized for Azure static export.

### 3. Directory Structure

```
rishiapptest/
├── package.json
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.mjs
├── tsconfig.json
├── staticwebapp.config.json
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
```

### 4. App Files

Create `app/` directory and replace contents:

- `app/layout.tsx` - Root layout with metadata (phase2-app/layout.tsx)
- `app/page.tsx` - Homepage with deployment status (phase2-app/page.tsx)
- `app/globals.css` - Tailwind CSS styles (phase2-app/globals.css)

### 5. Configuration Files

- `tailwind.config.js` - Tailwind CSS configuration (phase2-tailwind.config.js)
- `postcss.config.mjs` - PostCSS configuration (phase2-postcss.config.mjs)
- `tsconfig.json` - TypeScript configuration (phase2-tsconfig.json)
- `next-env.d.ts` - Next.js TypeScript definitions (phase2-next-env.d.ts)

## Deployment Process

1. **Replace files** in rishiapptest repository
2. **Install dependencies** (Azure will handle this automatically)
3. **Build process**: `next build && next export`
4. **Output**: Static files in `out/` directory
5. **Serve**: Azure CDN serves static content globally

## Key Features

- **Static Export**: No server-side rendering, pure static files
- **Tailwind CSS**: Utility-first styling framework
- **TypeScript**: Type safety and developer experience
- **Responsive Design**: Mobile-first cannabis branding
- **Azure Optimized**: Headers, caching, and routing configured

## Expected Result

Professional Rishi Platform interface with:

- Modern gradient design with cannabis branding colors
- Deployment status indicators showing Phase 2 success
- Responsive grid layout for status cards
- Next.js feature preview (Dashboard, Bookings, Calendar, Team)
- Optimized static assets served via Azure CDN

## Commands

```bash
cd rishiapptest

# Replace root configuration files
cp phase2-package.json package.json
cp phase2-next.config.mjs next.config.mjs
cp phase2-tailwind.config.js tailwind.config.js
cp phase2-postcss.config.mjs postcss.config.mjs
cp phase2-tsconfig.json tsconfig.json
cp phase2-staticwebapp.config.json staticwebapp.config.json
cp phase2-next-env.d.ts next-env.d.ts

# Replace app directory contents
rm -rf app/
mkdir app/
cp phase2-app-files/layout.tsx app/layout.tsx
cp phase2-app-files/page.tsx app/page.tsx
cp phase2-app-files/globals.css app/globals.css

# Commit and deploy
git add .
git commit -m "Phase 2: Next.js static export deployment"
git push origin main
```

## Success Metrics

- Build completes without errors
- Static files generated in `out/` directory
- Application loads at Azure domain
- Tailwind styles render correctly
- Client-side navigation works
- Performance optimizations active

## Next: Phase 3

After Phase 2 validation:

- Add API routes for Azure Functions
- Database integration with environment variables
- Authentication and authorization
- Full Rishi Platform features
