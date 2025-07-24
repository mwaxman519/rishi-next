#!/bin/bash

echo "🔍 Testing individual components for build hanging issues..."

# Function to test build with specific exclusions
test_build_with_exclusions() {
  local exclude_pattern="$1"
  local test_name="$2"
  
  echo "Testing build excluding: $test_name"
  
  # Temporarily rename files to exclude them
  find . -name "$exclude_pattern" -type f -exec mv {} {}.bak \;
  
  # Try build with timeout
  timeout 15 npx next build >/dev/null 2>&1
  local exit_code=$?
  
  # Restore files
  find . -name "*.bak" -type f | while read file; do
    mv "$file" "${file%.bak}"
  done
  
  if [ $exit_code -eq 0 ]; then
    echo "✅ Build SUCCEEDED without: $test_name"
    return 0
  elif [ $exit_code -eq 124 ]; then
    echo "❌ Build TIMED OUT with: $test_name"
    return 1
  else
    echo "⚠️  Build FAILED (other error) with: $test_name"
    return 1
  fi
}

# Test various components
test_build_with_exclusions "*/admin/page.tsx" "admin dashboard"
test_build_with_exclusions "*/admin/organizations*" "admin organizations"
test_build_with_exclusions "*/admin/users*" "admin users"