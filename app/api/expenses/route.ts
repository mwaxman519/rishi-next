/**
 * Expense Management API Routes - Event-Driven Microservice
 * Handles expense submission, approval workflows, and comprehensive expense tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { ExpenseService } from "../../services/expenses/ExpenseService";
import {
  ExpenseSubmissionSchema,
  ExpenseUpdateSchema,
  ExpenseFiltersSchema,
} from "../../services/expenses/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const expenseService = new ExpenseService();

// GET /api/expenses - Fetch expenses with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const filters = {
      organizationId: (session.user as any).organizationId || "",
      ...(searchParams.get("agentId") && { agentId: searchParams.get("agentId") }),
      ...(searchParams.get("bookingId") && { bookingId: searchParams.get("bookingId") }),
      ...(searchParams.get("shiftId") && { shiftId: searchParams.get("shiftId") }),
      ...(searchParams.get("status") && { status: searchParams.get("status") }),
      ...(searchParams.get("expenseType") && { expenseType: searchParams.get("expenseType") }),
      ...(searchParams.get("startDate") && { startDate: searchParams.get("startDate") }),
      ...(searchParams.get("endDate") && { endDate: searchParams.get("endDate") }),
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "50"),
    };

    // Validate filters
    const validatedFilters = ExpenseFiltersSchema.parse(filters);

    // Get expenses using the service
    const result = await expenseService.getExpenses(
      validatedFilters,
      (session.user as any).id,
      (session.user as any).role || "brand_agent",
      (session.user as any).organizationId || "",
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/expenses - Submit new expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isDraft, ...expenseData } = body;

    // Validate expense data
    const validatedData = ExpenseSubmissionSchema.parse(expenseData);

    let result;
    if (isDraft) {
      // Save as draft
      result = await expenseService.saveDraft(
        validatedData,
        (session.user as any).id,
        (session.user as any).organizationId || "",
      );
    } else {
      // Submit expense
      result = await expenseService.submitExpense(
        validatedData,
        (session.user as any).id,
        (session.user as any).organizationId || "",
      );
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/expenses - Update expense
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 },
      );
    }

    // Validate update data
    const validatedUpdates = ExpenseUpdateSchema.parse(updates);

    const result = await expenseService.updateExpense(
      id,
      validatedUpdates,
      (session.user as any).id,
      (session.user as any).role || "brand_agent",
      (session.user as any).organizationId || "",
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.code === "ACCESS_DENIED" ? 403 : 400 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/expenses - Delete expense
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get("id");

    if (!expenseId) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 },
      );
    }

    const result = await expenseService.deleteExpense(
      expenseId,
      (session.user as any).id,
      (session.user as any).role || "brand_agent",
      (session.user as any).organizationId || "",
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.code === "ACCESS_DENIED" ? 403 : 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
