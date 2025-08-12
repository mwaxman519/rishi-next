/**

export const dynamic = "force-static";
export const revalidate = false;

 * Mileage Calculation API Routes - Phase 4 Implementation
 * Handles mileage expense calculation for workforce operations
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { simpleExpenseService } from "../../../services/expenses/SimpleExpenseService";
import { z } from "zod";

const mileageCalculationSchema = z.object({
  startLocation: z.string().min(1, "Start location is required"),
  endLocation: z.string().min(1, "End location is required"),
  rate: z.number().positive().optional(),
});

// POST /api/expenses/mileage - Calculate mileage expense
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        { error: mileageCalculation.error || "Failed to calculate mileage" },
        { status: 500 },
      );
    }

    return NextResponse.json(mileageCalculation.data);
  } catch (error) {
    console.error("Error calculating mileage:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid mileage data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to calculate mileage" },
      { status: 500 },
    );
  }
}
