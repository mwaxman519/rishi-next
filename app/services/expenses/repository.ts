/**
 * Expense Repository
 * Data access layer for expense management microservice
 */

import { db } from &quot;../../db&quot;;
import { systemEvents } from &quot;@shared/schema&quot;;
import { eq, and, gte, lte, desc, sql, count, sum } from &quot;drizzle-orm&quot;;
import type {
  ExpenseData,
  ExpenseFilters,
  ExpenseSummary,
  ServiceResponse,
} from &quot;./models&quot;;

export class ExpenseRepository {
  /**
   * Create a new expense
   */
  async create(expenseData: any): Promise<ServiceResponse<ExpenseData>> {
    try {
      const [expense] = await db
        .insert(expenses)
        .values(expenseData)
        .returning();

      const fullExpense = await this.findById(expense.id);

      return {
        success: true,
        data: fullExpense.data,
      };
    } catch (error) {
      console.error(&quot;[ExpenseRepository] Error creating expense:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to create expense&quot;,
        code: &quot;CREATE_FAILED&quot;,
      };
    }
  }

  /**
   * Find expense by ID with related data
   */
  async findById(id: string): Promise<ServiceResponse<ExpenseData>> {
    try {
      const [expense] = await db
        .select({
          id: expenses.id,
          agentId: expenses.agentId,
          eventId: expenses.eventId,
          shiftId: expenses.shiftId,
          expenseType: expenses.expenseType,
          amount: expenses.amount,
          currency: expenses.currency,
          description: expenses.description,
          expenseDate: expenses.expenseDate,
          receiptUrl: expenses.receiptUrl,
          mileageData: expenses.mileageData,
          status: expenses.status,
          submittedAt: expenses.submittedAt,
          approvedAt: expenses.approvedAt,
          approvedBy: expenses.approvedBy,
          rejectionReason: expenses.rejectionReason,
          createdAt: expenses.createdAt,
          agent: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            username: users.username,
          },
          event: {
            id: systemEvents.id,
            name: systemEvents.name,
          },
          shift: {
            id: shifts.id,
            title: shifts.title,
          },
        })
        .from(expenses)
        .leftJoin(users, eq(expenses.agentId, users.id))
        .leftJoin(events, eq(expenses.eventId, systemEvents.id))
        .leftJoin(shifts, eq(expenses.shiftId, shifts.id))
        .where(eq(expenses.id, id))
        .limit(1);

      if (!expense) {
        return {
          success: false,
          error: &quot;Expense not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      return {
        success: true,
        data: expense as ExpenseData,
      };
    } catch (error) {
      console.error(&quot;[ExpenseRepository] Error finding expense by ID:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to find expense&quot;,
        code: &quot;FIND_FAILED&quot;,
      };
    }
  }

  /**
   * Find expenses with filters and pagination
   */
  async findMany(
    filters: ExpenseFilters,
  ): Promise<
    ServiceResponse<{
      expenses: ExpenseData[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    try {
      const conditions: any[] = [];

      // Build where conditions based on filters
      if (filters.agentId) {
        conditions.push(eq(expenses.agentId, filters.agentId));
      }

      if (filters.eventId) {
        conditions.push(eq(expenses.eventId, filters.eventId));
      }

      if (filters.shiftId) {
        conditions.push(eq(expenses.shiftId, filters.shiftId));
      }

      if (filters.status) {
        conditions.push(eq(expenses.status, filters.status));
      }

      if (filters.expenseType) {
        conditions.push(eq(expenses.expenseType, filters.expenseType));
      }

      if (filters.startDate) {
        conditions.push(gte(expenses.expenseDate, filters.startDate));
      }

      if (filters.endDate) {
        conditions.push(lte(expenses.expenseDate, filters.endDate));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(expenses)
        .where(whereClause);

      const total = totalResult?.count || 0;

      // Get paginated results
      const offset = (filters.page - 1) * filters.limit;

      const expenseResults = await db
        .select({
          id: expenses.id,
          agentId: expenses.agentId,
          eventId: expenses.eventId,
          shiftId: expenses.shiftId,
          expenseType: expenses.expenseType,
          amount: expenses.amount,
          currency: expenses.currency,
          description: expenses.description,
          expenseDate: expenses.expenseDate,
          receiptUrl: expenses.receiptUrl,
          mileageData: expenses.mileageData,
          status: expenses.status,
          submittedAt: expenses.submittedAt,
          approvedAt: expenses.approvedAt,
          approvedBy: expenses.approvedBy,
          rejectionReason: expenses.rejectionReason,
          createdAt: expenses.createdAt,
          agent: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            username: users.username,
          },
          event: {
            id: systemEvents.id,
            name: systemEvents.name,
          },
          shift: {
            id: shifts.id,
            title: shifts.title,
          },
        })
        .from(expenses)
        .leftJoin(users, eq(expenses.agentId, users.id))
        .leftJoin(events, eq(expenses.eventId, systemEvents.id))
        .leftJoin(shifts, eq(expenses.shiftId, shifts.id))
        .where(whereClause)
        .orderBy(desc(expenses.createdAt))
        .limit(filters.limit)
        .offset(offset);

      return {
        success: true,
        data: {
          expenses: expenseResults as ExpenseData[],
          total,
          page: filters.page,
          limit: filters.limit,
        },
      };
    } catch (error) {
      console.error(&quot;[ExpenseRepository] Error finding expenses:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to find expenses&quot;,
        code: &quot;FIND_MANY_FAILED&quot;,
      };
    }
  }

  /**
   * Update expense
   */
  async update(
    id: string,
    updateData: Partial<any>,
  ): Promise<ServiceResponse<ExpenseData>> {
    try {
      const [updatedExpense] = await db
        .update(expenses)
        .set(updateData)
        .where(eq(expenses.id, id))
        .returning();

      if (!updatedExpense) {
        return {
          success: false,
          error: &quot;Expense not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      const fullExpense = await this.findById(updatedExpense.id);

      return {
        success: true,
        data: fullExpense.data,
      };
    } catch (error) {
      console.error(&quot;[ExpenseRepository] Error updating expense:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to update expense&quot;,
        code: &quot;UPDATE_FAILED&quot;,
      };
    }
  }

  /**
   * Delete expense
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const result = await db.delete(expenses).where(eq(expenses.id, id));

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error(&quot;[ExpenseRepository] Error deleting expense:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to delete expense&quot;,
        code: &quot;DELETE_FAILED&quot;,
      };
    }
  }

  /**
   * Get expense summary with aggregations
   */
  async getSummary(
    filters: Partial<ExpenseFilters>,
  ): Promise<ServiceResponse<ExpenseSummary>> {
    try {
      const conditions: any[] = [];

      if (filters.agentId) {
        conditions.push(eq(expenses.agentId, filters.agentId));
      }

      if (filters.organizationId) {
        // Note: This would require a join with organization data
        // For now, we'll handle organization filtering at the service level
      }

      if (filters.startDate) {
        conditions.push(gte(expenses.expenseDate, filters.startDate));
      }

      if (filters.endDate) {
        conditions.push(lte(expenses.expenseDate, filters.endDate));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get overall summary
      const [overallSummary] = await db
        .select({
          totalExpenses: count(),
          totalAmount: sum(expenses.amount),
        })
        .from(expenses)
        .where(whereClause);

      // Get summary by status
      const statusSummary = await db
        .select({
          status: expenses.status,
          count: count(),
          amount: sum(expenses.amount),
        })
        .from(expenses)
        .where(whereClause)
        .groupBy(expenses.status);

      // Get summary by category
      const categorySummary = await db
        .select({
          expenseType: expenses.expenseType,
          count: count(),
          amount: sum(expenses.amount),
        })
        .from(expenses)
        .where(whereClause)
        .groupBy(expenses.expenseType);

      // Build response
      const byStatus: Record<string, any> = {};
      const byCategory: Record<string, any> = {};

      statusSummary.forEach((item) => {
        byStatus[item.status] = {
          count: item.count,
          amount: item.amount?.toString() || &quot;0&quot;,
        };
      });

      categorySummary.forEach((item) => {
        byCategory[item.expenseType] = {
          count: item.count,
          amount: item.amount?.toString() || &quot;0&quot;,
        };
      });

      const summary: ExpenseSummary = {
        totalExpenses: overallSummary?.totalExpenses || 0,
        totalAmount: overallSummary?.totalAmount?.toString() || &quot;0&quot;,
        pendingApproval: byStatus.submitted?.count || 0,
        pendingAmount: byStatus.submitted?.amount || &quot;0&quot;,
        approvedAmount: byStatus.approved?.amount || &quot;0&quot;,
        rejectedAmount: byStatus.rejected?.amount || &quot;0&quot;,
        byCategory,
        byStatus,
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      console.error(&quot;[ExpenseRepository] Error getting summary:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to get expense summary&quot;,
        code: &quot;SUMMARY_FAILED&quot;,
      };
    }
  }

  /**
   * Check if expense exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const [expense] = await db
        .select({ id: expenses.id })
        .from(expenses)
        .where(eq(expenses.id, id))
        .limit(1);

      return !!expense;
    } catch (error) {
      console.error(
        &quot;[ExpenseRepository] Error checking expense existence:&quot;,
        error,
      );
      return false;
    }
  }

  /**
   * Get expenses by agent ID
   */
  async findByAgentId(
    agentId: string,
    filters?: Partial<ExpenseFilters>,
  ): Promise<ServiceResponse<ExpenseData[]>> {
    const extendedFilters: ExpenseFilters = {
      organizationId: filters?.organizationId || "",
      agentId,
      ...filters,
      page: filters?.page || 1,
      limit: filters?.limit || 50,
    };

    const result = await this.findMany(extendedFilters);

    if (result.success) {
      return {
        success: true,
        data: result.data?.expenses || [],
      };
    }

    return {
      success: false,
      error: result.error,
      code: result.code,
    };
  }
}
