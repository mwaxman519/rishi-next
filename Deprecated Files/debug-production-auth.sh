#!/bin/bash

echo "🔍 COMPREHENSIVE PRODUCTION AUTHENTICATION DEBUG"
echo "================================================="

echo ""
echo "1. Testing production health..."
curl -s -m 5 "https://rishi-next-4g4s84iwt-mwaxman519s-projects.vercel.app/api/health" | head -5

echo ""
echo "2. Testing auth service status..."
curl -s -m 5 "https://rishi-next-4g4s84iwt-mwaxman519s-projects.vercel.app/api/auth-service/status" | jq -r '.status'

echo ""
echo "3. Testing production login (after deployment)..."
curl -X POST "https://rishi-next-4g4s84iwt-mwaxman519s-projects.vercel.app/api/auth-service/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "mike", "password": "wrench519"}' \
  -s -m 5 | jq -r '.error // .success'

echo ""
echo "4. Testing debug endpoint (after deployment)..."
curl -X POST "https://rishi-next-4g4s84iwt-mwaxman519s-projects.vercel.app/api/debug/production-login" \
  -H "Content-Type: application/json" \
  -d '{"username": "mike", "password": "wrench519"}' \
  -s -m 5 | jq '.'

echo ""
echo "🚀 Deploy the current version to see debug output!"
