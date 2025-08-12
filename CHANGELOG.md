# Changelog

## [1.1.0] - Multi-Environment Native Build Support

### Added
- **Multi-environment native build system** for staging and production deployments
- Environment-specific configuration files (`.env.native.staging`, `.env.native.prod`)
- Static Next.js export configuration (`next.config.static.mjs`) for native builds
- Native build scripts in `scripts/native/`:
  - `export-static.sh` - Creates static Next.js build without API routes
  - `gen-voltbuilder-json.js` - Generates environment-specific VoltBuilder configuration
  - `package-zip.sh` - Creates VoltBuilder-ready zip packages
  - `validate-build.sh` - Validates build requirements and configuration
  - `replace-fetch-calls.js` - Automated fetch('/api to apiFetch replacements
- Build wrapper scripts:
  - `build-native-staging.sh` - Complete staging build pipeline
  - `build-native-prod.sh` - Complete production build pipeline
- Comprehensive documentation in `NATIVE_BUILDS.md`

### Changed
- **All fetch('/api calls replaced with apiFetch('/api** across the entire codebase (20 replacements in 12 files)
  - Enhanced support for environment-specific API base URLs
  - Maintained backward compatibility with existing authentication flows
  - Improved reliability for native app API calls
- Updated Capacitor configuration for static web directory (`webDir: 'out'`)
- Enhanced API utilities to support multi-environment deployments

### Technical Details
- **Environment Isolation**: Staging and production apps can be installed side-by-side with different bundle IDs
- **Offline-First Architecture**: Static builds with no server-side components in the app bundle
- **VoltBuilder Integration**: Automated generation of platform-specific configurations
- **Version Management**: Auto-incrementing Android version codes with persistent counter
- **Build Validation**: Pre-build checks for service worker registration and API call patterns

### Infrastructure
- **Staging Environment**: 
  - API Base: `https://rishi-staging.replit.app`
  - Bundle IDs: `co.rishi.app.staging` 
  - App Name: "Rishi (Staging)"
- **Production Environment**:
  - API Base: `https://rishi-next.vercel.app`
  - Bundle IDs: `co.rishi.app`
  - App Name: "Rishi"

### Build Outputs
- `release/rishi-capacitor-staging.zip` - Staging VoltBuilder package
- `release/rishi-capacitor-prod.zip` - Production VoltBuilder package

This release establishes a complete multi-environment native app build system that enables parallel development, testing, and deployment of mobile applications across staging and production environments.