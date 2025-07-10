import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { EventBusService } from "../../../services/event-bus-service";
import { v4 as uuidv4 } from "uuid";
import { db } from "@db";
import { tasks } from "@shared/schema";

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assigneeId, title, description, dueDate, priority, type } = body;

    if (!assigneeId || !title) {
      return NextResponse.json(
        { error: "Missing required fields: assigneeId, title" },
        { status: 400 },
      );
    }

    const taskId = crypto.randomUUID();

    const [task] = await db
      .insert(tasks)
      .values({
        assigneeId,
        assignerId: session.user.id,
        title,
        description: description || "",
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "medium",
        type: type || "general",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Publish task creation event
    await fetch("/api/events/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "task.assigned",
        payload: {
          taskId: task?.id,
          assigneeId,
          assignerId: "mock-user-id",
          title,
          dueDate,
          priority,
          organizationId: "mock-org-id",
        },
        timestamp: new Date().toISOString(),
      }),
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}

// GET /api/tasks - Get tasks with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasksList = await db.select().from(tasks);

    return NextResponse.json({
      success: true,
      data: tasksList,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}
