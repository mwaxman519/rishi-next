/**
 * Expense Management Service - Event-Driven Microservice
 * Comprehensive expense tracking with role-based access control
 * Aligned with platform architecture patterns
 */

import { ExpenseRepository } from "./repository";
import { expenseEventPublisher } from "./events";
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
} from "./models";

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
        status: "submitted" as const,
        submittedAt: new Date(),
        currency: validatedData.currency || "USD",
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
      console.error("[ExpenseService] Error submitting expense:", error);
      return {
        success: false,
        error: "Failed to submit expense",
        code: "SUBMISSION_FAILED",
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
        status: "draft" as const,
        currency: submission.currency || "USD",
      };

      const result = await this.repository.create(expenseData);

      if (!result.success || !result.data) {
        return result;
      }

      // No events published for drafts
      return result;
    } catch (error) {
      console.error("[ExpenseService] Error saving draft:", error);
      return {
        success: false,
        error: "Failed to save draft",
        code: "DRAFT_SAVE_FAILED",
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
      console.error("[ExpenseService] Error getting expenses:", error);
      return {
        success: false,
        error: "Failed to get expenses",
        code: "GET_EXPENSES_FAILED",
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
          error: "Access denied",
          code: "ACCESS_DENIED",
        };
      }

      return result;
    } catch (error) {
      console.error("[ExpenseService] Error getting expense by ID:", error);
      return {
        success: false,
        error: "Failed to get expense",
        code: "GET_EXPENSE_FAILED",
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
          error: "Access denied",
          code: "ACCESS_DENIED",
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
      console.error("[ExpenseService] Error updating expense:", error);
      return {
        success: false,
        error: "Failed to update expense",
        code: "UPDATE_FAILED",
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
          error: "Insufficient permissions for approval",
          code: "APPROVAL_PERMISSION_DENIED",
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
      if (existingExpense.status !== "submitted") {
        return {
          success: false,
          error: "Expense is not in a state that can be approved",
          code: "INVALID_STATE_FOR_APPROVAL",
        };
      }

      // Prepare update data
      const updateData = {
        status: validatedApproval.approved
          ? ("approved" as const)
          : ("rejected" as const),
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
          validatedApproval.rejectionReason || "No reason provided",
          organizationId,
        );
      }

      return result;
    } catch (error) {
      console.error("[ExpenseService] Error processing approval:", error);
      return {
        success: false,
        error: "Failed to process approval",
        code: "APPROVAL_PROCESSING_FAILED",
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
          error: "Expense not found",
          code: "NOT_FOUND",
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
          error: "Access denied",
          code: "ACCESS_DENIED",
        };
      }

      // Check if expense can be deleted
      if (
        existingExpense.status === "approved" ||
        existingExpense.status === "paid"
      ) {
        return {
          success: false,
          error: "Cannot delete approved or paid expenses",
          code: "INVALID_STATE_FOR_DELETION",
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
      console.error("[ExpenseService] Error deleting expense:", error);
      return {
        success: false,
        error: "Failed to delete expense",
        code: "DELETE_FAILED",
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
      console.error("[ExpenseService] Error getting expense summary:", error);
      return {
        success: false,
        error: "Failed to get expense summary",
        code: "SUMMARY_FAILED",
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
      case "brand_agent":
        // Brand agents can only see their own expenses
        return {
          ...filters,
          agentId: requestingUserId,
        };

      case "internal_field_manager":
      case "organization_admin":
        // Field managers and org admins can see organization expenses
        // organizationId filter is already applied
        return filters;

      case "super_admin":
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
      case "brand_agent":
        return expense.agentId === requestingUserId;

      case "internal_field_manager":
      case "organization_admin":
        // Would need to check organization membership in real implementation
        return true;

      case "super_admin":
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
      "internal_field_manager",
      "organization_admin",
      "super_admin",
    ].includes(userRole);
  }
}
