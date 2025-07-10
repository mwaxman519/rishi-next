import { NextRequest, NextResponse } from "next/server";
import { USER_ROLES } from "@shared/schema";
import { UserRole } from "../../../lib/rbac";

export async function POST(request: NextRequest) {
  try {
    // Check if the request is from an authenticated super admin
    const authHeader = request.headers.get("x-user-role");

    if (authHeader !== USER_ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        {
          error: "Unauthorized access. Only super admins can create bulk users",
        },
        { status: 403 },
      );
    }

    // Create a user for each role
    const roles = [
      "super_admin",
      "internal_admin",
      "internal_field_manager",
      "field_coordinator",
      "brand_agent",
      "internal_account_manager",
      "client_manager",
      "client_user",
    ];

    const createdUsers = [];

    for (const role of roles) {
      const userData = {
        username: `${role}`,
        password: "password123",
        fullName: `${role
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}`,
        email: `${role}@example.com`,
        phone: "555-123-4567",
        role: role as UserRole,
        profileImage: "",
        active: true,
      };

      // We would normally call our user service here to create the user
      // For now, we'll just add it to our response for demonstration
      createdUsers.push({
        id: `dummy-id-${role}`,
        ...userData,
      });
    }

    return NextResponse.json({
      message: "Test users created successfully",
      users: createdUsers,
    });
  } catch (error) {
    console.error("Error creating test users:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}
