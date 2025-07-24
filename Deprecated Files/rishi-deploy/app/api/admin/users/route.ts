import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getAuthUser } from "../../../lib/auth-server";
import { users } from "@shared/schema";
import {
  hasEnhancedPermission,
  createPermissionContext,
} from "../../../lib/rbac-enhanced";
import { desc } from "drizzle-orm";

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only users with proper permissions can access all users
    if (!hasEnhancedPermission("view:users", authUser.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get users
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.created_at)],
      columns: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        role: true,
        active: true,
        created_at: true,
        // Don't include password hash
      },
    });

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
