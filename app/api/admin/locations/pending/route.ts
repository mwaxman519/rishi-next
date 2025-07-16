import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { checkPermission } from "@/lib/rbac";
import { db } from "../../../lib/db";
import { locations } from "../../../../shared/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage locations
    if (!(await checkPermission(user, "update:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    try {
      // Get pending locations from database using Drizzle ORM
      const pendingLocations = await db
        .select()
        .from(locations)
        .where(eq(locations.status, "pending"))
        .orderBy(desc(locations.created_at));

      return NextResponse.json(pendingLocations);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error fetching pending locations:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch pending locations",
      },
      { status: 500 },
    );
  }
}
