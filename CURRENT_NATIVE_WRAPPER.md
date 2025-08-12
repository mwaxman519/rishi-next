# CURRENT_NATIVE_WRAPPER.md

## 1) High-Level Architecture

The app currently uses **local bundled assets** (file:// or capacitor://) approach:
- **a) Serves local bundled assets**: YES - webDir points to 'out' directory
- **b) Loads remote content in iframe**: NO - No iframes found
- **c) Hybrid approach**: NO
- **d) Uses Capacitor server.url**: NO - Not configured

Initial WebView loads from local bundled assets using the `https` scheme configured in capacitor.config.ts.

```
ASCII Launch Diagram:
Native App Shell 
    ↓
Capacitor WebView (https scheme)
    ↓
Local Bundle (out/)
    ├── index.html
    ├── manifest.json
    ├── sw.js (Service Worker)
    └── offline.html
    ↓
API Calls → https://rishi-next.vercel.app (Production)
```

## 2) Iframe Usage

**No iframes found in the codebase.**

Search performed:
```bash
grep -R "<iframe" -n . --include="*.tsx" --include="*.jsx" --include="*.html" --include="*.js"
```
Result: No matches found (excluding node_modules and .next)

## 3) Capacitor Configuration

### Full capacitor.config.ts:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.rishi.app',
  appName: 'Rishi Platform',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // No cleartext allowed - all API calls must be HTTPS
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0F172A',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#8B5CF6'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  cordova: {},
  ios: {
    preferredContentMode: 'mobile',
    allowsLinkPreview: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
```

**Key Configuration Notes:**
- **webDir**: 'out' (Next.js static export directory)
- **server.url**: Not present (uses local assets)
- **androidScheme**: 'https'
- **iosScheme**: 'https'
- **cleartext**: false (HTTPS only)

### Capacitor Plugins (from package.json):
```json
{
  "@capacitor-community/sqlite": "^7.0.1",
  "@capacitor/android": "^7.4.2",
  "@capacitor/app": "^7.0.1",
  "@capacitor/cli": "^7.4.2",
  "@capacitor/core": "^7.4.2",
  "@capacitor/ios": "^7.4.2",
  "@capacitor/keyboard": "^7.0.1",
  "@capacitor/local-notifications": "^7.0.1",
  "@capacitor/preferences": "^7.0.2",
  "@capacitor/push-notifications": "^7.0.1",
  "@capacitor/splash-screen": "^7.0.1",
  "@capacitor/status-bar": "^7.0.1"
}
```

## 4) Platform-Native Settings

### Android (AndroidManifest.xml excerpt):
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.rishi.platform">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <application
        android:allowBackup="true"
        android:usesCleartextTraffic="true">
        <!-- Note: usesCleartextTraffic=true contradicts capacitor.config cleartext=false -->
```

### iOS:
- **Info.plist ATS Settings**: No NSAppTransportSecurity found (defaults to HTTPS-only)
- **Custom Native Code**: No custom native code found in android/ or ios/ directories

## 5) Offline Behavior

### Service Worker Registration:
**File**: `app/service-worker-registration.tsx` (lines 9-10)
```typescript
navigator.serviceWorker
  .register('/sw.js')
```

Also registered in: `app/components/ThemeScript.tsx` (line 22)
```typescript
navigator.serviceWorker.register('/sw.js')
```

### Service Worker (public/sw.js excerpt):
```javascript
// Rishi Platform Service Worker v1.0.0
const CACHE_VERSION = 'rishi-v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Cache-first resources (JS/CSS/fonts/images)
const CACHE_FIRST_PATTERNS = [
  /\.js$/, /\.css$/, /\.woff2?$/, /\.ttf$/, /\.otf$/,
  /\.png$/, /\.jpg$/, /\.jpeg$/, /\.svg$/, /\.ico$/,
  /_next\/static/, /fonts/
];

// Stale-while-revalidate resources (app shell, non-critical JSON)
const STALE_WHILE_REVALIDATE_PATTERNS = [
  /\.html$/, /\/$/, /manifest\.json$/, /\.json$/
];

// Network-first resources (authenticated/dynamic API calls)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//, /auth/, /session/, /login/, /logout/
];
```

### Caching Strategies:
- **Cache-first**: Static assets (JS, CSS, fonts, images)
- **Stale-while-revalidate**: HTML, JSON, app shell
- **Network-first**: API calls, authentication

### Offline Capabilities:
- **Works Offline**: Static UI, cached pages, previously loaded data
- **Requires Network**: Authentication, real-time data updates, API calls
- **Fallback**: `/offline.html` page when offline

## 6) Build & Packaging Flow

### Web Build Output:
- **Directory**: `out/` (Next.js static export)
- **Build Config**: `next.config.static.mjs` for static export

### Build Script (build-native.sh excerpt):
```bash
# Build the static Next.js app with static export
echo -e "${YELLOW}🔨 Building Next.js static export...${NC}"
# Copy the static config temporarily
cp next.config.static.mjs next.config.mjs.backup
mv next.config.mjs next.config.mjs.original
mv next.config.static.mjs next.config.mjs
npx next build
# Restore original config
mv next.config.mjs next.config.static.mjs
mv next.config.mjs.original next.config.mjs
```

### VoltBuilder Configuration (voltbuilder.json):
```json
{
  "app_name": "Rishi Platform",
  "app_id": "co.rishi.app",
  "version": "1.0.0",
  "platform": ["android", "ios"],
  "build": {
    "android": {
      "package_type": "apk",
      "keystore_alias": "rishi-android",
      "android_version_code": 1,
      "min_sdk_version": 24,
      "target_sdk_version": 34
    },
    "ios": {
      "package_type": "app-store",
      "provisioning_profile": "rishi-ios-appstore",
      "signing_certificate": "rishi-ios-dist",
      "deployment_target": "13.0"
    }
  },
  "preferences": {
    "permissions": [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.CAMERA",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ],
    "orientation": "portrait",
    "fullscreen": false,
    "webview_bounce": false,
    "background_color": "#0F172A",
    "stay_in_webview": true,
    "error_url": "file:///android_asset/www/offline.html"
  }
}
```

### VoltBuilder Zip Contents:
- android/
- ios/
- out/ (built static assets)
- capacitor.config.ts
- voltbuilder.json
- package.json
- package-lock.json
- node_modules/@capacitor*

## 7) Environment & API Targets

### API Configuration:
From `.env.production`:
```
DATABASE_URL=postgresql://neondb_owner:***@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD-***
```

### Environment:
- **Native App Target**: Production (https://rishi-next.vercel.app)
- **Database**: Production Neon PostgreSQL
- **No explicit API_URL configuration found** - app likely uses relative URLs

### CORS Configuration:
- No explicit CORS headers found in codebase
- Relies on Vercel's default CORS handling

## 8) Security & Policies

### Current Security:
- **CORS**: Not explicitly configured (default)
- **CSP**: Not found in meta tags
- **Android cleartext**: Conflicting - config says false, manifest says true
- **iOS ATS**: Default (HTTPS only)

### Service Worker Allowed Origins:
```javascript
const allowedOrigins = [
  'https://rishi-next.vercel.app',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];
```

## 9) Evidence & File Tree

### Key Directory Structure:
```
.
├── android/          # Android native project
├── ios/              # iOS native project  
├── app/              # Next.js app directory
├── public/           # Static assets
│   ├── manifest.json # PWA manifest
│   ├── sw.js        # Service Worker
│   └── offline.html # Offline fallback
├── out/             # Static export (webDir)
├── capacitor.config.ts
├── voltbuilder.json
├── build-native.sh
└── BUILD-NATIVE.md
```

### Key File Excerpts:

**public/manifest.json** (lines 1-11):
```json
{
  "name": "Rishi Platform",
  "short_name": "Rishi",
  "description": "Enterprise workforce management platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#8B5CF6",
  "orientation": "portrait",
  "scope": "/",
  "id": "co.rishi.app"
}
```

## 10) Findings Tables

### Table A: Current vs Desired (Offline-First, no iframe)

| Aspect | Current | Desired |
|--------|---------|---------|
| Launch source | Local bundle (out/) | Local bundle (out/) ✓ |
| Offline boot | Yes, with SW fallback | Full offline capability |
| Asset origin | Local files | Local files ✓ |
| API target | Production (Vercel) | Configurable per env |
| SW strategy | Cache/Network/Stale strategies | Enhanced offline-first |
| CORS/ATS | Default/HTTPS only | Explicit configuration |
| Update path | Rebuild & redistribute | OTA updates |
| Deep links | Not configured | Full deep link support |
| Plugins | Capacitor 7.4.2 suite | Same ✓ |
| Build artifact | out/ directory | out/ directory ✓ |
| VoltBuilder zip | All required files | Optimized bundle |

### Table B: Risks

| Issue | Impact | Likelihood | Proposed Fix | Effort |
|-------|--------|------------|--------------|--------|
| Cleartext config mismatch | Security vulnerability | High | Align AndroidManifest with config | S |
| No explicit API URLs | Hard to switch environments | Medium | Add NEXT_PUBLIC_API_URL config | S |
| Duplicate SW registration | Potential conflicts | Low | Single registration point | S |
| No offline data sync | Poor offline UX | High | Implement sync queue | M |
| Missing CORS config | API access issues | Medium | Configure explicit CORS | S |
| No OTA updates | Slow release cycle | High | Implement CodePush/similar | L |

## 11) Repro/Discovery Commands

```bash
# Search for iframes
grep -R "<iframe" -n . --include="*.tsx" --include="*.jsx" --include="*.html" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next

# Search for postMessage usage
grep -R "postMessage" -n . --include="*.tsx" --include="*.jsx" --include="*.html" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next

# Find service worker registration
grep -R "navigator.serviceWorker.register" -n . --include="*.tsx" --include="*.jsx" --include="*.html" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next

# Check for server.url in Capacitor config
grep -R "server.url" -n . --include="*.ts" --include="*.js" --include="*.json" --exclude-dir=node_modules --exclude-dir=.next

# List Capacitor dependencies
jq '.dependencies | to_entries | map(select(.key | contains("capacitor"))) | from_entries' package.json

# Find Android manifests
find android -name "*.xml" 2>/dev/null

# Check iOS Info.plist for ATS
grep -A 10 -B 2 "NSAppTransportSecurity" ios/App/App/Info.plist

# Find environment configurations
grep -r "NEXT_PUBLIC_API" --include="*.env*" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .

# Check build output directory
ls -la out/ 2>/dev/null || echo "out/ directory not found - need to run build"
```

---

**Summary**: The current implementation is already offline-first with local bundled assets, no iframes, and a comprehensive service worker. The main improvements needed are fixing the cleartext configuration mismatch, adding explicit API URL configuration, and implementing better offline data synchronization.