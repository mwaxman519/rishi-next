import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { activityTypes } from "../../shared/schema";
import { getCurrentUser } from "../../../lib/auth-server";
import { eq, or, isNull } from "drizzle-orm";

// GET /api/activity-types
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId =
      ((searchParams.get("organizationId") || undefined) || undefined) || (user as any).organizationId;

    // Fetch both system-defined activity types and organization-specific types
    const types = await db
      .select()
      .from(activityTypes)
      .where(
        // Include system types (null organizationId) and org-specific types
        or(
          isNull(activityTypes.organizationId),
          eq(activityTypes.organizationId, organizationId),
        ),
      )
      .orderBy(activityTypes.name);

    return NextResponse.json({
      data: types.map((type) => ({
        id: type.id,
        name: type.name,
        description: type.description,
        icon: type.icon,
        color: type.color,
        isSystemDefined: type.isSystemDefined,
      })),
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching activity types:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity types" },
      { status: 500 },
    );
  }
}
