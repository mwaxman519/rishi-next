/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * API endpoint to check if a specific feature is enabled for an organization
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getCurrentAuthUser } from &quot;@/lib/auth-server&quot;;
import {
  isUserInOrganization,
  getOrganizationById,
} from &quot;@/lib/organization-server&quot;;
import {
  isFeatureEnabled,
  isFeatureAvailableForTier,
} from &quot;@shared/features/registry&quot;;

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const organizationId = (searchParams.get(&quot;organizationId&quot;) || undefined);
    const featureId = (searchParams.get(&quot;featureId&quot;) || undefined);

    // Validate input
    if (!organizationId || !featureId) {
      return NextResponse.json(
        { error: &quot;Missing required parameters: organizationId and featureId&quot; },
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

    // Get organization details
    const organization = await getOrganizationById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: &quot;Organization not found&quot; },
        { status: 404 },
      );
    }

    // Check if feature is available for the organization's tier
    const isAvailable = isFeatureAvailableForTier(featureId, (organization.tier || &quot;tier_1&quot;) || &quot;tier_1&quot;);

    if (!isAvailable) {
      return NextResponse.json({
        enabled: false,
        available: false,
        message: `Feature '${featureId}' is not available for ${organization.name}'s tier (${(organization.tier || &quot;tier_1&quot;) || &quot;none&quot;})`,
      });
    }

    // Check if feature is explicitly enabled for the organization
    const isEnabled = await isFeatureEnabled(featureId, organizationId);

    return NextResponse.json({
      enabled: isEnabled,
      available: true,
      organizationId,
      featureId,
    });
  } catch (error) {
    console.error(&quot;Error checking feature status:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to check feature status&quot; },
      { status: 500 },
    );
  }
}
