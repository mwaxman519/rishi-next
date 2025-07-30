/**

export const dynamic = "force-static";
export const revalidate = false;

 * Booking Form Data API
 * Provides data needed to populate the booking form
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  activityTypes,
  locations,
  promotionTypes,
  kitTemplates,
} from "@shared/schema";
import { getServerSession } from "next-auth";
import { eq, and } from "drizzle-orm";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
  try {
    // Authentication is required in all environments
    // No special exceptions for authentication in any environment
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch real data from the database
    const [activityTypesData, locationsData, promotionTypesData, kitTemplatesData] = await Promise.all([
      db.select().from(activityTypes),
      db.select().from(locations),
      db.select().from(promotionTypes),
      db.select().from(kitTemplates),
    ]);

    return NextResponse.json({
      activityTypes: activityTypesData,
      locations: locationsData,
      promotionTypes: promotionTypesData,
      kitTemplates: kitTemplatesData,
    });
  } catch (error) {
    console.error("Error fetching form data:", error);
    return NextResponse.json(
      { error: "Failed to fetch form data" },
      { status: 500 },
    );
  }
}
