/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Expense Approval API Routes - Event-Driven Microservice
 * Handles expense approval and rejection workflows
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { ExpenseService } from &quot;../../../services/expenses/ExpenseService&quot;;
import { ExpenseApprovalSchema } from &quot;../../../services/expenses/models&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;

const expenseService = new ExpenseService();

// POST /api/expenses/approval - Approve or reject expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const body = await request.json();

    // Validate approval data
    const validatedApproval = ExpenseApprovalSchema.parse(body);

    const result = await expenseService.processApproval(
      validatedApproval,
      (session.user as any).id,
      (session.user as any).role || &quot;brand_agent&quot;,
      (session.user as any).organizationId || "&quot;,
    );

    if (!result.success) {
      const statusCode =
        result.code === &quot;APPROVAL_PERMISSION_DENIED&quot; ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status: statusCode });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(&quot;Error processing expense approval:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error" },
      { status: 500 },
    );
  }
}
