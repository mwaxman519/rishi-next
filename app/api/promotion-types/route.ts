import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getCurrentUser } from &quot;@/lib/auth-server&quot;;

// Define system promotion types
const SYSTEM_PROMOTION_TYPES = [
  {
    id: &quot;product_launch&quot;,
    name: &quot;Product Launch&quot;,
    description: &quot;Introducing new products to the market&quot;,
  },
  {
    id: &quot;seasonal&quot;,
    name: &quot;Seasonal Promotion&quot;,
    description: &quot;Promotions for seasonal events and holidays&quot;,
  },
  {
    id: &quot;brand_awareness&quot;,
    name: &quot;Brand Awareness&quot;,
    description: &quot;Activities focused on increasing brand recognition&quot;,
  },
  {
    id: &quot;sampling&quot;,
    name: &quot;Product Sampling&quot;,
    description: &quot;Distributing product samples to potential customers&quot;,
  },
  {
    id: &quot;special_event&quot;,
    name: &quot;Special Event&quot;,
    description: &quot;One-time or unique promotional events&quot;,
  },
];

// GET /api/promotion-types
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // In a real implementation, we'd fetch both system types and organization-specific types
    // For now, we&apos;re using just the system types

    // Future implementation would look like:
    // const orgTypes = await db.select().from(promotionTypes)
    //  .where(eq(promotionTypes.organizationId, (user as any).organizationId))
    //  .orderBy(promotionTypes.name);

    // const allTypes = [...SYSTEM_PROMOTION_TYPES, ...orgTypes];

    return NextResponse.json({
      data: SYSTEM_PROMOTION_TYPES,
      status: 200,
    });
  } catch (error) {
    console.error(&quot;Error fetching promotion types:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch promotion types&quot; },
      { status: 500 },
    );
  }
}
