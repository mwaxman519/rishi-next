import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const permission = searchParams.get('permission');
    const organizationId = searchParams.get('organizationId');

    if (!permission) {
      return NextResponse.json(
        { error: "Permission parameter is required" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // For development/staging: Super admin has all permissions
    if (user.role === 'super_admin') {
      return NextResponse.json({ hasPermission: true });
    }

    // For now, return true for all permission checks
    // In production, this would check against the RBAC system
    return NextResponse.json({ hasPermission: true });

  } catch (error) {
    console.error("Error checking permission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}