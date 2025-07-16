import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "../../../auth-service/db";
import { eq, and } from "drizzle-orm";
import { organizationSettings } from "../../../../shared/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: organizationId } = await params;

    // Get organization feature settings
    const settings = await db
      .select({
        settingKey: organizationSettings.setting_key,
        settingValue: organizationSettings.setting_value,
      })
      .from(organizationSettings)
      .where(
        and(
          eq(organizationSettings.organization_id, organizationId),
          eq(organizationSettings.category, "rbac_features"),
        ),
      );

    // Convert to object format
    const settingsObject: Record<string, boolean> = {};
    settings.forEach((setting) => {
      if (setting.settingKey && setting.settingValue !== null) {
        settingsObject[setting.settingKey] = setting.settingValue === "true";
      }
    });

    // Set defaults for missing settings
    const defaultSettings = {
      brand_agents_view_org_events: false,
      brand_agents_manage_availability: true,
      field_coordinators_approve_assignments: true,
      client_users_create_events: true,
      enable_event_notifications: true,
    };

    const finalSettings = { ...defaultSettings, ...settingsObject };

    return NextResponse.json(finalSettings);
  } catch (error) {
    console.error("Error fetching organization feature settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature settings" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: organizationId } = await params;
    const settings = await request.json();

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await db
        .insert(organizationSettings)
        .values({
          organization_id: organizationId,
          category: "rbac_features",
          setting_key: key,
          setting_value: String(value),
          updated_by: (session.user as any).id,
        })
        .onConflictDoUpdate({
          target: [
            organizationSettings.organization_id,
            organizationSettings.category,
            organizationSettings.setting_key,
          ],
          set: {
            setting_value: String(value),
            updated_by: (session.user as any).id,
          },
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating organization feature settings:", error);
    return NextResponse.json(
      { error: "Failed to update feature settings" },
      { status: 500 },
    );
  }
}
