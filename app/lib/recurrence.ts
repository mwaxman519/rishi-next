import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  format,
  parse,
  isValid,
} from &quot;date-fns&quot;;

/**
 * Recurrence frequency types
 */
export enum RecurrenceFrequency {
  DAILY = &quot;DAILY&quot;,
  WEEKLY = &quot;WEEKLY&quot;,
  MONTHLY = &quot;MONTHLY&quot;,
  YEARLY = &quot;YEARLY&quot;,
}

/**
 * Days of the week for weekly recurrence
 */
export enum RecurrenceDays {
  SU = &quot;SU&quot;,
  MO = &quot;MO&quot;,
  TU = &quot;TU&quot;,
  WE = &quot;WE&quot;,
  TH = &quot;TH&quot;,
  FR = &quot;FR&quot;,
  SA = &quot;SA&quot;,
}

/**
 * Interface representing a recurrence pattern
 */
export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;
  byday?: RecurrenceDays[];
  count?: number;
  until?: Date;
}

/**
 * Parse a recurrence pattern string into a RecurrencePattern object
 * @param pattern - The recurrence pattern string in iCalendar format (e.g., &quot;FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR&quot;)
 * @returns RecurrencePattern object or null if invalid
 */
export function parseRecurrencePattern(
  pattern: string,
): RecurrencePattern | null {
  if (!pattern) return null;

  try {
    const parts = pattern.split(&quot;;&quot;);
    const result: any = {
      interval: 1, // Default interval
    };

    for (const part of parts) {
      const [key, value] = part.split(&quot;=&quot;);

      switch (key) {
        case &quot;FREQ&quot;:
          if (
            Object.values(RecurrenceFrequency).includes(
              value as RecurrenceFrequency,
            )
          ) {
            result.frequency = value as RecurrenceFrequency;
          } else {
            throw new Error(`Invalid frequency: ${value}`);
          }
          break;

        case &quot;INTERVAL&quot;:
          const interval = parseInt(value, 10);
          if (isNaN(interval) || interval < 1) {
            throw new Error(`Invalid interval: ${value}`);
          }
          result.interval = interval;
          break;

        case &quot;BYDAY&quot;:
          const days = value.split(&quot;,&quot;);
          const validDays = days.filter((day) =>
            Object.values(RecurrenceDays).includes(day as RecurrenceDays),
          );

          if (validDays.length === 0) {
            throw new Error(`Invalid days: ${value}`);
          }

          result.byday = validDays as RecurrenceDays[];
          break;

        case &quot;COUNT&quot;:
          const count = parseInt(value, 10);
          if (isNaN(count) || count < 1) {
            throw new Error(`Invalid count: ${value}`);
          }
          result.count = count;
          break;

        case &quot;UNTIL&quot;:
          // Format: YYYYMMDD
          const dateStr = value;
          if (dateStr.length !== 8) {
            throw new Error(`Invalid until date format: ${value}`);
          }

          const year = parseInt(dateStr.substring(0, 4), 10);
          const month = parseInt(dateStr.substring(4, 6), 10) - 1; // 0-based
          const day = parseInt(dateStr.substring(6, 8), 10);

          const date = new Date(year, month, day);

          if (!isValid(date)) {
            throw new Error(`Invalid until date: ${value}`);
          }

          result.until = date;
          break;
      }
    }

    // Frequency is required
    if (!result.frequency) {
      throw new Error(&quot;Missing frequency in recurrence pattern&quot;);
    }

    return result as RecurrencePattern;
  } catch (error) {
    console.error(`Error parsing recurrence pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Format a RecurrencePattern object to a recurrence pattern string
 * @param pattern - The RecurrencePattern object
 * @returns Recurrence pattern string in iCalendar format
 */
export function formatRecurrencePattern(pattern: RecurrencePattern): string {
  if (!pattern.frequency) {
    throw new Error(&quot;Frequency is required for recurrence pattern&quot;);
  }

  let result = `FREQ=${pattern.frequency}`;

  if (pattern.interval && pattern.interval > 1) {
    result += `;INTERVAL=${pattern.interval}`;
  }

  if (pattern.byday && pattern.byday.length > 0) {
    result += `;BYDAY=${pattern.byday.join(&quot;,&quot;)}`;
  }

  if (pattern.count && pattern.count > 0) {
    result += `;COUNT=${pattern.count}`;
  }

  if (pattern.until) {
    const dateStr = format(pattern.until, &quot;yyyyMMdd&quot;);
    result += `;UNTIL=${dateStr}`;
  }

  return result;
}

/**
 * Generate occurrence dates based on a recurrence pattern
 * @param startDate - The start date of the first occurrence
 * @param pattern - The RecurrencePattern object or string pattern
 * @param endDate - Optional end date to limit occurrences
 * @returns Array of occurrence dates
 */
export function generateOccurrences(
  startDate: Date,
  pattern: RecurrencePattern | string,
  endDate?: Date,
): Date[] {
  const recurrencePattern =
    typeof pattern === &quot;string&quot; ? parseRecurrencePattern(pattern) : pattern;

  if (!recurrencePattern) {
    return [startDate]; // Return just the start date if pattern is invalid
  }

  const occurrences: Date[] = [];
  const { frequency, interval, byday, count, until } = recurrencePattern;

  // Determine end condition
  const limitDate = until || endDate;
  const maxOccurrences = count || 100; // Safety limit

  let currentDate = new Date(startDate);
  occurrences.push(new Date(currentDate)); // Add first occurrence

  // For weekly recurrence with specific days
  if (frequency === RecurrenceFrequency.WEEKLY && byday && byday.length > 0) {
    // Map days of week from RecurrenceDays to JS day numbers (0-6)
    const dayMap: Record<RecurrenceDays, number> = {
      [RecurrenceDays.SU]: 0,
      [RecurrenceDays.MO]: 1,
      [RecurrenceDays.TU]: 2,
      [RecurrenceDays.WE]: 3,
      [RecurrenceDays.TH]: 4,
      [RecurrenceDays.FR]: 5,
      [RecurrenceDays.SA]: 6,
    };

    const firstDayOfWeek = currentDate.getDay();
    const selectedDays = byday.map((day) => dayMap[day]).sort((a, b) => a - b);

    // Generate occurrences up to count or until date
    let weekCounter = 0;
    let totalOccurrences = 1; // Start with 1 for the first occurrence

    while (totalOccurrences < maxOccurrences) {
      // Determine if we need to move to the next week
      const isNewWeek = weekCounter > 0;

      // If moving to a new week, adjust for the interval
      if (isNewWeek && weekCounter % interval === 0) {
        for (const dayOfWeek of selectedDays) {
          // Calculate days to add to start of week
          const daysToAdd = dayOfWeek;

          // Create the date for this occurrence
          const occurrenceDate = addDays(
            addWeeks(startDate, weekCounter),
            daysToAdd - firstDayOfWeek,
          );

          // Check if we've hit the end date
          if (limitDate && occurrenceDate > limitDate) {
            return occurrences;
          }

          // Add occurrence if it&apos;s after the start date
          if (occurrenceDate > startDate) {
            occurrences.push(new Date(occurrenceDate));
            totalOccurrences++;

            // Check if we've reached the count limit
            if (count && totalOccurrences >= count) {
              return occurrences;
            }
          }
        }
      }

      weekCounter++;

      // Safety break for infinite loops
      if (weekCounter > 520) {
        // 10 years of weeks
        break;
      }
    }

    return occurrences;
  }

  // For other recurrence types (daily, monthly, yearly)
  for (let i = 1; i < maxOccurrences; i++) {
    switch (frequency) {
      case RecurrenceFrequency.DAILY:
        currentDate = addDays(startDate, i * interval);
        break;
      case RecurrenceFrequency.WEEKLY:
        currentDate = addWeeks(startDate, i * interval);
        break;
      case RecurrenceFrequency.MONTHLY:
        currentDate = addMonths(startDate, i * interval);
        break;
      case RecurrenceFrequency.YEARLY:
        currentDate = addYears(startDate, i * interval);
        break;
    }

    // Check if we've hit the end date
    if (limitDate && currentDate > limitDate) {
      break;
    }

    occurrences.push(new Date(currentDate));

    // Check if we've reached the count limit
    if (count && occurrences.length >= count) {
      break;
    }
  }

  return occurrences;
}

/**
 * Get a user-friendly description of a recurrence pattern
 * @param pattern - The RecurrencePattern object or string pattern
 * @returns Human-readable description of the recurrence pattern
 */
export function getRecurrenceDescription(
  pattern: RecurrencePattern | string,
): string {
  const recurrencePattern =
    typeof pattern === &quot;string&quot; ? parseRecurrencePattern(pattern) : pattern;

  if (!recurrencePattern) {
    return &quot;One-time event&quot;;
  }

  const { frequency, interval, byday, count, until } = recurrencePattern;

  let base = "&quot;;

  // Frequency and interval
  switch (frequency) {
    case RecurrenceFrequency.DAILY:
      base = interval === 1 ? &quot;Daily&quot; : `Every ${interval} days`;
      break;
    case RecurrenceFrequency.WEEKLY:
      base = interval === 1 ? &quot;Weekly&quot; : `Every ${interval} weeks`;

      // Add days for weekly recurrence
      if (byday && byday.length > 0) {
        const dayNames: Record<RecurrenceDays, string> = {
          [RecurrenceDays.SU]: &quot;Sunday&quot;,
          [RecurrenceDays.MO]: &quot;Monday&quot;,
          [RecurrenceDays.TU]: &quot;Tuesday&quot;,
          [RecurrenceDays.WE]: &quot;Wednesday&quot;,
          [RecurrenceDays.TH]: &quot;Thursday&quot;,
          [RecurrenceDays.FR]: &quot;Friday&quot;,
          [RecurrenceDays.SA]: &quot;Saturday&quot;,
        };

        const daysList = byday.map((day) => dayNames[day]).join(&quot;, &quot;);
        base += ` on ${daysList}`;
      }
      break;
    case RecurrenceFrequency.MONTHLY:
      base = interval === 1 ? &quot;Monthly&quot; : `Every ${interval} months`;
      break;
    case RecurrenceFrequency.YEARLY:
      base = interval === 1 ? &quot;Yearly&quot; : `Every ${interval} years`;
      break;
  }

  // End condition
  let endCondition = &quot;&quot;;

  if (count) {
    endCondition = `, ${count} times`;
  } else if (until) {
    endCondition = `, until ${format(until, &quot;MMM d, yyyy")}`;
  }

  return `${base}${endCondition}`;
}
