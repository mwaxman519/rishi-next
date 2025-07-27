#!/bin/bash

# Function to calculate the relative path depth
get_relative_path() {
  local file_path="$1"
  local depth=$(echo "$file_path" | tr -cd '/' | wc -c)
  
  case $depth in
    2) echo "../../lib/db-connection" ;;  # app/api/file.ts
    3) echo "../../../lib/db-connection" ;;  # app/api/folder/file.ts
    4) echo "../../../../lib/db-connection" ;;  # app/api/folder/subfolder/file.ts
    5) echo "../../../../../lib/db-connection" ;;  # app/api/folder/subfolder/sub/file.ts
    *) echo "../../../lib/db-connection" ;;  # Default fallback
  esac
}

# Find all files with @db imports and fix them
find app/api -name "*.ts" -type f | while read file; do
  if grep -q 'from "@db"' "$file"; then
    echo "Fixing: $file"
    relative_path=$(get_relative_path "$file")
    sed -i "s|from \"@db\"|from \"$relative_path\"|g" "$file"
  fi
done

echo "✅ All @db imports fixed"
