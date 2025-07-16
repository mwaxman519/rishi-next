/**
 * Organization Regions API
 *
 * This endpoint retrieves all regions for a specific organization.
 * The regions are filtered by the organization ID in the URL.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { db } from "../../../lib/db";
import {
  organizations,
  regions,
  organizationRegions,
} from "../../../../shared/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = parseInt(params.id, 10);
    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: "Invalid organization ID" },
        { status: 400 },
      );
    }

    // Special case for development user
    if (user.id === "123e4567-e89b-12d3-a456-426614174000") {
      // Return mock data for development user
      return NextResponse.json({
        regions: [
          {
            id: 1,
            name: "Northern California",
            code: "CA-N",
            type: "state",
            is_primary: true,
          },
          {
            id: 2,
            name: "Southern California",
            code: "CA-S",
            type: "state",
            is_primary: false,
          },
        ],
      });
    }

    // Check if the user has access to this organization
    const userOrg = await db.query.organizations.findFirst({
      where: (orgs, { and, eq }) =>
        and(eq(orgs.id, organizationId), eq(orgs.id, organizationId)),
      with: {
        organizationUsers: {
          where: (ou) => eq(ou.user_id, user.id),
        },
      },
    });

    if (!userOrg || userOrg.organizationUsers.length === 0) {
      return NextResponse.json(
        { error: "Access denied to this organization" },
        { status: 403 },
      );
    }

    // Fetch regions for this organization
    const organizationRegionsWithDetails = await db
      .select({
        id: regions.id,
        name: regions.name,
        code: regions.code,
        type: regions.type,
        is_primary: organizationRegions.is_primary,
      })
      .from(organizationRegions)
      .innerJoin(regions, eq(organizationRegions.region_id, regions.id))
      .where(eq(organizationRegions.organization_id, organizationId));

    return NextResponse.json({
      regions: organizationRegionsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching organization regions:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization regions" },
      { status: 500 },
    );
  }
}
