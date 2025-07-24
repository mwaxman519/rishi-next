import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { EventBusService } from "../../../services/event-bus-service";
import { getUser } from "../../lib/auth";
import { db } from "@db";

/**
 * Fetch all organizations (admin only)
 *
 * This endpoint retrieves all organizations in the system,
 * but only for users with the correct administrative permissions.
 *
 * @param req - The NextRequest object
 * @returns NextResponse with organizations or error
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current user
    const user = await getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin permission (can view all organizations)
    // For security, only admins should be able to see all organizations
    if (user.role !== "internal_admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }

    try {
      // Attempt to fetch from database first using direct SQL query
      const result = await db.execute(`
        SELECT id, name, type, tier
        FROM organizations
        ORDER BY name
      `);

      // Format the response
      const organizations = (result.rows || []).map((org: any) => ({
        id: org.id,
        name: org.name,
        type: org.type,
        tier: org.tier,
      }));

      return NextResponse.json(organizations);
    } catch (dbError) {
      console.error("Database error fetching organizations:", dbError);

      // Only use mock data in development environment
      if (process.env.NODE_ENV === "development") {
        console.log("DEVELOPMENT MODE: Using mock organizations for testing");
        const mockOrganizations = [
          {
            id: "00000000-0000-0000-0000-000000000001",
            name: "Rishi Internal",
            type: "internal",
            tier: null,
          },
          {
            id: "00000000-0000-0000-0000-000000000002",
            name: "Acme Corp",
            type: "client",
            tier: "tier_1",
          },
          {
            id: "00000000-0000-0000-0000-000000000003",
            name: "TechHub Events",
            type: "client",
            tier: "tier_2",
          },
          {
            id: "00000000-0000-0000-0000-000000000004",
            name: "Global Staffing Partners",
            type: "partner",
            tier: null,
          },
          {
            id: "00000000-0000-0000-0000-000000000005",
            name: "Premium Events Ltd",
            type: "client",
            tier: "tier_3",
          },
        ];

        return NextResponse.json(mockOrganizations);
      }

      // In production or staging, return an empty list rather than exposing mock data
      return NextResponse.json(
        { organizations: [], error: "Failed to fetch organizations" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 },
    );
  }
}
