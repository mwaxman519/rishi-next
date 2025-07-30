/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * API endpoint to initialize the feature system for all organizations
 * This is typically called during application startup or after major changes
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { initializeFeatureSystem } from &quot;@shared/features/initialize&quot;;
import { db } from &quot;@/lib/db&quot;;
import { organizations } from &quot;@shared/schema&quot;;
import { initializeOrganizationFeatures } from &quot;@shared/features/registry&quot;;
import { hasPermission } from &quot;@/lib/permissions&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;

export async function POST(request: NextRequest) {
  try {
    // Only super admins should be able to initialize the feature system
    // Get current user for permission check
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }
    
    const hasAccess = await hasPermission(currentUser.id, &quot;create:organizations&quot;);
    if (!hasAccess) {
      return NextResponse.json(
        { error: &quot;Unauthorized: Requires super admin permissions&quot; },
        { status: 403 },
      );
    }

    // Initialize the feature registry first
    initializeFeatureSystem();

    // Get all active organizations
    const allOrgs = await db.query.organizations.findMany({
      where: eq(organizations.status, &quot;active&quot;),
    });

    // Initialize features for each organization
    const initializedOrgs = [];
    for (const org of allOrgs) {
      await initializeOrganizationFeatures(org.id);
      initializedOrgs.push(org.id);
    }

    return NextResponse.json({
      success: true,
      message: &quot;Feature system initialized successfully&quot;,
      initializedOrganizationCount: initializedOrgs.length,
    });
  } catch (error) {
    console.error(&quot;Error initializing feature system:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to initialize feature system&quot; },
      { status: 500 },
    );
  }
}
