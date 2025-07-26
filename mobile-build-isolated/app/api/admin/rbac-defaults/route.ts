import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";

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

    // Return default RBAC configuration
    const rbacDefaults = {
      roles: [
        { id: "super_admin", name: "Super Admin", permissions: ["*"] },
        { id: "internal_admin", name: "Internal Admin", permissions: ["read:*", "create:*", "update:*"] },
        { id: "internal_field_manager", name: "Field Manager", permissions: ["read:bookings", "update:bookings"] },
        { id: "brand_agent", name: "Brand Agent", permissions: ["read:bookings"] },
        { id: "client_manager", name: "Client Manager", permissions: ["read:organizations", "update:organizations"] },
        { id: "client_user", name: "Client User", permissions: ["read:bookings"] }
      ],
      permissions: [
        "read:organizations", "create:organizations", "update:organizations", "delete:organizations",
        "read:users", "create:users", "update:users", "delete:users",
        "read:bookings", "create:bookings", "update:bookings", "delete:bookings",
        "read:locations", "create:locations", "update:locations", "delete:locations"
      ]
    };

    return NextResponse.json(rbacDefaults);
  } catch (error) {
    console.error("RBAC Defaults GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
