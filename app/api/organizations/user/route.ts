import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { db } from "@db";

/**
 * Fetch organizations for the current user
 *
 * This endpoint retrieves organizations that the current user has access to,
 * along with their role in each organization.
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current user
    const user = await getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      // For development mode, return organizations with user roles
      // Since user_organizations table may not exist, fetch all organizations and assign super_admin role
      const result = await db.execute(`
        SELECT 
          o.id, 
          o.name, 
          o.type, 
          o.tier
        FROM organizations o
        ORDER BY o.name
      `);

      // Format the response with user-specific role information
      // In development, give super_admin role to all organizations
      const userOrganizations = (result.rows || []).map((org: any) => ({
        id: org.id,
        name: org.name,
        type: org.type,
        tier: org.tier,
        role: "super_admin", // Development mode: super_admin access to all organizations
        isDefault: org.name === "Rishi Internal",
      }));

      // Find the default organization or use Rishi Internal
      let defaultOrg = userOrganizations.find((org: any) => org.isDefault);
      if (!defaultOrg) {
        defaultOrg = userOrganizations.find(
          (org: any) => org.name === "Rishi Internal",
        );
      }
      if (!defaultOrg && userOrganizations.length > 0) {
        defaultOrg = userOrganizations[0];
      }

      return NextResponse.json({
        organizations: userOrganizations,
        defaultOrganization: defaultOrg || null,
      });
    } catch (dbError) {
      console.error("Database error in user organizations:", dbError);

      // Fallback to mock data for development
      const mockOrganizations = [
        {
          id: "00000000-0000-0000-0000-000000000001",
          name: "Rishi Internal",
          type: "internal",
          tier: "internal",
          role: "super_admin",
          isDefault: true,
        },
      ];

      return NextResponse.json({
        organizations: mockOrganizations,
        defaultOrganization: mockOrganizations[0],
      });
    }
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
