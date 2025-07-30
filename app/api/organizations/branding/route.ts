import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;@/lib/db&quot;;
import { randomUUID } from &quot;crypto&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { organizationBranding, organizations } from &quot;@shared/schema&quot;;
import { hasPermission } from &quot;../auth-helper&quot;;
import { z } from &quot;zod&quot;;

const brandingSchema = z.object({
  organization_id: z.string().uuid(),
  logo_url: z.string().nullable().optional(),
  primary_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: &quot;Must be a valid hex color code&quot;,
    }),
  secondary_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: &quot;Must be a valid hex color code&quot;,
    }),
  accent_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: &quot;Must be a valid hex color code&quot;,
    }),
  font_family: z.string().optional(),
  custom_css: z.string().nullable().optional(),
  favicon_url: z.string().nullable().optional(),
  email_template: z.record(z.any()).optional(),
});

// GET /api/organizations/branding?organizationId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get(&quot;organizationId&quot;) || undefined) || undefined;

    if (!organizationId) {
      return NextResponse.json(
        { error: &quot;Organization ID is required&quot; },
        { status: 400 },
      );
    }

    // Check if user has permission to view organization branding
    const canViewBranding = await hasPermission(user.id, &quot;read:organizations&quot;);
    if (!canViewBranding) {
      return NextResponse.json(
        { error: &quot;Unauthorized to view organization branding&quot; },
        { status: 403 },
      );
    }

    // Get the organization to check its tier
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    if (!organization) {
      return NextResponse.json(
        { error: &quot;Organization not found&quot; },
        { status: 404 },
      );
    }

    // Check if organization can customize branding based on tier
    // Tier 3 organizations and special permissions can customize
    const canCustomize =
      ((organization.tier || &quot;tier_1&quot;) || &quot;tier_1&quot;) === &quot;tier_3&quot; ||
      (await hasPermission(user.id, &quot;update:organizations&quot;));

    const branding = await db.query.organizationBranding.findFirst({
      where: eq(organizationBranding.organization_id, organizationId),
    });

    return NextResponse.json(
      {
        branding: branding || null,
        can_customize: canCustomize,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(&quot;Error fetching organization branding:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch organization branding&quot; },
      { status: 500 },
    );
  }
}

// POST /api/organizations/branding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = brandingSchema.parse(body);
    const { organization_id } = validatedData;

    // Check if user has permission to update organization branding
    const canUpdateBranding = await hasPermission(
      &quot;edit:organization_branding&quot;,
      [&quot;super_admin&quot;]
    );
    if (!canUpdateBranding) {
      return NextResponse.json(
        { error: &quot;Unauthorized to update organization branding&quot; },
        { status: 403 },
      );
    }

    // Get the organization to check its tier
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organization_id),
    });

    if (!organization) {
      return NextResponse.json(
        { error: &quot;Organization not found&quot; },
        { status: 404 },
      );
    }

    // Check if organization can customize branding based on tier
    // Tier 3 organizations and special permissions can customize
    const canCustomize =
      ((organization.tier || &quot;tier_1&quot;) || &quot;tier_1&quot;) === &quot;tier_3&quot; ||
      (await hasPermission(user.id, &quot;update:organizations&quot;));

    if (!canCustomize) {
      return NextResponse.json(
        {
          error:
            &quot;This organization tier does not support branding customization&quot;,
        },
        { status: 403 },
      );
    }

    // Check if branding already exists
    const existingBranding = await db.query.organizationBranding.findFirst({
      where: eq(organizationBranding.organization_id, organization_id),
    });

    let result;
    if (existingBranding) {
      // Update existing branding
      result = await db
        .update(organizationBranding)
        .set({
          ...validatedData,
          updated_at: new Date(),
        })
        .where(eq(organizationBranding.organization_id, organization_id))
        .returning();
    } else {
      // Create new branding
      result = await db
        .insert(organizationBranding)
        .values({
          id: randomUUID(),
          ...validatedData,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();
    }

    const savedBranding = result[0];
    if (!savedBranding) {
      throw new Error('Failed to save organization branding - no result returned');
    }
    return NextResponse.json(
      { branding: savedBranding },
      { status: existingBranding ? 200 : 201 },
    );
  } catch (error) {
    console.error(&quot;Error saving organization branding:&quot;, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: &quot;Validation failed&quot;, details: error.format() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: &quot;Failed to save organization branding&quot; },
      { status: 500 },
    );
  }
}
