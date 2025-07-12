/**
 * API endpoint to list all features for an organization
 */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/lib/auth-server";
import {
  isUserInOrganization,
  getOrganizationById,
} from "@/lib/organization-server";
import {
  FeatureModuleRegistry,
  getAllModules,
  isFeatureAvailableForTier,
} from "../../../../shared/features/registry";

export async function GET(request: NextRequest) {
  try {
    // Get the organization ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId") || undefined;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId parameter is required" },
        { status: 400 },
      );
    }

    // Check authentication
    const user = await getCurrentAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check if user belongs to the organization
    const isMember = await isUserInOrganization(user.id, organizationId);
    if (!isMember) {
      return NextResponse.json(
        { error: "You do not have access to this organization" },
        { status: 403 },
      );
    }

    // Get organization details
    const organization = await getOrganizationById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Get all feature modules
    const featureModules = getAllModules();

    // Check if each feature is enabled for this organization
    const featuresWithStatus = featureModules.map((module) => {
      const orgTier =
        (organization.tier as "tier_1" | "tier_2" | "tier_3") || "tier_1";
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
        tier: organization.tier || "tier_1",
      },
    });
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 },
    );
  }
}
