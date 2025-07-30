/**
 * Expense Management Service - Event-Driven Microservice
 * Comprehensive expense tracking with role-based access control
 * Aligned with platform architecture patterns
 */

import { ExpenseRepository } from &quot;./repository&quot;;
import { expenseEventPublisher } from &quot;./events&quot;;
import {
  ExpenseSubmissionSchema,
  ExpenseUpdateSchema,
  ExpenseApprovalSchema,
  ExpenseFiltersSchema,
  type ExpenseData,
  type ExpenseSubmission,
  type ExpenseUpdate,
  type ExpenseApproval,
  type ExpenseFilters,
  type ExpenseSummary,
  type ServiceResponse,
} from &quot;./models&quot;;

export class ExpenseService {
  private repository: ExpenseRepository;

  constructor() {
    this.repository = new ExpenseRepository();
  }

  /**
   * Submit a new expense
   */
  async submitExpense(
    submission: ExpenseSubmission,
    submittedBy: string,
    organizationId: string,
  ): Promise<ServiceResponse<ExpenseData>> {
    try {
      // Validate submission data
      const validatedData = ExpenseSubmissionSchema.parse(submission);

      // Create expense record
      const expenseData = {
        ...validatedData,
        status: &quot;submitted&quot; as const,
        submittedAt: new Date(),
        currency: validatedData.currency || &quot;USD&quot;,
      };

      const result = await this.repository.create(expenseData);

      if (!result.success || !result.data) {
        return result;
      }

      // Publish expense submitted event
      await expenseEventPublisher.publishExpenseSubmitted(
        result.data,
        submittedBy,
        organizationId,
      );

      return result;
    } catch (error) {
      console.error(&quot;[ExpenseService] Error submitting expense:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to submit expense&quot;,
        code: &quot;SUBMISSION_FAILED&quot;,
      };
    }
  }

  /**
   * Save expense as draft
   */
  async saveDraft(
    submission: ExpenseSubmission,
    submittedBy: string,
    organizationId: string,
  ): Promise<ServiceResponse<ExpenseData>> {
    try {
      // For drafts, make validation more lenient
      const expenseData = {
        ...submission,
        status: &quot;draft&quot; as const,
        currency: submission.currency || &quot;USD&quot;,
      };

      const result = await this.repository.create(expenseData);

      if (!result.success || !result.data) {
        return result;
      }

      // No events published for drafts
      return result;
    } catch (error) {
      console.error(&quot;[ExpenseService] Error saving draft:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to save draft&quot;,
        code: &quot;DRAFT_SAVE_FAILED&quot;,
      };
    }
  }

  /**
   * Get expenses with role-based filtering
   */
  async getExpenses(
    filters: ExpenseFilters,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): Promise<
    ServiceResponse<{
      expenses: ExpenseData[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    try {
      // Validate filters
      const validatedFilters = ExpenseFiltersSchema.parse({
        ...filters,
        organizationId,
      });

      // Apply role-based access control
      const accessControlledFilters = this.applyRoleBasedFiltering(
        validatedFilters,
        requestingUserId,
        userRole,
      );

      return await this.repository.findMany(accessControlledFilters);
    } catch (error) {
      console.error(&quot;[ExpenseService] Error getting expenses:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to get expenses&quot;,
        code: &quot;GET_EXPENSES_FAILED&quot;,
      };
    }
  }

  /**
   * Get expense by ID with access control
   */
  async getExpenseById(
    expenseId: string,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<ExpenseData>> {
    try {
      const result = await this.repository.findById(expenseId);

      if (!result.success || !result.data) {
        return result;
      }

      // Check access permissions
      if (
        !this.hasExpenseAccess(
          result.data,
          requestingUserId,
          userRole,
          organizationId,
        )
      ) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
        };
      }

      return result;
    } catch (error) {
      console.error(&quot;[ExpenseService] Error getting expense by ID:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to get expense&quot;,
        code: &quot;GET_EXPENSE_FAILED&quot;,
      };
    }
  }

