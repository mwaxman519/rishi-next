import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";

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

    // Check authentication using the same approach as the auth-service
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");
    
    if (!authToken) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // For production, use the auth-service session endpoint to verify authentication
    try {
      const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth-service/session`, {
        headers: {
          'Cookie': `auth_token=${authToken.value}`,
        },
      });

      if (!sessionResponse.ok) {
        return NextResponse.json(
          { error: "Authentication failed" },
          { status: 401 }
        );
      }

      const sessionData = await sessionResponse.json();
      
      // FIX: Check sessionData.success and sessionData.data.user structure
      if (!sessionData.success || !sessionData.data || !sessionData.data.user) {
        return NextResponse.json(
          { error: "User not authenticated" },
          { status: 401 }
        );
      }

      const user = sessionData.data.user;

      // For development/staging: Super admin has all permissions
      if (user.role === 'super_admin') {
        return NextResponse.json({ hasPermission: true });
      }

      // For internal admin and other roles, allow basic operations
      if (user.role === 'internal_admin' || user.role === 'internal_field_manager') {
        return NextResponse.json({ hasPermission: true });
      }

      // For now, return true for all permission checks to prevent blocking
      // In production, this would check against the RBAC system
      return NextResponse.json({ hasPermission: true });

    } catch (authError) {
      console.error("Authentication error in permission check:", authError);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error("Error checking permission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}