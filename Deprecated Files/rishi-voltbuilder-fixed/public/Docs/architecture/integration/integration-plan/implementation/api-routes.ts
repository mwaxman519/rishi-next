// File: app/api/bookings/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "@/services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Validation schema for approval
const approvalSchema = z.object({
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify permissions
    if (!session.user.permissions?.includes("approve:bookings")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const bookingId = params.id;
    const data = await request.json();

    // Validate input
    const validatedData = approvalSchema.parse(data);

    // Approve the booking and generate events
    await bookingsEventsService.approveBooking(
      bookingId,
      session.user.id,
      validatedData.notes,
    );

    return NextResponse.json(
      { success: true, message: "Booking approved and events generated" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error approving booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve booking" },
      { status: 500 },
    );
  }
}

// File: app/api/events/[id]/assign-manager/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "@/services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Validation schema for manager assignment
const managerAssignmentSchema = z.object({
  managerId: z.string().uuid(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify permissions
    if (!session.user.permissions?.includes("assign:managers")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const eventId = params.id;
    const data = await request.json();

    // Validate input
    const validatedData = managerAssignmentSchema.parse(data);

    // Assign manager to the event
    const updatedEvent = await bookingsEventsService.assignEventToManager(
      eventId,
      validatedData.managerId,
      session.user.id,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Manager assigned to event",
        event: updatedEvent,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error assigning manager to event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign manager" },
      { status: 500 },
    );
  }
}

// File: app/api/events/[id]/start-preparation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "@/services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Validation schema for preparation tasks
const preparationTaskSchema = z.object({
  description: z.string(),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime(),
});

const startPreparationSchema = z.object({
  preparationTasks: z.array(preparationTaskSchema).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
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
    const validatedData = startPreparationSchema.parse(data);

    // Start event preparation
    const updatedEvent = await bookingsEventsService.startEventPreparation(
      eventId,
      session.user.id,
      validatedData.preparationTasks,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Event preparation started",
        event: updatedEvent,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error starting event preparation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start preparation" },
      { status: 500 },
    );
  }
}

// File: app/api/events/[id]/mark-ready/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "@/services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Validation schema for marking event as ready
const markReadySchema = z.object({
  staffAssigned: z.boolean(),
  kitsAssigned: z.boolean(),
  logisticsConfirmed: z.boolean(),
  venueConfirmed: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
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
    const validatedData = markReadySchema.parse(data);

    // Mark event as ready
    const updatedEvent = await bookingsEventsService.markEventReady(
      eventId,
      session.user.id,
      validatedData,
    );

    return NextResponse.json(
      { success: true, message: "Event marked as ready", event: updatedEvent },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error marking event as ready:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark event as ready" },
      { status: 500 },
    );
  }
}

// File: app/api/events/[id]/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "@/services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
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

    // Start the event
    const updatedEvent = await bookingsEventsService.startEvent(
      eventId,
      session.user.id,
    );

    return NextResponse.json(
      { success: true, message: "Event started", event: updatedEvent },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error starting event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start event" },
      { status: 500 },
    );
  }
}

// File: app/api/events/[id]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "@/services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Validation schema for completing an event
const completeEventSchema = z.object({
  actualStartTime: z.string().datetime(),
  actualEndTime: z.string().datetime(),
  outcomes: z.object({
    metExpectations: z.boolean(),
    metrics: z.record(z.string(), z.number()),
    notes: z.string(),
  }),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
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
    const validatedData = completeEventSchema.parse(data);

    // Complete the event
    const updatedEvent = await bookingsEventsService.completeEvent(
      eventId,
      session.user.id,
      validatedData,
    );

    return NextResponse.json(
      { success: true, message: "Event completed", event: updatedEvent },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error completing event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete event" },
      { status: 500 },
    );
  }
}

// File: app/api/events/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "@/services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Validation schema for canceling an event
const cancelEventSchema = z.object({
  reason: z.string(),
  notifyClient: z.boolean().default(true),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
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
    const validatedData = cancelEventSchema.parse(data);

    // Cancel the event
    const updatedEvent = await bookingsEventsService.cancelEvent(
      eventId,
      session.user.id,
      validatedData.reason,
      validatedData.notifyClient,
    );

    return NextResponse.json(
      { success: true, message: "Event cancelled", event: updatedEvent },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error cancelling event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel event" },
      { status: 500 },
    );
  }
}

// File: app/api/events/[id]/report-issue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "@/services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Validation schema for reporting an issue
const reportIssueSchema = z.object({
  issueType: z.enum(["venue", "staff", "kit", "logistics", "client", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string(),
  immediateActionTaken: z.string().optional(),
  activityId: z.string().uuid().optional(),
  photoUrls: z.array(z.string()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;
    const data = await request.json();

    // Validate input
    const validatedData = reportIssueSchema.parse(data);

    // Report the issue
    const updatedEvent = await bookingsEventsService.reportEventIssue(eventId, {
      ...validatedData,
      reportedBy: session.user.id,
    });

    return NextResponse.json(
      { success: true, message: "Issue reported", event: updatedEvent },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error reporting issue:", error);
    return NextResponse.json(
      { error: error.message || "Failed to report issue" },
      { status: 500 },
    );
  }
}
