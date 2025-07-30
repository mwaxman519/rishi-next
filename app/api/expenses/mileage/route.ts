/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Mileage Calculation API Routes - Phase 4 Implementation
 * Handles mileage expense calculation for workforce operations
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import { simpleExpenseService } from &quot;../../../services/expenses/SimpleExpenseService&quot;;
import { z } from &quot;zod&quot;;

const mileageCalculationSchema = z.object({
  startLocation: z.string().min(1, &quot;Start location is required&quot;),
  endLocation: z.string().min(1, &quot;End location is required&quot;),
  rate: z.number().positive().optional(),
});

// POST /api/expenses/mileage - Calculate mileage expense
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }
    const user = session.user as any;

    const body = await request.json();
    const validatedData = mileageCalculationSchema.parse(body);

    // All authenticated users can calculate mileage
    const mileageCalculation = await simpleExpenseService.calculateMileage(
      validatedData.startLocation,
      validatedData.endLocation,
      validatedData.rate || 0.67, // Default IRS mileage rate
    );

    if (!mileageCalculation.success) {
      return NextResponse.json(
        { error: mileageCalculation.error || &quot;Failed to calculate mileage&quot; },
        { status: 500 },
      );
    }

    return NextResponse.json(mileageCalculation.data);
  } catch (error) {
    console.error(&quot;Error calculating mileage:&quot;, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: &quot;Invalid mileage data&quot;, details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: &quot;Failed to calculate mileage&quot; },
      { status: 500 },
    );
  }
}
