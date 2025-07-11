/**
 * Expense Approval API Routes - Event-Driven Microservice
 * Handles expense approval and rejection workflows
 */

import { NextRequest, NextResponse } from "next/server";
import { ExpenseService } from "../../../services/expenses/ExpenseService";
import { ExpenseApprovalSchema } from "../../../services/expenses/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const expenseService = new ExpenseService();

// POST /api/expenses/approval - Approve or reject expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate approval data
    const validatedApproval = ExpenseApprovalSchema.parse(body);

    const result = await expenseService.processApproval(
      validatedApproval,
      session.user.id,
      session.user.role || "brand_agent",
      (session.user as any).organizationId || "",
    );

    if (!result.success) {
      const statusCode =
        result.code === "APPROVAL_PERMISSION_DENIED" ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status: statusCode });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error processing expense approval:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
