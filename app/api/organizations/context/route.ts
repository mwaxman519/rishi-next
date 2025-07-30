import { NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getOrganizationContext } from &quot;@/lib/organization-context&quot;;

/**
 * Get the current organization context
 *
 * This endpoint returns the organization context information
 * extracted from the request headers, which is useful for
 * testing and debugging the organization context system.
 *
 * @returns NextResponse with organization context information
 */
export async function GET() {
  try {
    // Get the organization context
    const context = getOrganizationContext();

    // If no context is available, return an error
    if (!context) {
      return NextResponse.json(
        {
          error: &quot;No organization context available&quot;,
          note: &quot;You might need to switch to an organization first&quot;,
        },
        { status: 400 },
      );
    }

    // Return the organization context information
    return NextResponse.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error(&quot;Error getting organization context:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to get organization context&quot; },
      { status: 500 },
    );
  }
}
