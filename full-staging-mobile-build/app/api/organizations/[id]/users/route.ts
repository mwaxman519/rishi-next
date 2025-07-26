import { generateStaticParams } from "./generateStaticParams";

export const dynamic = "force-static";
export const revalidate = false;


/**
 * Organization Users API
 *
 * This endpoint retrieves all users for a specific organization.
 * The users are filtered by the organization ID in the URL.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  organizations,
  users,
  organizationUsers,
} from "@/shared/schema";
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

    // Removed mock data - using only real database queries

    // Check if the user has access to this organization
    const userOrg = await db.query.organizations.findFirst({
      where: (orgs, { and, eq }) => and(eq(orgs.id, organizationId)),
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

    // Fetch users for this organization
    const organizationUsersWithDetails = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: organizationUsers.role,
      })
      .from(organizationUsers)
      .innerJoin(users, eq(organizationUsers.user_id, users.id))
      .where(eq(organizationUsers.organization_id, organizationId));

    return NextResponse.json({
      users: organizationUsersWithDetails,
    });
  } catch (error) {
    console.error("Error fetching organization users:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization users" },
      { status: 500 },
    );
  }
}
