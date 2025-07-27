import { generateStaticParams } from "./generateStaticParams";

export const dynamic = "force-static";
export const revalidate = false;



import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activities } from "@/shared/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { USER_ROLES } from "@/shared/schema";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has rejection permissions
    const canReject = [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.INTERNAL_ADMIN,
      USER_ROLES.INTERNAL_FIELD_MANAGER,
    ].includes((session.user as any).role);

    if (!canReject) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // Get the current activity state
    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 },
      );
    }

    // Check if the activity is in a state that can be rejected
    const rejectableStates = ["draft", "pending"];

    if (!rejectableStates.includes(activity.status)) {
      return NextResponse.json(
        {
          error: "Cannot reject this activity",
          message: `Activity status is ${activity.status}, must be one of: ${rejectableStates.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Update activity status to rejected
    const [updatedActivity] = await db
      .update(activities)
      .set({
        status: "rejected",
        notes: reason
          ? `${activity.notes || ""}\n\nRejection reason: ${reason}`.trim()
          : activity.notes,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();

    // In a real app, you would likely:
    // 1. Send notifications to relevant parties
    // 2. Log the rejection action in an audit log

    return NextResponse.json({
      message: "Activity rejected successfully",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Error rejecting activity:", error);
    return NextResponse.json(
      { error: "Failed to reject activity" },
      { status: 500 },
    );
  }
}
