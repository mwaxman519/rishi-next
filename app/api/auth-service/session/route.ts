
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "../utils/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({
        success: true,
        data: { user: null },
        service: "auth-service",
        version: "1.0.0"
      });
    }

    try {
      const payload = await verifyJwt(token);
      
      if (!payload || !payload.id || !payload.username) {
        console.log("JWT payload invalid or missing required fields:", payload);
        return NextResponse.json({
          success: true,
          data: { user: null },
          service: "auth-service",  
          version: "1.0.0"
        });
      }

      console.log("JWT verified successfully for user:", payload.username);
      
      const user = {
        id: payload.id,
        username: payload.username,
        role: payload.role || 'brand_agent',
        fullName: payload.fullName || payload.username,
        email: payload.email || `${payload.username}@internal.rishi.com`,
        active: true,
        organizations: [
          {
            orgId: "ec83b1b1-af6e-4465-806e-8d51a1449e86",
            orgName: "Rishi Internal",
            orgType: "internal",
            role: payload.role || 'brand_agent',
            isPrimary: true,
          },
        ],
        currentOrganization: {
          orgId: "ec83b1b1-af6e-4465-806e-8d51a1449e86",
          orgName: "Rishi Internal",
          orgType: "internal",
          role: payload.role || 'brand_agent',
          isPrimary: true,
        },
      };

      return NextResponse.json({
        success: true,
        data: { user },
        service: "auth-service",
        version: "1.0.0"
      });
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json({
        success: true,
        data: { user: null },
        service: "auth-service",
        version: "1.0.0"
      });
    }
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({
      success: false,
      error: {
        message: "Session verification failed",
        code: "SESSION_ERROR"
      },
      service: "auth-service",
      version: "1.0.0"
    }, { status: 500 });
  }
}
