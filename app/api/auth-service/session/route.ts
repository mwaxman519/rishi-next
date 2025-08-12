
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "../utils/jwt";

export async function GET() {
  console.log("[Auth Service Session] Starting session verification");
  
  try {
    // Check if JWT_SECRET is available
    const jwtSecret = process.env.JWT_SECRET;
    console.log("[Auth Service Session] JWT_SECRET available:", !!jwtSecret);
    
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    
    console.log("[Auth Service Session] Token found:", !!token);
    console.log("[Auth Service Session] Token length:", token?.length || 0);

    if (!token) {
      console.log("[Auth Service Session] No token found, returning null user");
      const response = {
        success: true,
        data: { user: null },
        service: "auth-service",
        version: "1.0.0"
      };
      console.log("[Auth Service Session] Returning response:", JSON.stringify(response));
      return NextResponse.json(response);
    }

    try {
      console.log("[Auth Service Session] Attempting JWT verification");
      const payload = await verifyJwt(token);
      console.log("[Auth Service Session] JWT verification result:", !!payload);
      
      if (!payload) {
        console.log("[Auth Service Session] JWT verification returned null");
        const response = {
          success: true,
          data: { user: null },
          service: "auth-service",  
          version: "1.0.0"
        };
        console.log("[Auth Service Session] Returning null user response:", JSON.stringify(response));
        return NextResponse.json(response);
      }

      if (!payload.id || !payload.username) {
        console.log("[Auth Service Session] JWT payload missing required fields:", {
          hasId: !!payload.id,
          hasUsername: !!payload.username,
          payload: payload
        });
        const response = {
          success: true,
          data: { user: null },
          service: "auth-service",  
          version: "1.0.0"
        };
        console.log("[Auth Service Session] Returning invalid payload response:", JSON.stringify(response));
        return NextResponse.json(response);
      }

      console.log("[Auth Service Session] JWT verified successfully for user:", payload.username);
      
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

      const response = {
        success: true,
        data: { user },
        service: "auth-service",
        version: "1.0.0"
      };

      console.log("[Auth Service Session] Returning successful user response:", {
        success: response.success,
        hasUser: !!response.data.user,
        username: response.data.user.username,
        service: response.service
      });

      return NextResponse.json(response);
    } catch (jwtError) {
      console.error("[Auth Service Session] JWT verification failed:", jwtError);
      const response = {
        success: true,
        data: { user: null },
        service: "auth-service",
        version: "1.0.0"
      };
      console.log("[Auth Service Session] Returning JWT error response:", JSON.stringify(response));
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("[Auth Service Session] Critical session verification error:", error);
    const response = {
      success: false,
      error: {
        message: "Session verification failed",
        code: "SESSION_ERROR"
      },
      service: "auth-service",
      version: "1.0.0"
    };
    console.log("[Auth Service Session] Returning critical error response:", JSON.stringify(response));
    return NextResponse.json(response, { status: 500 });
  }
}
