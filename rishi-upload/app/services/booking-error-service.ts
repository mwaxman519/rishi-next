/**
 * Booking Error Service
 *
 * This service centralizes error handling for the booking microservice.
 * It provides standardized error handling, logging, and user-friendly error messages.
 *
 * Part of the event-driven architecture, this service can also emit error events
 * when critical booking errors occur that other systems might need to react to.
 */

import { eventBus } from "../events/event-bus";

// Define standard booking error types for consistent handling
export enum BookingErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  LOCATION_ERROR = "LOCATION_ERROR",
  SCHEDULING_ERROR = "SCHEDULING_ERROR",
  RECURRENCE_ERROR = "RECURRENCE_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  PERSISTENCE_ERROR = "PERSISTENCE_ERROR",
  INTEGRATION_ERROR = "INTEGRATION_ERROR",
}

// Error context structure for detailed error reporting
export interface BookingErrorContext {
  userId?: string;
  bookingId?: string;
  locationId?: string;
  source: string;
  details?: Record<string, unknown>;
}

// Standard booking error with proper typing and context
export class BookingError extends Error {
  type: BookingErrorType;
  context: BookingErrorContext;
  userMessage: string;

  constructor(
    type: BookingErrorType,
    message: string,
    userMessage: string,
    context: BookingErrorContext,
  ) {
    super(message);
    this.name = "BookingError";
    this.type = type;
    this.context = context;
    this.userMessage = userMessage;
  }
}

/**
 * Handle booking errors consistently across the application
 * This includes:
 * - Logging the error with proper context
 * - Emitting error events when appropriate
 * - Returning user-friendly error messages
 * - Tracking error patterns for monitoring
 */
export const bookingErrorService = {
  /**
   * Handle a booking error with proper logging and event emission
   */
  handleError(
    error: unknown,
    context: Partial<BookingErrorContext> = {},
  ): BookingError {
    // Convert unknown errors to BookingError format
    const bookingError = this.normalizeError(error, context);

    // Log the error with full context
    console.error(
      `[BookingError][${bookingError.type}] ${bookingError.message}`,
      {
        context: bookingError.context,
        stack: bookingError.stack,
      },
    );

    // Emit error event for critical errors that other systems need to know about
    if (this.shouldEmitErrorEvent(bookingError)) {
      eventBus.publish("booking.error", {
        type: bookingError.type,
        message: bookingError.message,
        bookingId: bookingError.context.bookingId,
        timestamp: new Date().toISOString(),
      });
    }

    return bookingError;
  },

  /**
   * Create a standardized booking error
   */
  createError(
    type: BookingErrorType,
    message: string,
    userMessage: string,
    context: BookingErrorContext,
  ): BookingError {
    return new BookingError(type, message, userMessage, context);
  },

  /**
   * Normalize an unknown error into a BookingError
   */
  normalizeError(
    error: unknown,
    contextOverrides: Partial<BookingErrorContext> = {},
  ): BookingError {
    // If it's already a BookingError, just merge in any additional context
    if (error instanceof BookingError) {
      error.context = { ...error.context, ...contextOverrides };
      return error;
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return new BookingError(
        BookingErrorType.PERSISTENCE_ERROR,
        error.message,
        "There was a problem processing your booking. Please try again.",
        {
          source: "booking-service",
          details: { originalError: error.name },
          ...contextOverrides,
        },
      );
    }

    // Handle completely unknown errors
    const errorMessage =
      typeof error === "string" ? error : "Unknown booking error occurred";
    return new BookingError(
      BookingErrorType.PERSISTENCE_ERROR,
      errorMessage,
      "An unexpected error occurred with your booking. Our team has been notified.",
      {
        source: "booking-service",
        details: { originalError: error },
        ...contextOverrides,
      },
    );
  },

  /**
   * Determine if an error should trigger an event
   */
  shouldEmitErrorEvent(error: BookingError): boolean {
    // Emit events for critical errors or errors that affect other systems
    const criticalErrorTypes = [
      BookingErrorType.PERSISTENCE_ERROR,
      BookingErrorType.INTEGRATION_ERROR,
      BookingErrorType.LOCATION_ERROR,
    ];

    return criticalErrorTypes.includes(error.type);
  },

  /**
   * Get a user-friendly error message based on the error type
   */
  getUserMessage(error: BookingError): string {
    // If error already has a user message, use it
    if (error.userMessage) {
      return error.userMessage;
    }

    // Otherwise generate a default user message based on type
    switch (error.type) {
      case BookingErrorType.VALIDATION_ERROR:
        return "Please check your booking information and try again.";
      case BookingErrorType.LOCATION_ERROR:
        return "There was a problem with the selected location. Please try another location.";
      case BookingErrorType.SCHEDULING_ERROR:
        return "We couldn't schedule your booking for the requested time. Please try different date/time options.";
      case BookingErrorType.RECURRENCE_ERROR:
        return "There was an issue with your recurring booking pattern. Please simplify or change your recurrence settings.";
      case BookingErrorType.AUTHORIZATION_ERROR:
        return "You don't have permission to perform this booking action.";
      default:
        return "There was a problem processing your booking. Please try again later.";
    }
  },
};

export default bookingErrorService;
