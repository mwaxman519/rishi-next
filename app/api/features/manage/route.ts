/**
 * API endpoint to manage feature settings for an organization
 */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAuthUser } from "../../../../../lib/auth-server";
import { getCurrentUser } from "../../../../../lib/auth";
import { isUserInOrganization } from "@/lib/organization-server";
import { setFeatureStatus } from "../../../../../shared/features/registry";
import { hasPermission } from "../../../../../lib/permissions";

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { organizationId, featureId, enabled } = body;

    // Validate input
    if (!organizationId || !featureId || enabled === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: organizationId, featureId, enabled",
        },
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

    // Check if user has permission to manage features
    // Get current user for permission check
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const canManageFeatures = await hasPermission(currentUser.id, "create:organizations");
    if (!canManageFeatures) {
      return NextResponse.json(
        { error: "You do not have permission to manage features" },
        { status: 403 },
      );
    }

    // Update the feature status
    await setFeatureStatus(featureId, organizationId, enabled);

    return NextResponse.json({
      success: true,
      message: `Feature ${featureId} ${enabled ? "enabled" : "disabled"} for organization ${organizationId}`,
      feature: {
        id: featureId,
        enabled,
      },
    });
  } catch (error) {
    console.error("Error managing feature status:", error);
    return NextResponse.json(
      { error: "Failed to update feature status" },
      { status: 500 },
    );
  }
}
