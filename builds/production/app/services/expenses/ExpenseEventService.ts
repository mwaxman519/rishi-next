/**
 * Expense Event Service - Microservice Architecture
 * Event-driven expense management with proper service boundaries
 */

import { EventEmitter } from "events";

export interface ExpenseEvent {
  id: string;
  type:
    | "expense.submitted"
    | "expense.approved"
    | "expense.rejected"
    | "expense.updated"
    | "expense.deleted";
  payload: any;
  timestamp: Date;
  userId: string;
  organizationId?: string;
}

export interface ExpenseSubmittedEvent extends ExpenseEvent {
  type: "expense.submitted";
  payload: {
    expenseId: string;
    agentId: string;
    amount: string;
    expenseType: string;
    description: string;
    submittedAt: Date;
  };
}

export interface ExpenseApprovedEvent extends ExpenseEvent {
  type: "expense.approved";
  payload: {
    expenseId: string;
    approvedBy: string;
    approvedAt: Date;
    amount: string;
  };
}

export interface ExpenseRejectedEvent extends ExpenseEvent {
  type: "expense.rejected";
  payload: {
    expenseId: string;
    rejectedBy: string;
    rejectedAt: Date;
    reason: string;
  };
}

class ExpenseEventService extends EventEmitter {
  private static instance: ExpenseEventService;

  static getInstance(): ExpenseEventService {
    if (!ExpenseEventService.instance) {
      ExpenseEventService.instance = new ExpenseEventService();
    }
    return ExpenseEventService.instance;
  }

  async publishEvent(event: ExpenseEvent): Promise<void> {
    console.log(`Publishing expense event: ${event.type}`, event);

    // Emit event for internal listeners
    this.emit(event.type, event);

    // Store event for audit trail
    await this.storeEvent(event);

    // Trigger downstream services
    await this.notifyDownstreamServices(event);
  }

  private async storeEvent(event: ExpenseEvent): Promise<void> {
    // Store event in event store for audit and replay
    // This would typically go to a dedicated event store
    console.log(`Storing event: ${event.id}`);
  }

  private async notifyDownstreamServices(event: ExpenseEvent): Promise<void> {
    switch (event.type) {
      case "expense.submitted":
        await this.notifyApprovalService(event as ExpenseSubmittedEvent);
        await this.notifyNotificationService(event);
        break;
      case "expense.approved":
        await this.notifyPayrollService(event as ExpenseApprovedEvent);
        await this.notifyNotificationService(event);
        break;
      case "expense.rejected":
        await this.notifyNotificationService(event);
        break;
    }
  }

  private async notifyApprovalService(
    event: ExpenseSubmittedEvent,
  ): Promise<void> {
    // Trigger approval workflow
    console.log(
      `Notifying approval service for expense: ${event.payload.expenseId}`,
    );
  }

  private async notifyPayrollService(
    event: ExpenseApprovedEvent,
  ): Promise<void> {
    // Add to payroll processing
    console.log(
      `Notifying payroll service for approved expense: ${event.payload.expenseId}`,
    );
  }

  private async notifyNotificationService(event: ExpenseEvent): Promise<void> {
    // Send notifications to relevant users
    console.log(`Sending notifications for event: ${event.type}`);
  }

  // Event listeners for cross-service communication
  setupEventListeners(): void {
    this.on("expense.submitted", this.handleExpenseSubmitted.bind(this));
    this.on("expense.approved", this.handleExpenseApproved.bind(this));
    this.on("expense.rejected", this.handleExpenseRejected.bind(this));
  }

  private async handleExpenseSubmitted(
    event: ExpenseSubmittedEvent,
  ): Promise<void> {
    console.log(`Handling expense submitted: ${event.payload.expenseId}`);
    // Business logic for when expense is submitted
  }

  private async handleExpenseApproved(
    event: ExpenseApprovedEvent,
  ): Promise<void> {
    console.log(`Handling expense approved: ${event.payload.expenseId}`);
    // Business logic for when expense is approved
  }

  private async handleExpenseRejected(
    event: ExpenseRejectedEvent,
  ): Promise<void> {
    console.log(`Handling expense rejected: ${event.payload.expenseId}`);
    // Business logic for when expense is rejected
  }
}

export const expenseEventService = ExpenseEventService.getInstance();

// Initialize event listeners
expenseEventService.setupEventListeners();
