import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "../../../../services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options";
import { z } from "zod";

// Validation schema for preparation tasks
const preparationTaskSchema = z.object({
  description: z.string().min(1, "Task description is required"),
  assignedTo: z.string().uuid("Invalid user ID").optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

const preparationSchema = z.object({
  preparationTasks: z.array(preparationTaskSchema).optional(),
});

/**
 * Start preparation for an event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify permissions
    if (!session.user.permissions?.includes("manage:events")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const eventId = params.id;
    const data = await request.json();

    // Validate input
    const validatedData = preparationSchema.parse(data);

    // Start event preparation
    const updatedEvent = await bookingsEventsService.startEventPreparation(
      eventId,
      session.user.id,
      validatedData.preparationTasks,
    );

    return NextResponse.json({
      success: true,
      message: "Event preparation started successfully",
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error("Error starting event preparation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start event preparation" },
      { status: 500 },
    );
  }
}
