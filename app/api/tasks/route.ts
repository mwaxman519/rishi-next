import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import { EventBusService } from &quot;../../../services/event-bus-service&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import { db } from &quot;../../../lib/db-connection&quot;;
import { tasks } from &quot;@shared/schema&quot;;

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const body = await request.json();
    const { assigneeId, title, description, dueDate, priority, type } = body;

    if (!assigneeId || !title) {
      return NextResponse.json(
        { error: &quot;Missing required fields: assigneeId, title&quot; },
        { status: 400 },
      );
    }

    const taskId = crypto.randomUUID();

    const [task] = await db
      .insert(tasks)
      .values({
        assigneeId,
        assignerId: (session.user as any).id,
        title,
        description: description || "&quot;,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || &quot;medium&quot;,
        type: type || &quot;general&quot;,
        status: &quot;pending&quot;,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Publish task creation event
    await fetch(&quot;/api/events/publish&quot;, {
      method: &quot;POST&quot;,
      headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
      body: JSON.stringify({
        eventType: &quot;task.assigned&quot;,
        payload: {
          taskId: task?.id,
          assigneeId,
          assignerId: &quot;mock-user-id&quot;,
          title,
          dueDate,
          priority,
          organizationId: &quot;mock-org-id&quot;,
        },
        timestamp: new Date().toISOString(),
      }),
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error(&quot;Error creating task:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to create task&quot; },
      { status: 500 },
    );
  }
}

// GET /api/tasks - Get tasks with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const tasksList = await db.select().from(tasks);

    return NextResponse.json({
      success: true,
      data: tasksList,
    });
  } catch (error) {
    console.error(&quot;Error fetching tasks:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch tasks" },
      { status: 500 },
    );
  }
}
