import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { cookies } from &quot;next/headers&quot;;
import { getCurrentAuthUser } from &quot;@/lib/auth-server&quot;;
import { SignJWT } from &quot;jose&quot;;

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
        { error: &quot;Organization ID is required&quot; },
        { status: 400 },
      );
    }

    // Get the current user
    const user = await getCurrentAuthUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    console.log(`Switching to organization ID: ${organizationId}`);

    // In a real app, we would verify that the user has access to the specified organization
    // and retrieve their role in that organization
    // For development, we'll assume the user has access and use the provided role or their system role

    // Cookie options for both organization ID and JWT token
    const cookieOptions = {
      path: &quot;/&quot;,
      httpOnly: true, // Can't be accessed by client-side JavaScript
      secure: (process.env.NODE_ENV as string) === &quot;production&quot;, // Only send over HTTPS in production
      sameSite: &quot;lax&quot; as const, // Helps prevent CSRF attacks
      maxAge: 30 * 24 * 60 * 60, // 30 days
    };

    // Create a new JWT token with the updated organization context
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error(&quot;JWT_SECRET environment variable is required&quot;);
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
      .setProtectedHeader({ alg: &quot;HS256&quot; })
      .setIssuedAt()
      .setExpirationTime(&quot;24h&quot;)
      .sign(secretKey);

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: &quot;Organization switched successfully&quot;,
      organizationId,
    });

    // Set the organization ID cookie
    response.cookies.set(
      &quot;currentOrganizationId&quot;,
      String(organizationId),
      cookieOptions,
    );

    // Set the new JWT token cookie
    response.cookies.set(&quot;token&quot;, token, cookieOptions);

    return response;
  } catch (error) {
    console.error(&quot;Error switching organization:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to switch organization&quot; },
      { status: 500 },
    );
  }
}
