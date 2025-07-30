/**
 * Shift Management Service - Index
 * Central export point for shift management components
 */

export { ShiftService } from &quot;./ShiftService&quot;;
export { ShiftRepository } from &quot;./repository&quot;;
export { shiftEventPublisher, ShiftEventPublisher } from &quot;./events&quot;;
export * from &quot;./models&quot;;

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
} from &quot;./models&quot;;

export { ShiftStatus, AssignmentStatus } from &quot;./models&quot;;
