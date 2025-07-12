/**
 * API endpoint to check if a specific feature is enabled for an organization
 */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/lib/auth-server";
import {
  isUserInOrganization,
  getOrganizationById,
} from "@/lib/organization-server";
import {
  isFeatureEnabled,
  isFeatureAvailableForTier,
} from "../../../../shared/features/registry";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const featureId = searchParams.get("featureId");

    // Validate input
    if (!organizationId || !featureId) {
      return NextResponse.json(
        { error: "Missing required parameters: organizationId and featureId" },
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

    // Check if feature is available for the organization's tier
    const isAvailable = isFeatureAvailableForTier(featureId, organization.tier || "tier_1");

    if (!isAvailable) {
      return NextResponse.json({
        enabled: false,
        available: false,
        message: `Feature '${featureId}' is not available for ${organization.name}'s tier (${organization.tier || "none"})`,
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
    console.error("Error checking feature status:", error);
    return NextResponse.json(
      { error: "Failed to check feature status" },
      { status: 500 },
    );
  }
}
