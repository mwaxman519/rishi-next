/**
 * Shift Management Service - Index
 * Central export point for shift management components
 */

export { ShiftService } from "./ShiftService";
export { ShiftRepository } from "./repository";
export { shiftEventPublisher, ShiftEventPublisher } from "./events";
export * from "./models";

// Re-export for convenience
export type {
  ShiftDTO,
  ShiftAssignmentDTO,
  CreateShiftParams,
  UpdateShiftParams,
  ShiftAssignmentParams,
  ShiftFilters,
  AvailabilityCheck,
  AvailabilityResult,
  ShiftMetrics,
  WorkforceMetrics,
} from "./models";

export { ShiftStatus, AssignmentStatus } from "./models";
