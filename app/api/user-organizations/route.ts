/**
 * User Organizations API Routes
 */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { organizations, userOrganizations } from "@/shared/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * GET /api/user-organizations
 * Get all organizations accessible by the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let organizationsData;

    // Apply role-based filtering
    if (user.role === "super_admin" || user.role === "internal_admin") {
      // Super admins and internal admins can see all organizations
      organizationsData = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          type: organizations.type,
          status: organizations.status,
        })
        .from(organizations)
        .where(eq(organizations.status, "active"));
    } else {
      // Other users can only see organizations they have access to
      const userOrgs = await db
        .select({ organizationId: userOrganizations.organizationId })
        .from(userOrganizations)
        .where(eq(userOrganizations.userId, user.id));
      
      const orgIds = userOrgs.map(org => org.organizationId);
      
      if (orgIds.length > 0) {
        organizationsData = await db
          .select({
            id: organizations.id,
            name: organizations.name,
            type: organizations.type,
            status: organizations.status,
          })
          .from(organizations)
          .where(inArray(organizations.id, orgIds));
      } else {
        // No organizations, return empty result
        organizationsData = [];
      }
    }

    return NextResponse.json(organizationsData);
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}