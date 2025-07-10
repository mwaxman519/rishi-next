import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth-options";
import { EventBusService } from "../../../services/event-bus-service";

export async function GET(request: NextRequest) {
  try {
    // Simple notification endpoint using Next.js API routes
    return NextResponse.json({
      notifications: [],
      connected: true,
      status: "ok",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle notification subscription via API route
    return NextResponse.json({
      success: true,
      subscribed: body.events || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to subscribe to notifications" },
      { status: 500 },
    );
  }
}
