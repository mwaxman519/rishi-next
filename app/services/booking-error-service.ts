/**
 * Booking Error Service
 *
 * This service centralizes error handling for the booking microservice.
 * It provides standardized error handling, logging, and user-friendly error messages.
 *
 * Part of the event-driven architecture, this service can also emit error events
 * when critical booking errors occur that other systems might need to react to.
 */

import { eventBus } from &quot;../events/event-bus&quot;;

// Define standard booking error types for consistent handling
export enum BookingErrorType {
  VALIDATION_ERROR = &quot;VALIDATION_ERROR&quot;,
  LOCATION_ERROR = &quot;LOCATION_ERROR&quot;,
  SCHEDULING_ERROR = &quot;SCHEDULING_ERROR&quot;,
  RECURRENCE_ERROR = &quot;RECURRENCE_ERROR&quot;,
  AUTHORIZATION_ERROR = &quot;AUTHORIZATION_ERROR&quot;,
  PERSISTENCE_ERROR = &quot;PERSISTENCE_ERROR&quot;,
  INTEGRATION_ERROR = &quot;INTEGRATION_ERROR&quot;,
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
    this.name = &quot;BookingError&quot;;
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
      eventBus.publish(&quot;booking.error&quot;, {
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
    // If it&apos;s already a BookingError, just merge in any additional context
    if (error instanceof BookingError) {
      error.context = { ...error.context, ...contextOverrides };
      return error;
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return new BookingError(
        BookingErrorType.PERSISTENCE_ERROR,
        error.message,
        &quot;There was a problem processing your booking. Please try again.&quot;,
        {
          source: &quot;booking-service&quot;,
          details: { originalError: error.name },
          ...contextOverrides,
        },
      );
    }

    // Handle completely unknown errors
    const errorMessage =
      typeof error === &quot;string&quot; ? error : &quot;Unknown booking error occurred&quot;;
    return new BookingError(
      BookingErrorType.PERSISTENCE_ERROR,
      errorMessage,
      &quot;An unexpected error occurred with your booking. Our team has been notified.&quot;,
      {
        source: &quot;booking-service&quot;,
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
        return &quot;Please check your booking information and try again.&quot;;
      case BookingErrorType.LOCATION_ERROR:
        return &quot;There was a problem with the selected location. Please try another location.&quot;;
      case BookingErrorType.SCHEDULING_ERROR:
        return &quot;We couldn&apos;t schedule your booking for the requested time. Please try different date/time options.&quot;;
      case BookingErrorType.RECURRENCE_ERROR:
        return &quot;There was an issue with your recurring booking pattern. Please simplify or change your recurrence settings.&quot;;
      case BookingErrorType.AUTHORIZATION_ERROR:
        return &quot;You don&apos;t have permission to perform this booking action.&quot;;
      default:
        return &quot;There was a problem processing your booking. Please try again later.&quot;;
    }
  },
};

export default bookingErrorService;
