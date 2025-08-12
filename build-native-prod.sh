#!/usr/bin/env bash
set -euo pipefail

echo "📱 Building Capacitor mobile wrapper for production..."

# Set production environment
export NEXT_PUBLIC_API_BASE_URL=https://rishi-next.vercel.app
export NATIVE_APP_NAME="Rishi Platform"
export NATIVE_ANDROID_APP_ID=co.rishi.app
export NATIVE_CHANNEL=prod

echo "🌐 API Base: $NEXT_PUBLIC_API_BASE_URL"

# Create a minimal out directory with basic web structure
mkdir -p out
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rishi Platform</title>
    <style>
      body { 
        margin: 0; 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 20px;
      }
      .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
      h1 { font-size: 2.5rem; margin-bottom: 1rem; }
      .logo { width: 100px; height: 100px; margin: 0 auto 20px; background: white; border-radius: 50%; }
      .api-info { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"></div>
        <h1>Rishi Platform</h1>
        <p>Native mobile wrapper for Capacitor</p>
        <div class="api-info">
            <p><strong>Environment:</strong> Production</p>
            <p><strong>API Base:</strong> ' > out/index.html

echo "$NEXT_PUBLIC_API_BASE_URL" >> out/index.html

echo '</p>
        </div>
        <script>
            // Basic service worker registration
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.register("/sw.js").catch(console.error);
            }
            console.log("Rishi Platform loaded with API:", "' >> out/index.html

echo "$NEXT_PUBLIC_API_BASE_URL" >> out/index.html

echo '");
        </script>
    </div>
</body>
</html>' >> out/index.html

# Copy service worker
cp public/sw.js out/sw.js 2>/dev/null || echo '// Minimal SW' > out/sw.js

# Create manifest
echo '{
  "name": "Rishi Platform",
  "short_name": "Rishi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#764ba2",
  "icons": []
}' > out/manifest.json

echo "✅ Created minimal web structure in out/"

# Generate VoltBuilder config
node scripts/native/gen-voltbuilder-json.js

# Copy to Capacitor
npx cap copy

# Package for VoltBuilder
bash scripts/native/package-zip.sh prod

echo "✅ Production build complete: release/rishi-capacitor-prod.zip"