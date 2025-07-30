import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


/**
 * Kit Instance API Routes for specific kit
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { kitsService } from &quot;../../../../services/kits&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-server&quot;;

/**
 * GET /api/kits/instances/[id]
 * Get a specific kit by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: &quot;Invalid ID format&quot; }, { status: 400 });
    }

    const kit = await kitsService.getKitById(id);
    if (!kit) {
      return NextResponse.json({ error: &quot;Kit not found&quot; }, { status: 404 });
    }

    return NextResponse.json(kit);
  } catch (error) {
    const resolvedParams = await params;
    console.error(`Error fetching kit with ID ${resolvedParams.id}:`, error);
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
 * PATCH /api/kits/instances/[id]
 * Update a specific kit
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: &quot;Invalid ID format&quot; }, { status: 400 });
    }

    // Parse request body
    const data = await req.json();

    // Update kit
    const kit = await kitsService.updateKit(id, data, (session.user as any).id);

    return NextResponse.json(kit);
  } catch (error) {
    const resolvedParams = await params;
    console.error(`Error updating kit with ID ${resolvedParams.id}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : &quot;An unknown error occurred&quot;,
      },
      { status: 400 },
    );
  }
}
