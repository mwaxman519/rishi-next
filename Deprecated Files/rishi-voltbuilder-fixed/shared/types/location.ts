/**
 * Location Type Definitions
 * This file contains type definitions for locations used throughout the application
 */

/**
 * Location status enum
 * Simplified to use a single status field with all possible states
 */
export enum LocationStatus {
  PENDING = "pending", // Awaiting approval
  APPROVED = "approved", // Location is approved and active (consolidated approved + active)
  REJECTED = "rejected", // Location was rejected during approval process
  INACTIVE = "inactive", // Location was previously approved but now inactive
}

/**
 * Location type enum
 */
export enum LocationType {
  VENUE = "venue",
  OFFICE = "office",
  STORAGE = "storage",
  RETAIL = "retail",
  MEDICAL = "medical",
  PROCESSING = "processing",
  OTHER = "other",
}

/**
 * User-friendly label mapping for status values
 */
export const LocationStatusLabels: Record<LocationStatus, string> = {
  [LocationStatus.PENDING]: "Pending",
  [LocationStatus.APPROVED]: "Approved",
  [LocationStatus.REJECTED]: "Rejected",
  [LocationStatus.INACTIVE]: "Inactive",
};

/**
 * User-friendly label mapping for location types
 */
export const LocationTypeLabels: Record<LocationType, string> = {
  [LocationType.VENUE]: "Venue",
  [LocationType.OFFICE]: "Office",
  [LocationType.STORAGE]: "Storage",
  [LocationType.RETAIL]: "Retail",
  [LocationType.MEDICAL]: "Medical",
  [LocationType.PROCESSING]: "Processing",
  [LocationType.OTHER]: "Other",
};

/**
 * Status color mapping for UI elements
 */
export const LocationStatusColors: Record<
  LocationStatus,
  { bg: string; text: string; border: string }
> = {
  [LocationStatus.PENDING]: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  [LocationStatus.APPROVED]: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  [LocationStatus.REJECTED]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
  [LocationStatus.INACTIVE]: {
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-200",
  },
};
