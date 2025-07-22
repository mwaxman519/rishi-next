import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { permissions } from "@shared/schema";

/**
 * Fetch all available permissions
 *
 * This endpoint retrieves all permissions defined in the system,
 * allowing the admin panel to display them for organization-specific overrides.
 *
 * @param req - The NextRequest object
 * @returns NextResponse with permissions or error
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch permissions from database
    const allPermissions = await db.select().from(permissions);
    
    return NextResponse.json(allPermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 },
    );
  }
}
