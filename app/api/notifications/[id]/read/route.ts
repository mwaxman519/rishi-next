import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { NotificationService } from &quot;../../../../services/notifications/notificationService&quot;;
import { getServerSession } from &quot;next-auth&quot;;
// Use proper authentication for all environments
import { authOptions } from &quot;@/lib/auth-options&quot;;

/**
 * POST /api/notifications/[id]/read
 * Marks a notification as read
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const notificationId = params.id;

    // Get the authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: &quot;Authentication required&quot; },
        { status: 401 },
      );
    }

    // Mark notification as read
    const notificationService = NotificationService.getInstance();
    await notificationService.markAsRead(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(&quot;Error marking notification as read:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to mark notification as read&quot; },
      { status: 500 },
    );
  }
}
