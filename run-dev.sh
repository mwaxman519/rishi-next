#!/bin/bash
# Custom development script to ensure proper hostname binding

export HOSTNAME=0.0.0.0
export PORT=5000
export NEXT_PUBLIC_PORT=5000
export NEXT_PUBLIC_HOSTNAME=0.0.0.0
export NODE_OPTIONS="--max-old-space-size=4096"

echo "Setting up environment for Next.js server..."
echo "Starting Next.js development server on $HOSTNAME:$PORT"
echo "Using NODE_OPTIONS: $NODE_OPTIONS"

# Clean the .next directory to avoid stale files
rm -rf .next

# Start Next.js with proper host binding
next dev -p $PORT -H $HOSTNAME