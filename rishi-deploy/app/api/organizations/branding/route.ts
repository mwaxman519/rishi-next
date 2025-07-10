import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { organizationBranding, organizations } from "@shared/schema";
import { hasPermission } from "../auth-helper";
import { z } from "zod";

const brandingSchema = z.object({
  organization_id: z.string().uuid(),
  logo_url: z.string().nullable().optional(),
  primary_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Must be a valid hex color code",
    }),
  secondary_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Must be a valid hex color code",
    }),
  accent_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Must be a valid hex color code",
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
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    // Check if user has permission to view organization branding
    const canViewBranding = await hasPermission("view:organization_branding", {
      organizationId,
    });
    if (!canViewBranding) {
      return NextResponse.json(
        { error: "Unauthorized to view organization branding" },
        { status: 403 },
      );
    }

    // Get the organization to check its tier
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Check if organization can customize branding based on tier
    // Tier 3 organizations and special permissions can customize
    const canCustomize =
      organization.tier === "tier_3" ||
      (await hasPermission("manage:organization_branding"));

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
    console.error("Error fetching organization branding:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization branding" },
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
      "edit:organization_branding",
      { organizationId: organization_id },
    );
    if (!canUpdateBranding) {
      return NextResponse.json(
        { error: "Unauthorized to update organization branding" },
        { status: 403 },
      );
    }

    // Get the organization to check its tier
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organization_id),
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Check if organization can customize branding based on tier
    // Tier 3 organizations and special permissions can customize
    const canCustomize =
      organization.tier === "tier_3" ||
      (await hasPermission("manage:organization_branding"));

    if (!canCustomize) {
      return NextResponse.json(
        {
          error:
            "This organization tier does not support branding customization",
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

    return NextResponse.json(
      { branding: result[0] },
      { status: existingBranding ? 200 : 201 },
    );
  } catch (error) {
    console.error("Error saving organization branding:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to save organization branding" },
      { status: 500 },
    );
  }
}
