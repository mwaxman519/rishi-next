#!/bin/bash

# List of files that need the params fix
files=(
"app/api/admin/locations/[id]/approve/route.ts"
"app/api/admin/locations/[id]/reject/route.ts"
"app/api/availability/[id]/route.ts"
"app/api/bookings/[id]/approve/route.ts"
"app/api/bookings/[id]/events/route.ts"
"app/api/bookings/[id]/reject/route.ts"
"app/api/events/[id]/activities/route.ts"
"app/api/events/[id]/assign-manager/route.ts"
"app/api/events/[id]/mark-ready/route.ts"
"app/api/events/[id]/prepare/route.ts"
"app/api/events/[id]/staff/route.ts"
"app/api/events/[id]/route.ts"
"app/api/items/[id]/route.ts"
"app/api/kits/[id]/route.ts"
"app/api/kits/activity-kits/[id]/route.ts"
"app/api/kits/instances/[id]/approve/route.ts"
"app/api/kits/instances/[id]/reject/route.ts"
"app/api/kits/instances/[id]/route.ts"
"app/api/locations/[id]/approve/route.ts"
"app/api/locations/[id]/reject/route.ts"
"app/api/locations/[id]/route.ts"
"app/api/notifications/[id]/read/route.ts"
"app/api/organizations/[id]/feature-settings/route.ts"
"app/api/organizations/[id]/regions/route.ts"
"app/api/organizations/[id]/users/route.ts"
"app/api/shifts/[id]/route.ts"
"app/api/users/[id]/permissions/route.ts"
"app/api/users/[id]/route.ts"
"app/api/team/[id]/deactivate/route.ts"
"app/api/team/[id]/route.ts"
)

echo "Found ${#files[@]} API route files to fix"

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    # Count occurrences
    count=$(grep -c "params: { id: string" "$file" 2>/dev/null || echo "0")
    if [ "$count" -gt 0 ]; then
      echo "  - Found $count occurrences to fix"
    fi
  else
    echo "  - File not found: $file"
  fi
done

