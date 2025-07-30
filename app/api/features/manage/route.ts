/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * API endpoint to manage feature settings for an organization
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getCurrentAuthUser } from &quot;@/lib/auth-server&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { isUserInOrganization } from &quot;@/lib/organization-server&quot;;
import { setFeatureStatus } from &quot;@shared/features/registry&quot;;
import { hasPermission } from &quot;@/lib/permissions&quot;;

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { organizationId, featureId, enabled } = body;

    // Validate input
    if (!organizationId || !featureId || enabled === undefined) {
      return NextResponse.json(
        {
          error: &quot;Missing required fields: organizationId, featureId, enabled&quot;,
        },
        { status: 400 },
      );
    }

    // Check authentication
    const user = await getCurrentAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: &quot;Authentication required&quot; },
        { status: 401 },
      );
    }

    // Check if user belongs to the organization
    const isMember = await isUserInOrganization(user.id, organizationId);
    if (!isMember) {
      return NextResponse.json(
        { error: &quot;You do not have access to this organization&quot; },
        { status: 403 },
      );
    }

    // Check if user has permission to manage features
    // Get current user for permission check
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }
    
    const canManageFeatures = await hasPermission(currentUser.id, &quot;create:organizations&quot;);
    if (!canManageFeatures) {
      return NextResponse.json(
        { error: &quot;You do not have permission to manage features&quot; },
        { status: 403 },
      );
    }

    // Update the feature status
    await setFeatureStatus(featureId, organizationId, enabled);

    return NextResponse.json({
      success: true,
      message: `Feature ${featureId} ${enabled ? &quot;enabled&quot; : &quot;disabled&quot;} for organization ${organizationId}`,
      feature: {
        id: featureId,
        enabled,
      },
    });
  } catch (error) {
    console.error(&quot;Error managing feature status:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to update feature status&quot; },
      { status: 500 },
    );
  }
}
