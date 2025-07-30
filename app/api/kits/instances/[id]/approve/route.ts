import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


/**
 * API Route for approving a kit instance
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { kitsService } from &quot;../../../../../services/kits&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-server&quot;;

/**
 * POST /api/kits/instances/[id]/approve
 * Approve a kit instance
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: &quot;Invalid ID format&quot; }, { status: 400 });
    }

    // Parse request body
    const { notes } = await req.json();

    // Approve kit
    const kit = await kitsService.approveKit({ id, notes }, (session.user as any).id);

    return NextResponse.json(kit);
  } catch (error) {
    console.error(`Error approving kit with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : &quot;An unknown error occurred&quot;,
      },
      { status: 400 },
    );
  }
}
