import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "../../../../services/notifications/notificationService";
import { getServerSession } from "next-auth";
// Use mock auth for development
const authOptions = {};

/**
 * POST /api/notifications/[id]/read
 * Marks a notification as read
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const notificationId = params.id;

    // Get the authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Mark notification as read
    const notificationService = NotificationService.getInstance();
    await notificationService.markAsRead(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}
