/**
 * Expense Management Events
 * Event definitions for microservice communication
 */

import { EventBus } from "../core/EventBus";
import type { ExpenseData, ExpenseApproval } from "./models";

// Event Bus Instance
export const expenseEventBus = new EventBus();

// Event Types
export const EXPENSE_EVENTS = {
  SUBMITTED: "expense.submitted",
  APPROVED: "expense.approved",
  REJECTED: "expense.rejected",
  UPDATED: "expense.updated",
  DELETED: "expense.deleted",
  PAYMENT_PROCESSED: "expense.payment.processed",
} as const;

// Event Interfaces
export interface ExpenseSubmittedEvent {
  type: typeof EXPENSE_EVENTS.SUBMITTED;
  payload: {
    expense: ExpenseData;
    submittedBy: string;
    organizationId: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface ExpenseApprovedEvent {
  type: typeof EXPENSE_EVENTS.APPROVED;
  payload: {
    expense: ExpenseData;
    approvedBy: string;
    organizationId: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface ExpenseRejectedEvent {
  type: typeof EXPENSE_EVENTS.REJECTED;
  payload: {
    expense: ExpenseData;
    rejectedBy: string;
    rejectionReason: string;
    organizationId: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface ExpenseUpdatedEvent {
  type: typeof EXPENSE_EVENTS.UPDATED;
  payload: {
    expense: ExpenseData;
    updatedBy: string;
    changes: Record<string, any>;
    organizationId: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface ExpenseDeletedEvent {
  type: typeof EXPENSE_EVENTS.DELETED;
  payload: {
    expenseId: string;
    deletedBy: string;
    organizationId: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface ExpensePaymentProcessedEvent {
  type: typeof EXPENSE_EVENTS.PAYMENT_PROCESSED;
  payload: {
    expense: ExpenseData;
    paymentId: string;
    processedBy: string;
    organizationId: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

// Event Publishers
export class ExpenseEventPublisher {
  constructor(private eventBus: EventBus = expenseEventBus) {}

  async publishExpenseSubmitted(
    expense: ExpenseData,
    submittedBy: string,
    organizationId: string,
  ): Promise<void> {
    const event: ExpenseSubmittedEvent = {
      type: EXPENSE_EVENTS.SUBMITTED,
      payload: {
        expense,
        submittedBy,
        organizationId,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: "1.0",
        source: "expense-service",
      },
    };

    await this.eventBus.publish(EXPENSE_EVENTS.SUBMITTED, event);
  }

  async publishExpenseApproved(
    expense: ExpenseData,
    approvedBy: string,
    organizationId: string,
  ): Promise<void> {
    const event: ExpenseApprovedEvent = {
      type: EXPENSE_EVENTS.APPROVED,
      payload: {
        expense,
        approvedBy,
        organizationId,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: "1.0",
        source: "expense-service",
      },
    };

    await this.eventBus.publish(EXPENSE_EVENTS.APPROVED, event);
  }

  async publishExpenseRejected(
    expense: ExpenseData,
    rejectedBy: string,
    rejectionReason: string,
    organizationId: string,
  ): Promise<void> {
    const event: ExpenseRejectedEvent = {
      type: EXPENSE_EVENTS.REJECTED,
      payload: {
        expense,
        rejectedBy,
        rejectionReason,
        organizationId,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: "1.0",
        source: "expense-service",
      },
    };

    await this.eventBus.publish(EXPENSE_EVENTS.REJECTED, event);
  }

  async publishExpenseUpdated(
    expense: ExpenseData,
    updatedBy: string,
    changes: Record<string, any>,
    organizationId: string,
  ): Promise<void> {
    const event: ExpenseUpdatedEvent = {
      type: EXPENSE_EVENTS.UPDATED,
      payload: {
        expense,
        updatedBy,
        changes,
        organizationId,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: "1.0",
        source: "expense-service",
      },
    };

    await this.eventBus.publish(EXPENSE_EVENTS.UPDATED, event);
  }

  async publishExpenseDeleted(
    expenseId: string,
    deletedBy: string,
    organizationId: string,
  ): Promise<void> {
    const event: ExpenseDeletedEvent = {
      type: EXPENSE_EVENTS.DELETED,
      payload: {
        expenseId,
        deletedBy,
        organizationId,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: "1.0",
        source: "expense-service",
      },
    };

    await this.eventBus.publish(EXPENSE_EVENTS.DELETED, event);
  }

  async publishPaymentProcessed(
    expense: ExpenseData,
    paymentId: string,
    processedBy: string,
    organizationId: string,
  ): Promise<void> {
    const event: ExpensePaymentProcessedEvent = {
      type: EXPENSE_EVENTS.PAYMENT_PROCESSED,
      payload: {
        expense,
        paymentId,
        processedBy,
        organizationId,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: "1.0",
        source: "expense-service",
      },
    };

    await this.eventBus.publish(EXPENSE_EVENTS.PAYMENT_PROCESSED, event);
  }
}

// Event Handlers
export class ExpenseEventHandler {
  constructor(private eventBus: EventBus = expenseEventBus) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe(
      EXPENSE_EVENTS.SUBMITTED,
      this.handleExpenseSubmitted.bind(this),
    );
    this.eventBus.subscribe(
      EXPENSE_EVENTS.APPROVED,
      this.handleExpenseApproved.bind(this),
    );
    this.eventBus.subscribe(
      EXPENSE_EVENTS.REJECTED,
      this.handleExpenseRejected.bind(this),
    );
    this.eventBus.subscribe(
      EXPENSE_EVENTS.UPDATED,
      this.handleExpenseUpdated.bind(this),
    );
    this.eventBus.subscribe(
      EXPENSE_EVENTS.DELETED,
      this.handleExpenseDeleted.bind(this),
    );
    this.eventBus.subscribe(
      EXPENSE_EVENTS.PAYMENT_PROCESSED,
      this.handlePaymentProcessed.bind(this),
    );
  }

  private async handleExpenseSubmitted(
    event: ExpenseSubmittedEvent,
  ): Promise<void> {
    console.log(
      `[ExpenseEventHandler] Handling expense submitted: ${event.payload.expense.id}`,
    );

    // Notify approval service
    await this.notifyApprovalService(event);

    // Send notifications
    await this.sendSubmissionNotifications(event);

    // Update analytics
    await this.updateExpenseAnalytics(event);
  }

  private async handleExpenseApproved(
    event: ExpenseApprovedEvent,
  ): Promise<void> {
    console.log(
      `[ExpenseEventHandler] Handling expense approved: ${event.payload.expense.id}`,
    );

    // Notify payroll service
    await this.notifyPayrollService(event);

    // Send notifications
    await this.sendApprovalNotifications(event);

    // Update analytics
    await this.updateExpenseAnalytics(event);
  }

  private async handleExpenseRejected(
    event: ExpenseRejectedEvent,
  ): Promise<void> {
    console.log(
      `[ExpenseEventHandler] Handling expense rejected: ${event.payload.expense.id}`,
    );

    // Send notifications
    await this.sendRejectionNotifications(event);

    // Update analytics
    await this.updateExpenseAnalytics(event);
  }

  private async handleExpenseUpdated(
    event: ExpenseUpdatedEvent,
  ): Promise<void> {
    console.log(
      `[ExpenseEventHandler] Handling expense updated: ${event.payload.expense.id}`,
    );

    // Audit trail
    await this.recordAuditTrail(event);

    // Update analytics if needed
    await this.updateExpenseAnalytics(event);
  }

  private async handleExpenseDeleted(
    event: ExpenseDeletedEvent,
  ): Promise<void> {
    console.log(
      `[ExpenseEventHandler] Handling expense deleted: ${event.payload.expenseId}`,
    );

    // Clean up related data
    await this.cleanupRelatedData(event);

    // Audit trail
    await this.recordAuditTrail(event);
  }

  private async handlePaymentProcessed(
    event: ExpensePaymentProcessedEvent,
  ): Promise<void> {
    console.log(
      `[ExpenseEventHandler] Handling payment processed: ${event.payload.expense.id}`,
    );

    // Send notifications
    await this.sendPaymentNotifications(event);

    // Update analytics
    await this.updateExpenseAnalytics(event);
  }

  // Service Integration Methods
  private async notifyApprovalService(
    event: ExpenseSubmittedEvent,
  ): Promise<void> {
    // Integration with approval workflow service
    console.log(
      `[ExpenseEventHandler] Notifying approval service for expense: ${event.payload.expense.id}`,
    );
  }

  private async notifyPayrollService(
    event: ExpenseApprovedEvent,
  ): Promise<void> {
    // Integration with payroll service
    console.log(
      `[ExpenseEventHandler] Notifying payroll service for expense: ${event.payload.expense.id}`,
    );
  }

  private async sendSubmissionNotifications(
    event: ExpenseSubmittedEvent,
  ): Promise<void> {
    // Send notifications to managers/approvers
    console.log(
      `[ExpenseEventHandler] Sending submission notifications for expense: ${event.payload.expense.id}`,
    );
  }

  private async sendApprovalNotifications(
    event: ExpenseApprovedEvent,
  ): Promise<void> {
    // Send notifications to submitter
    console.log(
      `[ExpenseEventHandler] Sending approval notifications for expense: ${event.payload.expense.id}`,
    );
  }

  private async sendRejectionNotifications(
    event: ExpenseRejectedEvent,
  ): Promise<void> {
    // Send notifications to submitter
    console.log(
      `[ExpenseEventHandler] Sending rejection notifications for expense: ${event.payload.expense.id}`,
    );
  }

  private async sendPaymentNotifications(
    event: ExpensePaymentProcessedEvent,
  ): Promise<void> {
    // Send payment confirmation notifications
    console.log(
      `[ExpenseEventHandler] Sending payment notifications for expense: ${event.payload.expense.id}`,
    );
  }

  private async updateExpenseAnalytics(event: any): Promise<void> {
    // Update analytics and reporting data
    console.log(
      `[ExpenseEventHandler] Updating analytics for event: ${event.type}`,
    );
  }

  private async recordAuditTrail(event: any): Promise<void> {
    // Record audit trail for compliance
    console.log(
      `[ExpenseEventHandler] Recording audit trail for event: ${event.type}`,
    );
  }

  private async cleanupRelatedData(event: ExpenseDeletedEvent): Promise<void> {
    // Clean up related data when expense is deleted
    console.log(
      `[ExpenseEventHandler] Cleaning up data for deleted expense: ${event.payload.expenseId}`,
    );
  }
}

// Initialize event handlers
export const expenseEventHandler = new ExpenseEventHandler();
export const expenseEventPublisher = new ExpenseEventPublisher();
