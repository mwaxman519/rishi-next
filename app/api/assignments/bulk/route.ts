import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { bookings } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkPermission(request, "create:bookings"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { assignments } = await request.json();

    if (!Array.isArray(assignments)) {
      return NextResponse.json({ error: "Assignments must be an array" }, { status: 400 });
    }

    // Process bulk assignments
    const results = [];
    for (const assignment of assignments) {
      try {
        const [newAssignment] = await db.insert(bookings).values({
          ...assignment,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        results.push({ success: true, assignment: newAssignment });
      } catch (error) {
        results.push({ success: false, error: error.message, assignment });
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      total: assignments.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
  } catch (error) {
    console.error("Bulk assignments POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
