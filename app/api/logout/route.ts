/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Logout API Endpoint
 * Handles user logout by clearing session cookies
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { cookies } from &quot;next/headers&quot;;

// Logout handler
export async function POST(request: NextRequest) {
  try {
    console.log(&quot;Processing logout request...&quot;);

    // Clear the session cookie
    const cookieStore = cookies();
    cookieStore.delete(&quot;session&quot;);

    console.log(&quot;User logged out successfully&quot;);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: &quot;Logged out successfully&quot;,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(&quot;Error in logout process:&quot;, error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: &quot;Failed to logout&quot;,
        details: error instanceof Error ? error.message : &quot;Unknown error&quot;,
      },
      { status: 500 },
    );
  }
}
