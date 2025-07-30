&quot;use client&quot;;

import { clsx, type ClassValue } from &quot;clsx&quot;;
import { twMerge } from &quot;tailwind-merge&quot;;
import { format, formatDistanceToNow, isToday, isYesterday } from &quot;date-fns&quot;;

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
  if (!date) return "&quot;;

  const dateObj =
    typeof date === &quot;string&quot; || typeof date === &quot;number&quot;
      ? new Date(date)
      : date;

  // Simple fallback implementation that works on client side
  try {
    return new Intl.DateTimeFormat(&quot;en-US&quot;, {
      year: &quot;numeric&quot;,
      month: &quot;short&quot;,
      day: &quot;numeric&quot;,
    }).format(dateObj);
  } catch (error) {
    return &quot;Invalid date&quot;;
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
  if (typeof window !== &quot;undefined&quot;) {
    try {
      const item = window.localStorage.getItem(key);
      storedValue = item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key &quot;${key}&quot;:`, error);
    }
  }

  // Function to update the value
  const setValue = (value: T) => {
    if (typeof window !== &quot;undefined&quot;) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key &quot;${key}&quot;:`, error);
      }
    }
  };

  return [storedValue, setValue];
}

/**
 * Create breadcrumbs array from path string - client-side version
 * Transforms &quot;/docs/admin/users&quot; into [{label: &quot;docs&quot;, path: &quot;/docs&quot;}, {label: &quot;admin&quot;, path: &quot;/docs/admin&quot;}, ...]
 */
export function createBreadcrumbsFromPath(path: string) {
  if (!path) return [];

  // Remove trailing slash if present
  const cleanPath = path.endsWith(&quot;/&quot;) ? path.slice(0, -1) : path;

  // Skip empty segments
  const segments = cleanPath.split(&quot;/&quot;).filter(Boolean);

  // Create breadcrumb items with accumulated paths
  return segments.map((segment, index) => {
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, &quot; &quot;);
    const path = &quot;/&quot; + segments.slice(0, index + 1).join(&quot;/&quot;);
    return { label, path };
  });
}

/**
 * Formats a date as a relative time string based on how recent it is
 * Client-only utility to avoid SSR date issues
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) return &quot;&quot;;

  const dateObj =
    typeof date === &quot;string&quot; || typeof date === &quot;number&quot;
      ? new Date(date)
      : date;

  // For invalid dates
  if (isNaN(dateObj.getTime())) {
    return &quot;Invalid date&quot;;
  }

  // For today, show relative time (e.g., &quot;2 hours ago&quot;)
  if (isToday(dateObj)) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  // For yesterday, show &quot;Yesterday at HH:MM AM/PM&quot;
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, &quot;h:mm a&quot;)}`;
  }

  // For the current year, show &quot;MMM D at h:mm a&quot; (e.g., &quot;Jan 5 at 3:30 PM&quot;)
  if (dateObj.getFullYear() === new Date().getFullYear()) {
    return format(dateObj, &quot;MMM d 'at' h:mm a&quot;);
  }

  // For other dates, show &quot;MMM D, YYYY&quot; (e.g., &quot;Jan 5, 2022&quot;)
  return format(dateObj, &quot;MMM d, yyyy");
}
