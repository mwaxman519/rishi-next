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

import { z } from "zod";
import { startOfDay, parse, isAfter, isBefore, addHours } from "date-fns";
import { bookingEvents } from "../events/booking-events";
import { BookingErrorType, bookingErrorService } from "./booking-error-service";
import { RecurrenceFrequency } from "./recurrence-engine";

// Base schema for booking validation
export const bookingSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  clientId: z.string().uuid("Valid client ID is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Start time must be in 24-hour format (HH:MM)",
    ),
  endTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "End time must be in 24-hour format (HH:MM)",
    ),
  timezone: z.string().min(1, "Timezone is required"),
  locationId: z.string().uuid("Valid location ID is required"),
  activityType: z.string().min(1, "Activity type is required"),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  attendeeCount: z
    .number()
    .min(1, "At least one attendee is required")
    .optional(),
});

// Extended schema for recurring bookings
export const recurringBookingSchema = bookingSchema.extend({
  recurringFrequency: z
    .nativeEnum(RecurrenceFrequency, {
      errorMap: () => ({ message: "Please select a valid frequency" }),
    })
    .optional(),
  recurringCount: z
    .number()
    .min(2, "Must have at least 2 occurrences")
    .max(52, "Maximum 52 occurrences allowed")
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
      const startDateTime = parse(data.startTime, "HH:mm", data.date);
      const endDateTime = parse(data.endTime, "HH:mm", data.date);

      return isAfter(endDateTime, startDateTime);
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
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
        "Recurring frequency and count are required for recurring bookings",
      path: ["recurringFrequency"],
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
            const path = err.path.join(".");
            acc[path] = err.message;
            return acc;
          },
          {} as Record<string, string>,
        );

        // Log the validation error
        bookingErrorService.handleError(error, {
          source: "booking-validation-service",
          details: { formErrors: formattedErrors },
        });

        // Emit validation error event
        bookingEvents.publishError({
          type: BookingErrorType.VALIDATION_ERROR,
          message: "Booking form validation failed",
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
        source: "booking-validation-service",
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
          path: err.path.join("."),
          message: err.message,
        }));

        // Log the validation error
        bookingErrorService.handleError(error, {
          source: "booking-validation-service.api",
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
        source: "booking-validation-service.api",
      });

      return {
        success: false,
        data: null,
        errors: [{ path: "_error", message: bookingError.userMessage }],
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
          error: "Invalid start time format. Use HH:MM (24-hour format)",
        };
      }

      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
        return {
          success: false,
          error: "Invalid end time format. Use HH:MM (24-hour format)",
        };
      }

      // Parse times to compare
      const baseDate = startOfDay(date);
      const startDateTime = parse(startTime, "HH:mm", baseDate);
      const endDateTime = parse(endTime, "HH:mm", baseDate);

      // End time must be after start time
      if (!isAfter(endDateTime, startDateTime)) {
        return {
          success: false,
          error: "End time must be after start time",
        };
      }

      // Validate business constraints

      // Minimum booking duration (1 hour)
      const minimumDuration = addHours(startDateTime, 1);
      if (isBefore(endDateTime, minimumDuration)) {
        return {
          success: false,
          error: "Booking must be at least 1 hour in duration",
        };
      }

      // Maximum booking duration (12 hours)
      const maximumDuration = addHours(startDateTime, 12);
      if (isAfter(endDateTime, maximumDuration)) {
        return {
          success: false,
          error: "Booking cannot exceed 12 hours in duration",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      // Handle unexpected errors
      const bookingError = bookingErrorService.handleError(error, {
        source: "booking-validation-service.timeConstraints",
      });

      return {
        success: false,
        error: bookingError.userMessage,
      };
    }
  },
};

export default bookingValidationService;
