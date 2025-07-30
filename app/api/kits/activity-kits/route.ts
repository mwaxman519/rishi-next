/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Activity Kit Assignment API Routes
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { kitsService } from &quot;../../../services/kits&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-server&quot;;

/**
 * GET /api/kits/activity-kits
 * Get all activity kit assignments with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const filters: Record<string, any> = {};

    // Extract filter parameters
    if (searchParams.has(&quot;activityId&quot;)) {
      filters.activityId = (searchParams.get(&quot;activityId&quot;) || undefined);
    }

    if (searchParams.has(&quot;kitTemplateId&quot;)) {
      filters.kitTemplateId = (searchParams.get(&quot;kitTemplateId&quot;) || undefined);
    }

    if (searchParams.has(&quot;kitInstanceId&quot;)) {
      filters.kitInstanceId = (searchParams.get(&quot;kitInstanceId&quot;) || undefined);
    }

    if (searchParams.has(&quot;status&quot;)) {
      filters.status = (searchParams.get(&quot;status&quot;) || undefined);
    }

    if (searchParams.has(&quot;assignedToId&quot;)) {
      filters.assignedToId = (searchParams.get(&quot;assignedToId&quot;) || undefined);
    }

    // Get all activity kits with filters
    const activityKits = await kitsService.getAllActivityKits(filters);

    return NextResponse.json(activityKits);
  } catch (error) {
    console.error(&quot;Error fetching activity kits:&quot;, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : &quot;An unknown error occurred&quot;,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/kits/activity-kits
 * Create a new activity kit assignment
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Parse request body
    const data = await req.json();

    // Create activity kit assignment
    const activityKit = await kitsService.createActivityKit(data);

    return NextResponse.json(activityKit, { status: 201 });
  } catch (error) {
    console.error(&quot;Error creating activity kit assignment:&quot;, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : &quot;An unknown error occurred&quot;,
      },
      { status: 400 },
    );
  }
}
