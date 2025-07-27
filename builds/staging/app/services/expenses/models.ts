/**
 * Expense Management Models
 * Type definitions aligned with platform architecture
 */

import { z } from "zod";

export const ExpenseType = z.enum([
  "mileage",
  "meals",
  "parking",
  "supplies",
  "lodging",
  "transportation",
  "other",
]);

export const ExpenseStatus = z.enum([
  "draft",
  "submitted",
  "approved",
  "rejected",
  "paid",
]);

export const MileageDataSchema = z.object({
  startLocation: z.string(),
  endLocation: z.string(),
  distance: z.number(),
  rate: z.number(),
});

export const ExpenseSubmissionSchema = z.object({
  agentId: z.string().uuid(),
  eventId: z.string().uuid().optional(),
  shiftId: z.string().uuid().optional(),
  expenseType: ExpenseType,
  amount: z.string(),
  currency: z.string().default("USD"),
  description: z.string().min(1),
  expenseDate: z.string(),
  receiptUrl: z.string().optional(),
  mileageData: MileageDataSchema.optional(),
});

export const ExpenseUpdateSchema = ExpenseSubmissionSchema.partial();

export const ExpenseApprovalSchema = z.object({
  expenseId: z.string().uuid(),
  approved: z.boolean(),
  approvedBy: z.string().uuid(),
  rejectionReason: z.string().optional(),
});

export const ExpenseFiltersSchema = z.object({
  organizationId: z.string().uuid(),
  agentId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  shiftId: z.string().uuid().optional(),
  status: ExpenseStatus.optional(),
  expenseType: ExpenseType.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(50),
});

// Type exports
export type ExpenseType = z.infer<typeof ExpenseType>;
export type ExpenseStatus = z.infer<typeof ExpenseStatus>;
export type MileageData = z.infer<typeof MileageDataSchema>;
export type ExpenseSubmission = z.infer<typeof ExpenseSubmissionSchema>;
export type ExpenseUpdate = z.infer<typeof ExpenseUpdateSchema>;
export type ExpenseApproval = z.infer<typeof ExpenseApprovalSchema>;
export type ExpenseFilters = z.infer<typeof ExpenseFiltersSchema>;

export interface ExpenseData {
  id: string;
  agentId: string;
  eventId?: string | null;
  shiftId?: string | null;
  expenseType: ExpenseType;
  amount: string;
  currency: string;
  description: string;
  expenseDate: string;
  receiptUrl?: string | null;
  mileageData?: MileageData | null;
  status: ExpenseStatus;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: Date;
  agent?: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  event?: {
    id: string;
    name: string;
  };
  shift?: {
    id: string;
    title: string;
  };
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: string;
  pendingApproval: number;
  pendingAmount: string;
  approvedAmount: string;
  rejectedAmount: string;
  byCategory: Record<
    ExpenseType,
    {
      count: number;
      amount: string;
    }
  >;
  byStatus: Record<
    ExpenseStatus,
    {
      count: number;
      amount: string;
    }
  >;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
