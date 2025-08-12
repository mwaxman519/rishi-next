#!/usr/bin/env bash
set -euo pipefail
export NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-https://rishi-next.vercel.app}"

cp next.config.mjs next.config.mjs.bak
cp next.config.static.mjs next.config.mjs

API_DIR="app/api"
API_BAK="app/api.__disabled_for_export__"
if [ -d "$API_DIR" ]; then mv "$API_DIR" "$API_BAK"; fi

rm -rf out .next
ESLINT_CONFIG_PATH=.eslintrc.build.json npx next build --no-lint
[ -d out ] || { echo "❌ No out/ produced. Export blockers present."; exit 1; }

mv next.config.mjs.bak next.config.mjs
if [ -d "$API_BAK" ]; then mv "$API_BAK" "$API_DIR"; fi

npx cap copy

mkdir -p release
ZIP=release/rishi-capacitor.zip
rm -f "$ZIP"
zip -r "$ZIP" \
  android ios out capacitor.config.* voltbuilder.json package.json package-lock.json \
  node_modules/@capacitor node_modules/@capacitor-* >/dev/null

echo "✅ Built: $ZIP"