#!/bin/bash
# Simple start script for development mode

# Ensure proper permissions
chmod +x build.sh start.sh 2>/dev/null || true

export PORT=5000
export HOSTNAME=0.0.0.0
export NEXT_PUBLIC_PORT=5000
export NEXT_PUBLIC_HOSTNAME=0.0.0.0

echo "Starting Next.js development server on $HOSTNAME:$PORT..."
npm run dev