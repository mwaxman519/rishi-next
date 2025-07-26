#!/bin/bash
echo "🔧 Restoring Staging Authentication System..."

# Find and restore all auth-related API routes that were stubbed for VoltBuilder
echo "🔍 Finding stubbed auth routes..."

# Find all API routes that mention "VoltBuilder build-time route"
STUBBED_ROUTES=$(grep -r "VoltBuilder build-time route" app/api/ --include="*.ts" | cut -d: -f1 | sort -u)

echo "Found stubbed routes:"
echo "$STUBBED_ROUTES"

# Check if auth-check route is stubbed too
if grep -q "VoltBuilder build-time route" app/api/auth-check/route.ts 2>/dev/null; then
    echo "🔧 Restoring auth-check route..."
    
    cat > app/api/auth-check/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log('[AUTH-CHECK] Authentication check requested');
    
    // Get current user session  
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('[AUTH-CHECK] No authenticated user found');
      return NextResponse.json({ authenticated: false });
    }

    console.log('[AUTH-CHECK] User authenticated:', user.username);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    console.error('[AUTH-CHECK] Authentication check failed:', error);
    return NextResponse.json({ authenticated: false, error: error.message });
  }
}
EOF
    
    echo "✅ auth-check route restored"
fi

echo "✅ Staging authentication system restored"
echo "🚀 Staging should now authenticate properly"