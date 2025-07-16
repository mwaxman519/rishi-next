/**
 * Expense Summary API Routes - Event-Driven Microservice
 * Provides expense analytics and summary data
 */

import { NextRequest, NextResponse } from "next/server";
import { ExpenseService } from "../../../services/expenses/ExpenseService";
import { ExpenseFiltersSchema } from "../../../services/expenses/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const expenseService = new ExpenseService();

// GET /api/expenses/summary - Get expense summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Extract filter parameters for summary
    const filters = {
      organizationId: (session.user as any).organizationId || "",
      ...((searchParams.get("agentId") || undefined) && { agentId: (searchParams.get("agentId") || undefined) || undefined }),
      ...((searchParams.get("startDate") || undefined) && { startDate: (searchParams.get("startDate") || undefined) || undefined }),
      ...((searchParams.get("endDate") || undefined) && { endDate: (searchParams.get("endDate") || undefined) || undefined }),
    };

    const result = await expenseService.getExpenseSummary(
      filters,
      (session.user as any).id || "",
      (session.user as any).role || "brand_agent",
      (session.user as any).organizationId || "",
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
