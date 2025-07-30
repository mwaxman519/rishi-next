/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Booking Form Data API
 * Provides data needed to populate the booking form
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import {
  activityTypes,
  locations,
  promotionTypes,
  kitTemplates,
} from &quot;@shared/schema&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;

export async function GET(req: NextRequest) {
  try {
    // Authentication is required in all environments
    // No special exceptions for authentication in any environment
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
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
    console.error(&quot;Error fetching form data:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch form data&quot; },
      { status: 500 },
    );
  }
}
