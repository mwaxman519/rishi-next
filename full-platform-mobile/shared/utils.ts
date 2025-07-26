/**
 * Shared Type Utilities
 *
 * This file contains utility functions for working with types, dates, and other
 * common data conversions to prevent TypeScript errors and ensure consistency.
 */

/**
 * Safely converts a Date object or string to an ISO string.
 * Handles both Date objects and ISO string dates to prevent double conversion errors.
 */
export function toISOString(
  date: Date | string | null | undefined,
): string | null {
  if (!date) return null;

  if (date instanceof Date) {
    return date.toISOString();
  }

  // If it's already a string, ensure it's a valid ISO format first
  try {
    return new Date(date).toISOString();
  } catch (error) {
    console.error("Invalid date format:", date);
    return null;
  }
}

/**
 * Creates a proper Date object from various input types
 */
export function toDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;

  if (date instanceof Date) {
    return date;
  }

  try {
    return new Date(date);
  } catch (error) {
    console.error("Invalid date format:", date);
    return null;
  }
}

/**
 * Check if a date or string is a valid date
 */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  const d = typeof date === "string" ? new Date(date) : date;
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Type-safe conversion to a string
 */
export function toString(value: any): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;

  try {
    return String(value);
  } catch (error) {
    console.error("Failed to convert to string:", value);
    return null;
  }
}

/**
 * Type-safe conversion to a number
 */
export function toNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;

  try {
    const num = Number(value);
    return isNaN(num) ? null : num;
  } catch (error) {
    console.error("Failed to convert to number:", value);
    return null;
  }
}

/**
 * Type-safe conversion to a boolean
 */
export function toBoolean(value: any): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const lowercaseValue = value.toLowerCase();
    if (
      lowercaseValue === "true" ||
      lowercaseValue === "yes" ||
      lowercaseValue === "1"
    )
      return true;
    if (
      lowercaseValue === "false" ||
      lowercaseValue === "no" ||
      lowercaseValue === "0"
    )
      return false;
    return null;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  return null;
}

/**
 * Safely parses a JSON string
 */
export function parseJSON<T>(json: string | null | undefined): T | null {
  if (!json) return null;

  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
}

/**
 * Safely stringifies an object to JSON
 */
export function stringifyJSON(obj: any): string | null {
  if (obj === null || obj === undefined) return null;

  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error("Failed to stringify object:", error);
    return null;
  }
}

/**
 * Omits specified properties from an object (type-safe)
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

/**
 * Picks only specified properties from an object (type-safe)
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Generic type guard - Type-safe assertion for specific types
 */
export function isType<T>(
  value: any,
  checker: (value: any) => boolean,
): value is T {
  return checker(value);
}

/**
 * Ensures an input is an array, wrapping non-arrays
 * Returns empty array for null/undefined inputs
 */
export function ensureArray<T>(input: T | T[] | null | undefined): T[] {
  if (input === null || input === undefined) return [];
  return Array.isArray(input) ? input : [input];
}
