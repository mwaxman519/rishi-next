import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { bookings } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkPermission(request, "read:bookings"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookingsData = await db.select().from(bookings);
    return NextResponse.json(bookingsData);
  } catch (error) {
    console.error("Bookings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkPermission(request, "create:bookings"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const [newBooking] = await db.insert(bookings).values({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Bookings POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
