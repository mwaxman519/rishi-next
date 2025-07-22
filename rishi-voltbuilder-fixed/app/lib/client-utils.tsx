"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

/**
 * Combines multiple class names or conditional class names and resolves Tailwind CSS conflicts
 * Client-only utility function
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date for display based on how recent it is
 * Client-only utility to avoid SSR date issues
 */
export function formatDisplayDate(
  date: Date | string | number | null | undefined,
): string {
  if (!date) return "";

  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  // Simple fallback implementation that works on client side
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  } catch (error) {
    return "Invalid date";
  }
}

/**
 * Safe browser-only local storage access
 */
export function safeLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  // Initial value from localStorage or default
  let storedValue: T = defaultValue;

  // Only access localStorage on the client
  if (typeof window !== "undefined") {
    try {
      const item = window.localStorage.getItem(key);
      storedValue = item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }

  // Function to update the value
  const setValue = (value: T) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  };

  return [storedValue, setValue];
}

/**
 * Create breadcrumbs array from path string - client-side version
 * Transforms "/docs/admin/users" into [{label: "docs", path: "/docs"}, {label: "admin", path: "/docs/admin"}, ...]
 */
export function createBreadcrumbsFromPath(path: string) {
  if (!path) return [];

  // Remove trailing slash if present
  const cleanPath = path.endsWith("/") ? path.slice(0, -1) : path;

  // Skip empty segments
  const segments = cleanPath.split("/").filter(Boolean);

  // Create breadcrumb items with accumulated paths
  return segments.map((segment, index) => {
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const path = "/" + segments.slice(0, index + 1).join("/");
    return { label, path };
  });
}

/**
 * Formats a date as a relative time string based on how recent it is
 * Client-only utility to avoid SSR date issues
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) return "";

  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  // For invalid dates
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  // For today, show relative time (e.g., "2 hours ago")
  if (isToday(dateObj)) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  // For yesterday, show "Yesterday at HH:MM AM/PM"
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, "h:mm a")}`;
  }

  // For the current year, show "MMM D at h:mm a" (e.g., "Jan 5 at 3:30 PM")
  if (dateObj.getFullYear() === new Date().getFullYear()) {
    return format(dateObj, "MMM d 'at' h:mm a");
  }

  // For other dates, show "MMM D, YYYY" (e.g., "Jan 5, 2022")
  return format(dateObj, "MMM d, yyyy");
}
