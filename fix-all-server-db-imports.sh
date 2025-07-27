#!/bin/bash

echo "🔧 Fixing ALL server/db imports..."

# Function to calculate correct relative path to lib/db-connection
get_db_connection_path() {
  local file_path="$1"
  local depth=$(echo "$file_path" | tr -cd '/' | wc -c)
  
  case $depth in
    1) echo "../lib/db-connection" ;;        # app/file.ts
    2) echo "../../lib/db-connection" ;;     # app/folder/file.ts  
    3) echo "../../../lib/db-connection" ;;  # app/folder/sub/file.ts
    4) echo "../../../../lib/db-connection" ;; # app/folder/sub/sub2/file.ts
    *) echo "../../lib/db-connection" ;;     # Default fallback
  esac
}

# Fix all server/db imports
find app/ -name "*.ts" -type f | while read file; do
  if grep -q 'from.*server/db' "$file"; then
    echo "Fixing: $file"
    relative_path=$(get_db_connection_path "$file")
    sed -i "s|from [\"'].*server/db[\"']|from \"$relative_path\"|g" "$file"
    # Also fix any server/db imports without quotes
    sed -i "s|from.*server/db|from \"$relative_path\"|g" "$file"
  fi
done

echo "✅ All server/db imports fixed"
