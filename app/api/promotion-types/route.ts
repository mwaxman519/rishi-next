import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth-server";

// Define system promotion types
const SYSTEM_PROMOTION_TYPES = [
  {
    id: "product_launch",
    name: "Product Launch",
    description: "Introducing new products to the market",
  },
  {
    id: "seasonal",
    name: "Seasonal Promotion",
    description: "Promotions for seasonal events and holidays",
  },
  {
    id: "brand_awareness",
    name: "Brand Awareness",
    description: "Activities focused on increasing brand recognition",
  },
  {
    id: "sampling",
    name: "Product Sampling",
    description: "Distributing product samples to potential customers",
  },
  {
    id: "special_event",
    name: "Special Event",
    description: "One-time or unique promotional events",
  },
];

// GET /api/promotion-types
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real implementation, we'd fetch both system types and organization-specific types
    // For now, we're using just the system types

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
    console.error("Error fetching promotion types:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotion types" },
      { status: 500 },
    );
  }
}
