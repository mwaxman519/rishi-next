import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

import { cookies } from "next/headers";
import { getCurrentAuthUser } from "@/lib/auth-server";
import { SignJWT } from "jose";

/**
 * Switch the current user's active organization
 *
 * This endpoint allows a user to switch between organizations they have access to.
 * It sets a cookie with the selected organization ID and updates the JWT token
 * with the new organization context.
 *
 * @param req The NextRequest object containing the organization ID to switch to
 * @returns NextResponse with success/error
 */
export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    const { organizationId, organizationRole } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    // Get the current user
    const user = await getCurrentAuthUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`Switching to organization ID: ${organizationId}`);

    // In a real app, we would verify that the user has access to the specified organization
    // and retrieve their role in that organization
    // For development, we'll assume the user has access and use the provided role or their system role

    // Cookie options for both organization ID and JWT token
    const cookieOptions = {
      path: "/",
      httpOnly: true, // Can't be accessed by client-side JavaScript
      secure: (process.env.NODE_ENV as string) === "production", // Only send over HTTPS in production
      sameSite: "lax" as const, // Helps prevent CSRF attacks
      maxAge: 30 * 24 * 60 * 60, // 30 days
    };

    // Create a new JWT token with the updated organization context
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    const secretKey = new TextEncoder().encode(jwtSecret);

    // Create the payload with organization information
    const payload = {
      id: user.id,
      username: user.email,
      role: user.role,
      fullName: user.fullName,
      organizationId: organizationId,
      organizationRole: organizationRole || user.role,
      // Other properties would be populated from the database in production
      regionIds: [],
    };

    // Sign the token
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secretKey);

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: "Organization switched successfully",
      organizationId,
    });

    // Set the organization ID cookie
    response.cookies.set(
      "currentOrganizationId",
      String(organizationId),
      cookieOptions,
    );

    // Set the new JWT token cookie
    response.cookies.set("token", token, cookieOptions);

    return response;
  } catch (error) {
    console.error("Error switching organization:", error);
    return NextResponse.json(
      { error: "Failed to switch organization" },
      { status: 500 },
    );
  }
}
