import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "../../../lib/db";
// Note: Schema imports will be added when proper schema structure is implemented
import { eq, and } from "drizzle-orm";

// Secret key for JWT verification - should be in env variables for production
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-secret-key-change-in-production",
);

export async function GET(request: NextRequest) {
  try {
    // Only use mock data in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("DEVELOPMENT MODE: Using mock permissions for testing");

      // Get the requested organization ID
      const url = new URL(request.url);
      const organizationId = url.searchParams.get("organizationId");

      // For development/testing purposes, return mock permissions
      // This ensures consistent behavior regardless of database status
      // Different roles have different permissions for testing purposes
      const mockPermissionsByRole = {
        super_admin: [
          "view:all",
          "create:all",
          "edit:all",
          "delete:all",
          "view:users",
          "create:users",
          "edit:users",
          "delete:users",
          "view:organizations",
          "create:organizations",
          "edit:organizations",
          "delete:organizations",
          "view:events",
          "create:events",
          "edit:events",
          "delete:events",
          "view:locations",
          "create:locations",
          "edit:locations",
          "delete:locations",
          "view:reports",
          "create:reports",
          "admin:access",
        ],
        admin: [
          "view:users",
          "create:users",
          "edit:users",
          "view:organizations",
          "edit:organizations",
          "view:events",
          "create:events",
          "edit:events",
          "view:locations",
          "create:locations",
          "edit:locations",
          "view:reports",
          "create:reports",
        ],
        field_manager: [
          "view:events",
          "create:events",
          "edit:events",
          "view:locations",
          "edit:locations",
          "view:reports",
        ],
        brand_agent: [
          "view:events",
          "edit:events",
          "view:locations",
          "view:reports",
        ],
        client_user: ["view:events", "view:locations", "view:reports"],
      };

      // If we have an auth token, try to extract role from it
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;

      let userRole = "brand_agent"; // Default role

      if (token) {
        try {
          // Verify JWT token
          const { payload } = await jwtVerify(token, JWT_SECRET);

          // On development, we don't need to hit the database
          // Instead we'll determine the role based on the user ID pattern
          // This allows us to test different permission levels
          const userId = payload.sub as string;

          // For demo/testing: determine role based on ID pattern or hardcoded values
          if (userId.includes("001") || userId.includes("admin")) {
            userRole = "super_admin";
          } else if (userId.includes("002")) {
            userRole = "admin";
          } else if (userId.includes("003") || userId.includes("mike")) {
            userRole = "field_manager";
          } else if (userId.includes("004")) {
            userRole = "client_user";
          } else {
            userRole = "brand_agent";
          }
        } catch (verifyError) {
          console.log(
            "Development mode: JWT verification failed, using default permissions",
          );
        }
      }

      return NextResponse.json({
        role: userRole,
        permissions:
          mockPermissionsByRole[
            userRole as keyof typeof mockPermissionsByRole
          ] || mockPermissionsByRole.brand_agent,
      });
    }

    // For production environments, continue with real database checks
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
      // Verify JWT token
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Get user from database using sub claim (user id)
      const userId = payload.sub as string;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get the user's role
      const [userRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.name, user.role))
        .limit(1);

      if (!userRole) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      // Get the permissions for the user's role
      const rolePerms = await db
        .select({
          permission: permissions.name,
        })
        .from(rolePermissions)
        .innerJoin(
          permissions,
          eq(rolePermissions.permissionId, permissions.id),
        )
        .where(eq(rolePermissions.roleId, userRole.id));

      // Extract permission names
      const permissionList = rolePerms.map((rp) => rp.permission);

      return NextResponse.json({
        role: user.role,
        permissions: permissionList,
      });
    } catch (verifyError) {
      console.error("JWT verification error:", verifyError);

      // Clear the invalid token (await is required in Next.js 15.2.2)
      await cookieStore.delete("auth-token");

      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
