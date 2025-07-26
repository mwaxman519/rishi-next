import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { locations } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkPermission(request, "read:locations"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const locationsData = await db.select().from(locations);
    return NextResponse.json(locationsData);
  } catch (error) {
    console.error("Locations GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkPermission(request, "create:locations"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const [newLocation] = await db.insert(locations).values({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    console.error("Locations POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
