import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "../../../auth-service/db";
import { eq, and } from "drizzle-orm";
import { organizationSettings } from "@shared/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = params.id;

    // Get organization feature settings
    const settings = await db
      .select({
        settingKey: organizationSettings.settingKey,
        settingValue: organizationSettings.settingValue,
      })
      .from(organizationSettings)
      .where(
        and(
          eq(organizationSettings.organizationId, organizationId),
          eq(organizationSettings.category, "rbac_features"),
        ),
      );

    // Convert to object format
    const settingsObject: Record<string, boolean> = {};
    settings.forEach((setting) => {
      settingsObject[setting.settingKey] = setting.settingValue === "true";
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
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = params.id;
    const settings = await request.json();

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await db
        .insert(organizationSettings)
        .values({
          organizationId,
          category: "rbac_features",
          settingKey: key,
          settingValue: String(value),
          updatedBy: session.user.id,
          updatedAt: new Date(),
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
            updatedAt: new Date(),
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
