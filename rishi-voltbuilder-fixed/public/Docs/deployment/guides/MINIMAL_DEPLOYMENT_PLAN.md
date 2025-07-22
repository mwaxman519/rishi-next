# Minimal Deployment Analysis

## Core Issue: File Bloat

- **Current**: 1,800+ files (1,406 modules compiled)
- **Azure Limit**: ~200-300 modules for reliable builds
- **Root Cause**: Accumulated experimental features and duplicate structures

## Essential vs Bloat Analysis

### Core Business Logic (Keep)

- Authentication system
- RBAC framework
- Organization management
- Basic dashboard
- User management
- Database schema

### Bloat Removed

- ✅ Duplicate folders: `manual-deploy/`, `complete-deployment/`, `.vercel/`
- ✅ Debug folders: All `*-debug/` directories
- ✅ Experimental features: `simple/`, `test/`, `preview/`
- ✅ Build artifacts: `out/`, `temp-production/`
- ✅ Backup files and test scripts

## Minimal App Structure

```
app/
├── page.tsx (dashboard)
├── layout.tsx
├── providers.tsx
├── auth/ (login/logout)
├── dashboard/ (main interface)
├── admin/ (user/role management)
├── api/ (essential endpoints only)
├── lib/ (core utilities)
└── components/ (essential UI)

shared/
├── schema.ts (database)
├── types.ts
└── rbac/ (permissions)
```

## Deployment Strategy

1. Create minimal branch with ~100 files
2. Test local build (should be <200 modules)
3. Deploy to Azure with simplified config
4. Add features incrementally
