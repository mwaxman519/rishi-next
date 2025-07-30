/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * API endpoint to list all features for an organization
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getCurrentAuthUser } from &quot;@/lib/auth-server&quot;;
import {
  isUserInOrganization,
  getOrganizationById,
} from &quot;@/lib/organization-server&quot;;
import {
  FeatureModuleRegistry,
  getAllModules,
  isFeatureAvailableForTier,
} from &quot;@shared/features/registry&quot;;

export async function GET(request: NextRequest) {
  try {
    // Get the organization ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const organizationId = (searchParams.get(&quot;organizationId&quot;) || undefined) || undefined;

    if (!organizationId) {
      return NextResponse.json(
        { error: &quot;organizationId parameter is required&quot; },
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

    // Get all feature modules
    const featureModules = getAllModules();

    // Check if each feature is enabled for this organization
    const featuresWithStatus = featureModules.map((module) => {
      const orgTier =
        ((organization.tier || &quot;tier_1&quot;) as &quot;tier_1&quot; | &quot;tier_2&quot; | &quot;tier_3&quot;) || &quot;tier_1&quot;;
      const enabled = isFeatureAvailableForTier(module.id, orgTier);

      return {
        id: module.id,
        name: module.name,
        description: module.description,
        tier: module.tier,
        dependencies: module.dependencies,
        enabled,
      };
    });

    return NextResponse.json({
      success: true,
      features: featuresWithStatus,
      organization: {
        id: organization.id,
        name: organization.name,
        tier: (organization.tier || &quot;tier_1&quot;) || &quot;tier_1&quot;,
      },
    });
  } catch (error) {
    console.error(&quot;Error fetching features:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch features&quot; },
      { status: 500 },
    );
  }
}
