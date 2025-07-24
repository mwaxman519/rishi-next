import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { checkPermission } from "../../../../lib/rbac";
import { db } from "../../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage locations
    if (!(await checkPermission(req, "manage:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    try {
      // Get pending locations from database
      const pendingLocations = await db.location.findMany({
        where: {
          status: "pending",
          approved: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

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
