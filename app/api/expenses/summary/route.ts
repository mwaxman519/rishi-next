/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Expense Summary API Routes - Event-Driven Microservice
 * Provides expense analytics and summary data
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { ExpenseService } from &quot;../../../services/expenses/ExpenseService&quot;;
import { ExpenseFiltersSchema } from &quot;../../../services/expenses/models&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;

const expenseService = new ExpenseService();

// GET /api/expenses/summary - Get expense summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Extract filter parameters for summary
    const filters = {
      organizationId: (session.user as any).organizationId || "&quot;,
      ...((searchParams.get(&quot;agentId&quot;) || undefined) && { agentId: (searchParams.get(&quot;agentId&quot;) || undefined) || undefined }),
      ...((searchParams.get(&quot;startDate&quot;) || undefined) && { startDate: (searchParams.get(&quot;startDate&quot;) || undefined) || undefined }),
      ...((searchParams.get(&quot;endDate&quot;) || undefined) && { endDate: (searchParams.get(&quot;endDate&quot;) || undefined) || undefined }),
    };

    const result = await expenseService.getExpenseSummary(
      filters,
      (session.user as any).id || &quot;&quot;,
      (session.user as any).role || &quot;brand_agent&quot;,
      (session.user as any).organizationId || &quot;&quot;,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(&quot;Error fetching expense summary:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error" },
      { status: 500 },
    );
  }
}
