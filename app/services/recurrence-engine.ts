/**
 * Recurrence Engine Service
 *
 * This service handles the calculation and management of recurring booking patterns.
 * It provides functions to generate occurrence dates based on recurrence rules,
 * validate recurrence patterns, and manage exceptions.
 *
 * The service uses memoization to improve performance for frequently accessed patterns.
 */

import {
  addDays,
  addWeeks,
  addMonths,
  isAfter,
  isSameDay,
  parseISO,
  format,
} from "date-fns";

// Recurrence frequency types
export enum RecurrenceFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

// Recurrence pattern definition
export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  occurrences: number;
  startDate: Date;
  endDate?: Date;
  exceptions?: Date[];
}

// Recurrence event occurrence
export interface RecurrenceOccurrence {
  date: Date;
  index: number; // 0-based index in the sequence
  isException: boolean;
}

/**
 * Memoization cache for recurrence patterns
 * Uses a combination of pattern properties as a key
 */
interface MemoCache {
  [key: string]: RecurrenceOccurrence[];
}

// Specialized for WebKit/Blink/Firefox Support:
// Ensures date serialization is consistent across browsers
function serializeDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function createCacheKey(pattern: RecurrencePattern): string {
  return `${pattern.frequency}_${pattern.occurrences}_${serializeDate(pattern.startDate)}_${
    pattern.endDate ? serializeDate(pattern.endDate) : "noend"
  }_${pattern.exceptions?.map(serializeDate).join("_") || "noexceptions"}`;
}

// Initialize memoization cache
const memoCache: MemoCache = {};

/**
 * The recurrence engine service provides functions to work with recurring bookings
 */
export const recurrenceEngine = {
  /**
   * Generate occurrence dates for a recurrence pattern
   * Uses memoization for improved performance
   */
  generateOccurrences(pattern: RecurrencePattern): RecurrenceOccurrence[] {
    // Create cache key for this pattern
    const cacheKey = createCacheKey(pattern);

    // Return cached result if available
    if (memoCache[cacheKey]) {
      return memoCache[cacheKey];
    }

    const occurrences: RecurrenceOccurrence[] = [];
    let currentDate = new Date(pattern.startDate);
    let count = 0;

    // Parse exceptions to Date objects if they're strings
    const exceptions = (pattern.exceptions || []).map((exc) =>
      typeof exc === "string" ? parseISO(exc) : exc,
    );

    // Generate dates until we reach the required number of occurrences
    // or until we hit the end date
    while (
      count < pattern.occurrences &&
      (!pattern.endDate || !isAfter(currentDate, pattern.endDate))
    ) {
      // Check if this date is an exception
      const isException = exceptions.some((exc) => isSameDay(currentDate, exc));

      occurrences.push({
        date: new Date(currentDate),
        index: count,
        isException,
      });

      // Increment to next occurrence based on frequency
      currentDate = this.getNextOccurrenceDate(currentDate, pattern.frequency);
      count++;
    }

    // Cache the result
    memoCache[cacheKey] = occurrences;

    return occurrences;
  },

  /**
   * Calculate the next occurrence date based on frequency
   */
  getNextOccurrenceDate(date: Date, frequency: RecurrenceFrequency): Date {
    switch (frequency) {
      case RecurrenceFrequency.DAILY:
        return addDays(date, 1);
      case RecurrenceFrequency.WEEKLY:
        return addWeeks(date, 1);
      case RecurrenceFrequency.MONTHLY:
        return addMonths(date, 1);
      default:
        throw new Error(`Unsupported recurrence frequency: ${frequency}`);
    }
  },

  /**
   * Validate a recurrence pattern
   */
  validatePattern(pattern: RecurrencePattern): boolean {
    // Basic validation rules
    if (!pattern.startDate) {
      return false;
    }

    if (pattern.occurrences <= 0) {
      return false;
    }

    if (pattern.endDate && isAfter(pattern.startDate, pattern.endDate)) {
      return false;
    }

    // Validate frequency
    if (!Object.values(RecurrenceFrequency).includes(pattern.frequency)) {
      return false;
    }

    return true;
  },

  /**
   * Add an exception date to a recurrence pattern
   */
  addException(
    pattern: RecurrencePattern,
    exceptionDate: Date,
  ): RecurrencePattern {
    const exceptions = [...(pattern.exceptions || [])];

    // Check if this date is already an exception
    if (!exceptions.some((exc) => isSameDay(exc, exceptionDate))) {
      exceptions.push(exceptionDate);
    }

    // Create a new pattern object to maintain immutability
    return {
      ...pattern,
      exceptions,
    };
  },

  /**
   * Remove an exception date from a recurrence pattern
   */
  removeException(
    pattern: RecurrencePattern,
    exceptionDate: Date,
  ): RecurrencePattern {
    if (!pattern.exceptions || pattern.exceptions.length === 0) {
      return pattern;
    }

    const exceptions = pattern.exceptions.filter(
      (exc) => !isSameDay(exc, exceptionDate),
    );

    // Create a new pattern object to maintain immutability
    return {
      ...pattern,
      exceptions,
    };
  },

  /**
   * Clear the memoization cache
   * This should be called when patterns change or on logout
   */
  clearCache(): void {
    Object.keys(memoCache).forEach((key) => {
      delete memoCache[key];
    });
  },

  /**
   * Get a description of the recurrence pattern
   */
  getPatternDescription(pattern: RecurrencePattern): string {
    const frequency =
      pattern.frequency.charAt(0).toUpperCase() + pattern.frequency.slice(1);
    const startDateStr = format(pattern.startDate, "PPP");
    const occurrences = pattern.occurrences;

    if (pattern.endDate) {
      const endDateStr = format(pattern.endDate, "PPP");
      return `${frequency}, ${occurrences} times from ${startDateStr} to ${endDateStr}`;
    }

    return `${frequency}, ${occurrences} times starting ${startDateStr}`;
  },
};

export default recurrenceEngine;
