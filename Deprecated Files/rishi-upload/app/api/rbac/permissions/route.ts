import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { permissions } from "../../../lib/schema";

/**
 * Fetch all available permissions
 *
 * This endpoint retrieves all permissions defined in the system,
 * allowing the admin panel to display them for organization-specific overrides.
 *
 * @param req - The NextRequest object
 * @returns NextResponse with permissions or error
 */
export async function GET(req: NextRequest) {
  try {
    // In development mode, return mock permissions
    console.log("DEVELOPMENT MODE: Using mock permissions for system view");

    // Mock permissions based on different functional areas
    const mockPermissions = [
      { name: "view:dashboard", description: "View the main dashboard" },
      {
        name: "view:analytics",
        description: "View analytics and reporting data",
      },
      { name: "export:analytics", description: "Export analytics reports" },

      { name: "view:schedule", description: "View the event schedule" },
      { name: "edit:schedule", description: "Edit and modify event schedule" },
      { name: "approve:schedule", description: "Approve schedule changes" },

      { name: "view:availability", description: "View agent availability" },
      { name: "edit:availability", description: "Edit availability settings" },
      { name: "manage:availability", description: "Manage team availability" },

      { name: "view:events", description: "View event details" },
      { name: "create:events", description: "Create new events" },
      { name: "edit:events", description: "Modify existing events" },
      { name: "delete:events", description: "Delete events" },

      { name: "view:agents", description: "View agent profiles" },
      { name: "edit:agents", description: "Edit agent information" },
      { name: "manage:agents", description: "Manage agent assignments" },

      { name: "view:clients", description: "View client information" },
      { name: "edit:clients", description: "Edit client details" },
      { name: "manage:clients", description: "Manage client relationships" },

      { name: "view:internal", description: "View internal resources" },
      { name: "edit:internal", description: "Edit internal resources" },
      { name: "create:internal", description: "Create internal resources" },
      { name: "delete:internal", description: "Delete internal resources" },

      { name: "create:marketing", description: "Create marketing materials" },
      { name: "manage:brand", description: "Manage brand settings" },
      {
        name: "edit:whitelabel",
        description: "Edit white-label configurations",
      },

      { name: "admin:users", description: "Administer user accounts" },
      { name: "admin:roles", description: "Manage user roles" },
      {
        name: "admin:permissions",
        description: "Configure system permissions",
      },
      { name: "admin:organizations", description: "Manage organizations" },
      { name: "admin:billing", description: "Access billing information" },
    ];

    return NextResponse.json(mockPermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 },
    );
  }
}
