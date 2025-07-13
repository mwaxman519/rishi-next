import { NextRequest, NextResponse } from "next/server";
import { db } from "@db";
import { brands } from "../../../../shared/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "../../../../lib/auth";
import { checkPermission } from "../../../../lib/rbac";

// Get all brands for the current user's organization
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to view brands
    if (!(await checkPermission(req, "read:organizations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const organizationId = (user as any).organizationId;

    // Get all active brands belonging to the user's organization
    const brandsList = await db
      .select()
      .from(brands)
      .where(and(eq(brands.organizationId, organizationId), eq(brands.isActive, true)))
      .orderBy(brands.name);

    return NextResponse.json({ brands: brandsList });
  } catch (error) {
    console.error(`Error fetching brands:`, error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 },
    );
  }
}
