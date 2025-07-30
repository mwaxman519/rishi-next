import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { db } from &quot;../../../auth-service/db&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;
import { organizationSettings } from &quot;@shared/schema&quot;;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
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
          eq(organizationSettings.category, &quot;rbac_features&quot;),
        ),
      );

    // Convert to object format
    const settingsObject: Record<string, boolean> = {};
    settings.forEach((setting) => {
      if (setting.settingKey && setting.settingValue !== null) {
        settingsObject[setting.settingKey] = setting.settingValue === &quot;true&quot;;
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
    console.error(&quot;Error fetching organization feature settings:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch feature settings&quot; },
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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id: organizationId } = await params;
    const settings = await request.json();

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await db
        .insert(organizationSettings)
        .values({
          organization_id: organizationId,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(&quot;Error updating organization feature settings:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to update feature settings&quot; },
      { status: 500 },
    );
  }
}
