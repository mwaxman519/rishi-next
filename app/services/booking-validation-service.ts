/**
 * Booking Validation Service
 *
 * This service provides centralized validation logic for booking forms
 * and API payloads. It leverages Zod schemas for validation and
 * ensures consistent error messages across the application.
 *
 * The validation service integrates with our event-driven architecture
 * by publishing validation error events that can be subscribed to by
 * other components.
 */

import { z } from &quot;zod&quot;;
import { startOfDay, parse, isAfter, isBefore, addHours } from &quot;date-fns&quot;;
import { bookingEvents } from &quot;../events/booking-events&quot;;
import { BookingErrorType, bookingErrorService } from &quot;./booking-error-service&quot;;
import { RecurrenceFrequency } from &quot;./recurrence-engine&quot;;

// Base schema for booking validation
export const bookingSchema = z.object({
  title: z
    .string()
    .min(5, &quot;Title must be at least 5 characters&quot;)
    .max(100, &quot;Title cannot exceed 100 characters&quot;),
  clientId: z.string().uuid(&quot;Valid client ID is required&quot;),
  date: z.date({
    required_error: &quot;Date is required&quot;,
  }),
  startTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      &quot;Start time must be in 24-hour format (HH:MM)&quot;,
    ),
  endTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      &quot;End time must be in 24-hour format (HH:MM)&quot;,
    ),
  timezone: z.string().min(1, &quot;Timezone is required&quot;),
  locationId: z.string().uuid(&quot;Valid location ID is required&quot;),
  activityType: z.string().min(1, &quot;Activity type is required&quot;),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  attendeeCount: z
    .number()
    .min(1, &quot;At least one attendee is required&quot;)
    .optional(),
});

// Extended schema for recurring bookings
export const recurringBookingSchema = bookingSchema.extend({
  recurringFrequency: z
    .nativeEnum(RecurrenceFrequency, {
      errorMap: () => ({ message: &quot;Please select a valid frequency&quot; }),
    })
    .optional(),
  recurringCount: z
    .number()
    .min(2, &quot;Must have at least 2 occurrences&quot;)
    .max(52, &quot;Maximum 52 occurrences allowed&quot;)
    .optional(),
  recurringExceptions: z.array(z.date()).optional(),
});

// Validation for booking form values
export const bookingFormSchema = recurringBookingSchema
  .refine(
    (data) => {
      // Skip time validation if date, start time or end time is missing
      if (!data.date || !data.startTime || !data.endTime) return true;

      // Parse times to compare
      const startDateTime = parse(data.startTime, &quot;HH:mm&quot;, data.date);
      const endDateTime = parse(data.endTime, &quot;HH:mm&quot;, data.date);

      return isAfter(endDateTime, startDateTime);
    },
    {
      message: &quot;End time must be after start time&quot;,
      path: [&quot;endTime&quot;],
    },
  )
  .refine(
    (data) => {
      // For recurring bookings, required fields must be provided
      if (data.isRecurring) {
        return (
          data.recurringFrequency !== undefined &&
          data.recurringCount !== undefined
        );
      }
      return true;
    },
    {
      message:
        &quot;Recurring frequency and count are required for recurring bookings&quot;,
      path: [&quot;recurringFrequency&quot;],
    },
  );

/**
 * The booking validation service handles all validation operations
 * for booking forms and API requests.
 */
export const bookingValidationService = {
  /**
   * Validate booking form data using the bookingFormSchema
   * Returns the validated data or throws a validation error
   */
  validateBookingForm(formData: unknown) {
    try {
      const validatedData = bookingFormSchema.parse(formData);
      return {
        success: true,
        data: validatedData,
        errors: null,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format error messages into a more user-friendly structure
        const formattedErrors = error.errors.reduce(
          (acc, err) => {
            const path = err.path.join(&quot;.&quot;);
            acc[path] = err.message;
            return acc;
          },
          {} as Record<string, string>,
        );

        // Log the validation error
        bookingErrorService.handleError(error, {
          source: &quot;booking-validation-service&quot;,
          details: { formErrors: formattedErrors },
        });

        // Emit validation error event
        bookingEvents.publishError({
          type: BookingErrorType.VALIDATION_ERROR,
          message: &quot;Booking form validation failed&quot;,
          timestamp: new Date().toISOString(),
        });

        return {
          success: false,
          data: null,
          errors: formattedErrors,
        };
      }

      // Handle unexpected errors
      const bookingError = bookingErrorService.handleError(error, {
        source: &quot;booking-validation-service&quot;,
      });

      return {
        success: false,
        data: null,
        errors: { _form: bookingError.userMessage },
      };
    }
  },

  /**
   * Validate API request body for booking creation
   * Returns the validated data or throws a validation error
   */
  validateBookingApiRequest(requestBody: unknown) {
    try {
      const validatedData = bookingSchema.parse(requestBody);
      return {
        success: true,
        data: validatedData,
        errors: null,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format API error response
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join(&quot;.&quot;),
          message: err.message,
        }));

        // Log the validation error
        bookingErrorService.handleError(error, {
          source: &quot;booking-validation-service.api&quot;,
          details: { apiErrors: formattedErrors },
        });

        return {
          success: false,
          data: null,
          errors: formattedErrors,
        };
      }

      // Handle unexpected errors
      const bookingError = bookingErrorService.handleError(error, {
        source: &quot;booking-validation-service.api&quot;,
      });

      return {
        success: false,
        data: null,
        errors: [{ path: &quot;_error&quot;, message: bookingError.userMessage }],
      };
    }
  },

  /**
   * Validate date range booking time constraints
   * Used for checking availability and preventing conflicts
   */
  validateTimeConstraints(date: Date, startTime: string, endTime: string) {
    try {
      // Basic format validation
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
        return {
          success: false,
          error: &quot;Invalid start time format. Use HH:MM (24-hour format)&quot;,
        };
      }

      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
        return {
          success: false,
          error: &quot;Invalid end time format. Use HH:MM (24-hour format)&quot;,
        };
      }

      // Parse times to compare
      const baseDate = startOfDay(date);
      const startDateTime = parse(startTime, &quot;HH:mm&quot;, baseDate);
      const endDateTime = parse(endTime, &quot;HH:mm&quot;, baseDate);

      // End time must be after start time
      if (!isAfter(endDateTime, startDateTime)) {
        return {
          success: false,
          error: &quot;End time must be after start time&quot;,
        };
      }

      // Validate business constraints

      // Minimum booking duration (1 hour)
      const minimumDuration = addHours(startDateTime, 1);
      if (isBefore(endDateTime, minimumDuration)) {
        return {
          success: false,
          error: &quot;Booking must be at least 1 hour in duration&quot;,
        };
      }

      // Maximum booking duration (12 hours)
      const maximumDuration = addHours(startDateTime, 12);
      if (isAfter(endDateTime, maximumDuration)) {
        return {
          success: false,
          error: &quot;Booking cannot exceed 12 hours in duration&quot;,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      // Handle unexpected errors
      const bookingError = bookingErrorService.handleError(error, {
        source: &quot;booking-validation-service.timeConstraints&quot;,
      });

      return {
        success: false,
        error: bookingError.userMessage,
      };
    }
  },
};

export default bookingValidationService;
