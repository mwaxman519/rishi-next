import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getCurrentAuthUser } from &quot;@/lib/auth-server&quot;;

/**
 * Get current authenticated user
 * @returns NextResponse with user data or error
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentAuthUser();

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          error: &quot;Not authenticated&quot;,
        },
        { status: 401 },
      );
    }

    // Return in the format expected by useAuth hook
    return NextResponse.json({
      authenticated: true,
      user: user,
    });
  } catch (error) {
    console.error(&quot;Error getting user:&quot;, error);
    return NextResponse.json(
      {
        authenticated: false,
        error: &quot;Error getting user&quot;,
      },
      { status: 500 },
    );
  }
}
