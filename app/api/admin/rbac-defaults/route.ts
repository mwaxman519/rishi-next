import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getServerSession } from &quot;next-auth&quot;;
import { db } from &quot;../../auth-service/db&quot;;
import { eq, isNull } from &quot;drizzle-orm&quot;;
import { organizationSettings } from &quot;@shared/schema&quot;;

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
    // BUILD-TIME SAFETY: Return hardcoded defaults during static generation
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({
        defaults: SYSTEM_RBAC_DEFAULTS,
        description: &quot;System-wide RBAC defaults that apply to all new organizations&quot;,
      });
    }

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
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
        currentDefaults[setting.settingKey] = setting.settingValue === &quot;true&quot;;
      }
    });

    // Merge with hardcoded defaults for any missing settings
    const finalDefaults = { ...SYSTEM_RBAC_DEFAULTS, ...currentDefaults };

    return NextResponse.json({
      defaults: finalDefaults,
      description:
        &quot;System-wide RBAC defaults that apply to all new organizations&quot;,
    });
  } catch (error) {
    console.error(&quot;Error fetching system RBAC defaults:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch system defaults&quot; },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // BUILD-TIME SAFETY: Prevent database writes during static generation
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({
        success: false,
        message: &quot;Build-time: Database operations not available during static generation&quot;,
      }, { status: 503 });
    }

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { defaults } = await request.json();

    // Update each system default setting
    for (const [key, value] of Object.entries(defaults)) {
      await db
        .insert(organizationSettings)
        .values({
          organization_id: null,
          category: &quot;rbac_features&quot;,
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
      message: &quot;System RBAC defaults updated successfully&quot;,
    });
  } catch (error) {
    console.error(&quot;Error updating system RBAC defaults:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to update system defaults&quot; },
      { status: 500 },
    );
  }
}
