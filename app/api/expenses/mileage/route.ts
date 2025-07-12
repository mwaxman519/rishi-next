/**
 * Mileage Calculation API Routes - Phase 4 Implementation
 * Handles mileage expense calculation for workforce operations
 */

import { NextRequest, NextResponse } from "next/server";
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
    console.log("DEVELOPMENT MODE: Using mock user for testing");
    const user = {
      id: "mock-user-id",
      role: "brand_agent",
      organizationId: "00000000-0000-0000-0000-000000000001",
    };

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
