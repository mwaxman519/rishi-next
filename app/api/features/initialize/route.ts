/**
 * API endpoint to initialize the feature system for all organizations
 * This is typically called during application startup or after major changes
 */
import { NextRequest, NextResponse } from "next/server";
import { initializeFeatureSystem } from "../../../../shared/features/initialize";
import { db } from "@/lib/db";
import { organizations } from "@shared/schema";
import { initializeOrganizationFeatures } from "../../../../shared/features/registry";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Only super admins should be able to initialize the feature system
    // Get current user for permission check
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const hasAccess = await hasPermission(currentUser.id, "create:organizations");
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: Requires super admin permissions" },
        { status: 403 },
      );
    }

    // Initialize the feature registry first
    initializeFeatureSystem();

    // Get all active organizations
    const allOrgs = await db.query.organizations.findMany({
      where: { status: "active" },
    });

    // Initialize features for each organization
    const initializedOrgs = [];
    for (const org of allOrgs) {
      await initializeOrganizationFeatures(org.id);
      initializedOrgs.push(org.id);
    }

    return NextResponse.json({
      success: true,
      message: "Feature system initialized successfully",
      initializedOrganizationCount: initializedOrgs.length,
    });
  } catch (error) {
    console.error("Error initializing feature system:", error);
    return NextResponse.json(
      { error: "Failed to initialize feature system" },
      { status: 500 },
    );
  }
}
