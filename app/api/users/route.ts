import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkPermission(request, "read:users"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userData = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkPermission(request, "create:users"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const [newUser] = await db.insert(users).values({
      ...body,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
