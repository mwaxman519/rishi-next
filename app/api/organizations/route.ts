import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac"; 
import { db } from "@/lib/db";
import { organizations } from "@shared/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkPermission(request, "read:organizations"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orgData = await db.select().from(organizations);
    return NextResponse.json(orgData);
  } catch (error) {
    console.error("Organizations GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkPermission(request, "create:organizations"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const [newOrg] = await db.insert(organizations).values({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return NextResponse.json(newOrg, { status: 201 });
  } catch (error) {
    console.error("Organizations POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
