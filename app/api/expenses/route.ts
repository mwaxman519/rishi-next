/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Expense Management API Routes - Event-Driven Microservice
 * Handles expense submission, approval workflows, and comprehensive expense tracking
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { ExpenseService } from &quot;../../services/expenses/ExpenseService&quot;;
import {
  ExpenseSubmissionSchema,
  ExpenseUpdateSchema,
  ExpenseFiltersSchema,
} from &quot;../../services/expenses/models&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;

const expenseService = new ExpenseService();

// GET /api/expenses - Fetch expenses with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const filters = {
      organizationId: (session.user as any).organizationId || "&quot;,
      ...((searchParams.get(&quot;agentId&quot;) || undefined) && { agentId: (searchParams.get(&quot;agentId&quot;) || undefined) }),
      ...((searchParams.get(&quot;bookingId&quot;) || undefined) && { bookingId: (searchParams.get(&quot;bookingId&quot;) || undefined) }),
      ...((searchParams.get(&quot;shiftId&quot;) || undefined) && { shiftId: (searchParams.get(&quot;shiftId&quot;) || undefined) }),
      ...((searchParams.get(&quot;status&quot;) || undefined) && { status: (searchParams.get(&quot;status&quot;) || undefined) }),
      ...((searchParams.get(&quot;expenseType&quot;) || undefined) && { expenseType: (searchParams.get(&quot;expenseType&quot;) || undefined) }),
      ...((searchParams.get(&quot;startDate&quot;) || undefined) && { startDate: (searchParams.get(&quot;startDate&quot;) || undefined) }),
      ...((searchParams.get(&quot;endDate&quot;) || undefined) && { endDate: (searchParams.get(&quot;endDate&quot;) || undefined) }),
      page: parseInt((searchParams.get(&quot;page&quot;) || undefined) || &quot;1&quot;),
      limit: parseInt((searchParams.get(&quot;limit&quot;) || undefined) || &quot;50&quot;),
    };

    // Validate filters
    const validatedFilters = ExpenseFiltersSchema.parse(filters);

    // Get expenses using the service
    const result = await expenseService.getExpenses(
      validatedFilters,
      (session.user as any).id,
      (session.user as any).role || &quot;brand_agent&quot;,
      (session.user as any).organizationId || &quot;&quot;,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(&quot;Error fetching expenses:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 },
    );
  }
}

// POST /api/expenses - Submit new expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
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
        (session.user as any).organizationId || &quot;&quot;,
      );
    } else {
      // Submit expense
      result = await expenseService.submitExpense(
        validatedData,
        (session.user as any).id,
        (session.user as any).organizationId || &quot;&quot;,
      );
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error(&quot;Error creating expense:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 },
    );
  }
}

// PUT /api/expenses - Update expense
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: &quot;Expense ID is required&quot; },
        { status: 400 },
      );
    }

    // Validate update data
    const validatedUpdates = ExpenseUpdateSchema.parse(updates);

    const result = await expenseService.updateExpense(
      id,
      validatedUpdates,
      (session.user as any).id,
      (session.user as any).role || &quot;brand_agent&quot;,
      (session.user as any).organizationId || &quot;&quot;,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.code === &quot;ACCESS_DENIED&quot; ? 403 : 400 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(&quot;Error updating expense:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 },
    );
  }
}

// DELETE /api/expenses - Delete expense
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const expenseId = (searchParams.get(&quot;id&quot;) || undefined);

    if (!expenseId) {
      return NextResponse.json(
        { error: &quot;Expense ID is required&quot; },
        { status: 400 },
      );
    }

    const result = await expenseService.deleteExpense(
      expenseId,
      (session.user as any).id,
      (session.user as any).role || &quot;brand_agent&quot;,
      (session.user as any).organizationId || &quot;&quot;,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.code === &quot;ACCESS_DENIED&quot; ? 403 : 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(&quot;Error deleting expense:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error" },
      { status: 500 },
    );
  }
}
