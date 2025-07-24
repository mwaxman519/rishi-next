import { NextResponse } from "next/server";
import { getOrganizationContext } from "@/lib/organization-context";

/**
 * Get the current organization context
 *
 * This endpoint returns the organization context information
 * extracted from the request headers, which is useful for
 * testing and debugging the organization context system.
 *
 * @returns NextResponse with organization context information
 */
export async function GET() {
  try {
    // Get the organization context
    const context = getOrganizationContext();

    // If no context is available, return an error
    if (!context) {
      return NextResponse.json(
        {
          error: "No organization context available",
          note: "You might need to switch to an organization first",
        },
        { status: 400 },
      );
    }

    // Return the organization context information
    return NextResponse.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error("Error getting organization context:", error);
    return NextResponse.json(
      { error: "Failed to get organization context" },
      { status: 500 },
    );
  }
}
