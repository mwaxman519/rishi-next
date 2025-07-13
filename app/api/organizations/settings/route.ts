import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { organizationSettings } from "../../../../../shared/schema";
import { hasPermission } from "../auth-helper";
import { z } from "zod";

const settingsSchema = z.object({
  organization_id: z.string().uuid(),
  notification_email: z.string().email().nullable().optional(),
  timezone: z.string().default("UTC"),
  language: z.string().default("en"),
  date_format: z.string().default("YYYY-MM-DD"),
  time_format: z.string().default("HH:mm"),
  billing_contact_name: z.string().nullable().optional(),
  billing_contact_email: z.string().email().nullable().optional(),
  billing_address: z.string().nullable().optional(),
  additional_settings: z.record(z.any()).optional(),
});

// GET /api/organizations/settings?organizationId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get("organizationId") || undefined);

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    // Check if user has permission to view organization settings
    const canViewSettings = await hasPermission("read:organizations", {
      organizationId,
    });
    if (!canViewSettings) {
      return NextResponse.json(
        { error: "Unauthorized to view organization settings" },
        { status: 403 },
      );
    }

    const settings = await db.query.organizationSettings.findFirst({
      where: eq(organizationSettings.organization_id, organizationId),
    });

    return NextResponse.json({ settings: settings || null }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization settings" },
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
      "edit:organization_settings",
      { organizationId: organization_id },
    );
    if (!canUpdateSettings) {
      return NextResponse.json(
        { error: "Unauthorized to update organization settings" },
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
    console.error("Error saving organization settings:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to save organization settings" },
      { status: 500 },
    );
  }
}
