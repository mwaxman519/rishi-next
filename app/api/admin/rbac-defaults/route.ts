import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "../../auth-service/db";
import { eq, isNull } from "drizzle-orm";
import { organizationSettings } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current system defaults from database
    const systemSettings = await db
      .select({
        settingKey: organizationSettings.setting_key,
        settingValue: organizationSettings.setting_value,
      })
      .from(organizationSettings)
      .where(
        isNull(organizationSettings.organization_id), // Use null for system defaults
      );

    // Convert to object format
    const currentDefaults: Record<string, boolean> = {};
    systemSettings.forEach((setting) => {
      if (setting.settingKey && setting.settingValue !== null) {
        currentDefaults[setting.settingKey] = setting.settingValue === "true";
      }
    });

    return NextResponse.json({
      defaults: currentDefaults,
      description: "System-wide RBAC defaults from database",
    });

    // Database query code commented out for VoltBuilder static generation
    /*
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current system defaults from database
    const systemSettings = await db
      .select({
        settingKey: organizationSettings.setting_key,
        settingValue: organizationSettings.setting_value,
      })
      .from(organizationSettings)
      .where(
        isNull(organizationSettings.organization_id), // Use null for system defaults
      );

    // Convert to object format
    const currentDefaults: Record<string, boolean> = {};
    systemSettings.forEach((setting) => {
      if (setting.settingKey && setting.settingValue !== null) {
        currentDefaults[setting.settingKey] = setting.settingValue === "true";
      }
    });

    // Merge with hardcoded defaults for any missing settings
    const finalDefaults = { ...SYSTEM_RBAC_DEFAULTS, ...currentDefaults };

    return NextResponse.json({
      defaults: finalDefaults,
      description:
        "System-wide RBAC defaults that apply to all new organizations",
    });
    */
  } catch (error) {
    console.error("Error fetching system RBAC defaults:", error);
    return NextResponse.json({
      defaults: SYSTEM_RBAC_DEFAULTS,
      description: "System-wide RBAC defaults (fallback)",
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // BUILD-TIME SAFETY: Prevent database writes during static generation
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({
        success: false,
        message: "Build-time: Database operations not available during static generation",
      }, { status: 503 });
    }

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { defaults } = await request.json();

    // Update each system default setting
    for (const [key, value] of Object.entries(defaults)) {
      await db
        .insert(organizationSettings)
        .values({
          organization_id: null,
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
