import { generateStaticParams } from "./generateStaticParams";

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db-connection";
import { users, userOrganizations } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
// Mock auth for development
const authOptions = {};

// GET /api/team/[id] - Get team member details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [teamMember] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        location: users.location,
        bio: users.bio,
        status: users.status,
        createdAt: users.createdAt,
        role: userOrganizations.role,
      })
      .from(users)
      .leftJoin(userOrganizations, eq(users.id, userOrganizations.userId))
      .where(eq(users.id, id))
      .limit(1);

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    console.error("Error fetching team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/team/[id] - Update team member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, location, bio, status, role, specialties } =
      body;

    // Update user details
    const [updatedUser] = await db
      .update(users)
      .set({
        name,
        email,
        phone,
        location,
        bio,
        status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, params.id))
      .returning();

    // Update role if provided
    if (role) {
      await db
        .update(userOrganizations)
        .set({
          role,
          updatedAt: new Date(),
        })
        .where(eq(userOrganizations.userId, params.id));
    }

    // Publish event for microservices
    await fetch("/api/events/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "team.member.updated",
        payload: {
          memberId: params.id,
          updatedData: body,
          updatedBy: (session.user as any).id,
          organizationId: (session.user as any).organizationId,
        },
        timestamp: new Date().toISOString(),
      }),
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
