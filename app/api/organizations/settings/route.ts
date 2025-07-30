import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;@/lib/db&quot;;
import { randomUUID } from &quot;crypto&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { organizationSettings } from &quot;@shared/schema&quot;;
import { hasPermission } from &quot;../auth-helper&quot;;
import { z } from &quot;zod&quot;;

const settingsSchema = z.object({
  organization_id: z.string().uuid(),
  notification_email: z.string().email().nullable().optional(),
  timezone: z.string().default(&quot;UTC&quot;),
  language: z.string().default(&quot;en&quot;),
  date_format: z.string().default(&quot;YYYY-MM-DD&quot;),
  time_format: z.string().default(&quot;HH:mm&quot;),
  billing_contact_name: z.string().nullable().optional(),
  billing_contact_email: z.string().email().nullable().optional(),
  billing_address: z.string().nullable().optional(),
  additional_settings: z.record(z.any()).optional(),
});

// GET /api/organizations/settings?organizationId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get(&quot;organizationId&quot;) || undefined);

    if (!organizationId) {
      return NextResponse.json(
        { error: &quot;Organization ID is required&quot; },
        { status: 400 },
      );
    }

    // Check if user has permission to view organization settings
    const canViewSettings = await hasPermission(&quot;read:organizations&quot;, {
      organizationId,
    });
    if (!canViewSettings) {
      return NextResponse.json(
        { error: &quot;Unauthorized to view organization settings&quot; },
        { status: 403 },
      );
    }

    const settings = await db.query.organizationSettings.findFirst({
      where: eq(organizationSettings.organization_id, organizationId),
    });

    return NextResponse.json({ settings: settings || null }, { status: 200 });
  } catch (error) {
    console.error(&quot;Error fetching organization settings:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch organization settings&quot; },
      { status: 500 },
    );
  }
}

// POST /api/organizations/settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = settingsSchema.parse(body);
    const { organization_id } = validatedData;

    // Check if user has permission to update organization settings
    const canUpdateSettings = await hasPermission(
      &quot;edit:organization_settings&quot;,
      { organizationId: organization_id },
    );
    if (!canUpdateSettings) {
      return NextResponse.json(
        { error: &quot;Unauthorized to update organization settings&quot; },
        { status: 403 },
      );
    }

    // Check if settings already exist
    const existingSettings = await db.query.organizationSettings.findFirst({
      where: eq(organizationSettings.organization_id, organization_id),
    });

    let result;
    if (existingSettings) {
      // Update existing settings
      result = await db
        .update(organizationSettings)
        .set({
          ...validatedData,
          updated_at: new Date(),
        })
        .where(eq(organizationSettings.organization_id, organization_id))
        .returning();
    } else {
      // Create new settings
      result = await db
        .insert(organizationSettings)
        .values({
          id: randomUUID(),
          ...validatedData,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();
    }

    const savedSettings = result[0];
    if (!savedSettings) {
      throw new Error('Failed to save organization settings - no result returned');
    }
    return NextResponse.json(
      { settings: savedSettings },
      { status: existingSettings ? 200 : 201 },
    );
  } catch (error) {
    console.error(&quot;Error saving organization settings:&quot;, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: &quot;Validation failed&quot;, details: error.format() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: &quot;Failed to save organization settings&quot; },
      { status: 500 },
    );
  }
}