  /**
   * Update expense
   */
  async updateExpense(
    expenseId: string,
    updates: ExpenseUpdate,
    updatedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<ExpenseData>> {
    try {
      // Get existing expense
      const existingResult = await this.repository.findById(expenseId);
      if (!existingResult.success || !existingResult.data) {
        return existingResult;
      }

      const existingExpense = existingResult.data;

      // Check permissions
      if (
        !this.hasExpenseAccess(
          existingExpense,
          updatedBy,
          userRole,
          organizationId,
        )
      ) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
        };
      }

      // Validate update data
      const validatedUpdates = ExpenseUpdateSchema.parse(updates);

      // Perform update
      const result = await this.repository.update(expenseId, validatedUpdates);

      if (!result.success || !result.data) {
        return result;
      }

      // Publish expense updated event
      await expenseEventPublisher.publishExpenseUpdated(
        result.data,
        updatedBy,
        validatedUpdates,
        organizationId,
      );

      return result;
    } catch (error) {
      console.error(&quot;[ExpenseService] Error updating expense:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to update expense&quot;,
        code: &quot;UPDATE_FAILED&quot;,
      };
    }
  }

  /**
   * Approve or reject expense
   */
  async processApproval(
    approval: ExpenseApproval,
    approverUserId: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<ExpenseData>> {
    try {
      // Validate approval data
      const validatedApproval = ExpenseApprovalSchema.parse(approval);

      // Check approver permissions
      if (!this.hasApprovalPermissions(userRole)) {
        return {
          success: false,
          error: &quot;Insufficient permissions for approval&quot;,
          code: &quot;APPROVAL_PERMISSION_DENIED&quot;,
        };
      }

      // Get existing expense
      const existingResult = await this.repository.findById(
        validatedApproval.expenseId,
      );
      if (!existingResult.success || !existingResult.data) {
        return existingResult;
      }

      const existingExpense = existingResult.data;

      // Check if expense can be approved
      if (existingExpense.status !== &quot;submitted&quot;) {
        return {
          success: false,
          error: &quot;Expense is not in a state that can be approved&quot;,
          code: &quot;INVALID_STATE_FOR_APPROVAL&quot;,
        };
      }

      // Prepare update data
      const updateData = {
        status: validatedApproval.approved
          ? (&quot;approved&quot; as const)
          : (&quot;rejected&quot; as const),
        approvedBy: approverUserId,
        approvedAt: new Date(),
        rejectionReason: validatedApproval.approved
          ? null
          : validatedApproval.rejectionReason,
      };

      // Perform update
      const result = await this.repository.update(
        validatedApproval.expenseId,
        updateData,
      );

      if (!result.success || !result.data) {
        return result;
      }

      // Publish appropriate event
      if (validatedApproval.approved) {
        await expenseEventPublisher.publishExpenseApproved(
          result.data,
          approverUserId,
          organizationId,
        );
      } else {
        await expenseEventPublisher.publishExpenseRejected(
          result.data,
          approverUserId,
          validatedApproval.rejectionReason || &quot;No reason provided&quot;,
          organizationId,
        );
      }

      return result;
    } catch (error) {
      console.error(&quot;[ExpenseService] Error processing approval:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to process approval&quot;,
        code: &quot;APPROVAL_PROCESSING_FAILED&quot;,
      };
    }
  }

  /**
   * Delete expense
   */
  async deleteExpense(
    expenseId: string,
    deletedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Get existing expense
      const existingResult = await this.repository.findById(expenseId);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: &quot;Expense not found&quot;,
          code: &quot;NOT_FOUND&quot;,
        };
      }

      const existingExpense = existingResult.data;

      // Check permissions
      if (
        !this.hasExpenseAccess(
          existingExpense,
          deletedBy,
          userRole,
          organizationId,
        )
      ) {
        return {
          success: false,
          error: &quot;Access denied&quot;,
          code: &quot;ACCESS_DENIED&quot;,
        };
      }

      // Check if expense can be deleted
      if (
        existingExpense.status === &quot;approved&quot; ||
        existingExpense.status === &quot;paid&quot;
      ) {
        return {
          success: false,
          error: &quot;Cannot delete approved or paid expenses&quot;,
          code: &quot;INVALID_STATE_FOR_DELETION&quot;,
        };
      }

      // Perform deletion
      const result = await this.repository.delete(expenseId);

      if (!result.success) {
        return result;
      }

      // Publish expense deleted event
      await expenseEventPublisher.publishExpenseDeleted(
        expenseId,
        deletedBy,
        organizationId,
      );

      return result;
    } catch (error) {
      console.error(&quot;[ExpenseService] Error deleting expense:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to delete expense&quot;,
        code: &quot;DELETE_FAILED&quot;,
      };
    }
  }

  /**
   * Get expense summary
   */
  async getExpenseSummary(
    filters: Partial<ExpenseFilters>,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): Promise<ServiceResponse<ExpenseSummary>> {
    try {
      // Apply role-based filtering
      const accessControlledFilters = this.applyRoleBasedFiltering(
        { ...filters, organizationId } as ExpenseFilters,
        requestingUserId,
        userRole,
      );

      return await this.repository.getSummary(accessControlledFilters);
    } catch (error) {
      console.error(&quot;[ExpenseService] Error getting expense summary:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to get expense summary&quot;,
        code: &quot;SUMMARY_FAILED&quot;,
      };
    }
  }

  /**
   * Calculate mileage expense
   */
  async calculateMileage(
    startLocation: string,
    endLocation: string,
    rate: number = 0.67,
  ): Promise<ServiceResponse<{ distance: number; rate: number; amount: number }>> {
    try {
      // For now, we'll use a simple distance calculation
      // In a real application, this would integrate with Google Maps API or similar
      const mockDistance = Math.floor(Math.random() * 50) + 5; // 5-55 miles
      const amount = mockDistance * rate;

      return {
        success: true,
        data: {
          distance: mockDistance,
          rate,
          amount: Number(amount.toFixed(2)),
        },
      };
    } catch (error) {
      console.error(&quot;[ExpenseService] Error calculating mileage:&quot;, error);
      return {
        success: false,
        error: &quot;Failed to calculate mileage&quot;,
        code: &quot;MILEAGE_CALCULATION_FAILED&quot;,
      };
    }
  }

  /**
   * Apply role-based access control to filters
   */
  private applyRoleBasedFiltering(
    filters: ExpenseFilters,
    requestingUserId: string,
    userRole: string,
  ): ExpenseFilters {
    switch (userRole) {
      case &quot;brand_agent&quot;:
        // Brand agents can only see their own expenses
        return {
          ...filters,
          agentId: requestingUserId,
        };

      case &quot;internal_field_manager&quot;:
      case &quot;organization_admin&quot;:
        // Field managers and org admins can see organization expenses
        // organizationId filter is already applied
        return filters;

      case &quot;super_admin&quot;:
        // Super admins can see all expenses
        return filters;

      default:
        // Default to user's own expenses only
        return {
          ...filters,
          agentId: requestingUserId,
        };
    }
  }

  /**
   * Check if user has access to specific expense
   */
  private hasExpenseAccess(
    expense: ExpenseData,
    requestingUserId: string,
    userRole: string,
    organizationId: string,
  ): boolean {
    switch (userRole) {
      case &quot;brand_agent&quot;:
        return expense.agentId === requestingUserId;

      case &quot;internal_field_manager&quot;:
      case &quot;organization_admin&quot;:
        // Would need to check organization membership in real implementation
        return true;

      case &quot;super_admin&quot;:
        return true;

      default:
        return expense.agentId === requestingUserId;
    }
  }

  /**
   * Check if user has approval permissions
   */
  private hasApprovalPermissions(userRole: string): boolean {
    return [
      &quot;internal_field_manager&quot;,
      &quot;organization_admin&quot;,
      &quot;super_admin&quot;,
    ].includes(userRole);
  }
}
