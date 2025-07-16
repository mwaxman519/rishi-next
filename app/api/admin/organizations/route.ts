import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "../../../lib/auth";
import { organizations } from "../../../shared/schema";
import {
  hasEnhancedPermission,
  createPermissionContext,
} from "@/lib/rbac-enhanced";

// GET /api/admin/organizations - Get all organizations
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super_admin and internal_admin can access all organizations
    if (!hasEnhancedPermission("view:organizations", authUser.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get organizations
    const allOrganizations = await db.query.organizations.findMany({
      orderBy: (organizations, { desc }) => [desc(organizations.created_at)],
    });

    return NextResponse.json(allOrganizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 },
    );
  }
}

// POST /api/admin/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super_admin and internal_admin can create organizations
    if (!hasEnhancedPermission("create:organizations", authUser.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get organization data from request body
    const data = await request.json();

    // Basic validation
    if (!data.name || !data.type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 },
      );
    }

    // Check if organization already exists
    const existingOrg = await db.query.organizations.findFirst({
      where: eq(organizations.name, data.name),
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization with this name already exists" },
        { status: 409 },
      );
    }

    // Create organization
    const result = await db
      .insert(organizations)
      .values({
        name: data.name,
        type: data.type,
        status: data.status || "active",
        subscription_tier: data.subscription_tier,
        logo_url: data.logo_url,
      })
      .returning();

    const createdOrg = result[0];
    if (!createdOrg) {
      throw new Error('Failed to create organization - no result returned');
    }
    return NextResponse.json(createdOrg, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
