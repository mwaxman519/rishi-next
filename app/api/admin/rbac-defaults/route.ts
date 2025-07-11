import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "../../auth-service/db";
import { eq } from "drizzle-orm";
import { organizationSettings } from "@shared/schema";

// System-wide RBAC defaults that apply to all organizations
const SYSTEM_RBAC_DEFAULTS = {
  brand_agents_view_org_events: false,
  brand_agents_manage_availability: true,
  field_coordinators_approve_assignments: true,
  client_users_create_events: true,
  enable_event_notifications: true,
  auto_assign_brand_agents: false,
  require_approval_for_schedule_changes: false,
  enable_overtime_notifications: true,
};

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current system defaults from database
    const systemSettings = await db
      .select({
        settingKey: organizationSettings.key,
        settingValue: organizationSettings.value,
      })
      .from(organizationSettings)
      .where(
        eq(organizationSettings.organizationId, -1), // Use -1 for system defaults
      );

    // Convert to object format
    const currentDefaults: Record<string, boolean> = {};
    systemSettings.forEach((setting) => {
      currentDefaults[setting.settingKey] = setting.settingValue === "true";
    });

    // Merge with hardcoded defaults for any missing settings
    const finalDefaults = { ...SYSTEM_RBAC_DEFAULTS, ...currentDefaults };

    return NextResponse.json({
      defaults: finalDefaults,
      description:
        "System-wide RBAC defaults that apply to all new organizations",
    });
  } catch (error) {
    console.error("Error fetching system RBAC defaults:", error);
    return NextResponse.json(
      { error: "Failed to fetch system defaults" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { defaults } = await request.json();

    // Update each system default setting
    for (const [key, value] of Object.entries(defaults)) {
      await db
        .insert(organizationSettings)
        .values({
          organizationId: "SYSTEM_DEFAULT",
          category: "rbac_features",
          settingKey: key,
          settingValue: String(value),
          updatedBy: session.user.id,
          updated_at: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            organizationSettings.organizationId,
            organizationSettings.category,
            organizationSettings.settingKey,
          ],
          set: {
            settingValue: String(value),
            updatedBy: session.user.id,
            updated_at: new Date(),
          },
        });
    }

    return NextResponse.json({
      success: true,
      message: "System RBAC defaults updated successfully",
    });
  } catch (error) {
    console.error("Error updating system RBAC defaults:", error);
    return NextResponse.json(
      { error: "Failed to update system defaults" },
      { status: 500 },
    );
  }
}
