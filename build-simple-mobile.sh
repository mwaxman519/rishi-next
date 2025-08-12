#!/bin/bash

# Simple Mobile Build for Rishi Platform
# Creates basic mobile wrapper for VoltBuilder

set -e

echo "🚀 Rishi Platform Simple Mobile Build"
echo "====================================="

# Clean and prepare
rm -rf release/rishi-capacitor.zip
mkdir -p release

# Create minimal index.html for mobile wrapper
cat > out/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rishi Platform</title>
    <style>
        body { margin: 0; padding: 0; font-family: system-ui; }
        iframe { border: none; width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <iframe src="https://rishi-next.vercel.app" allow="camera; geolocation; microphone"></iframe>
</body>
</html>
EOF

# Create offline fallback
cat > out/offline.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rishi Platform - Offline</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: system-ui;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 400px;
        }
        h1 { color: #6b21a8; margin-bottom: 16px; }
        p { color: #6b7280; line-height: 1.6; }
        button {
            background: #6b21a8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            margin-top: 20px;
            cursor: pointer;
        }
        button:hover { background: #581c87; }
    </style>
</head>
<body>
    <div class="container">
        <h1>You're Offline</h1>
        <p>Please check your internet connection and try again.</p>
        <button onclick="window.location.reload()">Retry</button>
    </div>
</body>
</html>
EOF

# Sync with Capacitor
npx cap copy
npx cap sync

# Create VoltBuilder package
echo "📦 Creating VoltBuilder package..."
zip -r release/rishi-capacitor.zip \
  android \
  ios \
  out \
  capacitor.config.ts \
  voltbuilder.json \
  package.json \
  package-lock.json \
  node_modules/@capacitor \
  node_modules/@capacitor-community \
  -x "*.git*" \
  -x "*.DS_Store"

if [ -f "release/rishi-capacitor.zip" ]; then
    SIZE=$(du -h release/rishi-capacitor.zip | cut -f1)
    echo "✅ Package created: release/rishi-capacitor.zip (${SIZE})"
    echo ""
    echo "📱 Upload to VoltBuilder for mobile app generation"
else
    echo "❌ Failed to create package"
    exit 1
fi