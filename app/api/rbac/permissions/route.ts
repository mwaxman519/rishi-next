import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;@/lib/db&quot;;
import { permissions } from &quot;@shared/schema&quot;;

/**
 * Fetch all available permissions
 *
 * This endpoint retrieves all permissions defined in the system,
 * allowing the admin panel to display them for organization-specific overrides.
 *
 * @param req - The NextRequest object
 * @returns NextResponse with permissions or error
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch permissions from database
    const allPermissions = await db.select().from(permissions);
    
    return NextResponse.json(allPermissions);
  } catch (error) {
    console.error(&quot;Error fetching permissions:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch permissions&quot; },
      { status: 500 },
    );
  }
}
