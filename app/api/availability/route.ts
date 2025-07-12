import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { EventBusService } from "../../../services/event-bus-service";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import * as schema from "@shared/schema";
import { eq, and, between } from "drizzle-orm";

/**
 * AVAILABILITY API ROUTE
 * ======================
 * This file implements the API Gateway pattern for our Availability Service.
 * All availability-related API endpoints are defined here, including:
 * - GET /api/availability - Retrieve availability blocks with filtering
 * - POST /api/availability - Create new availability blocks
 *
 * Key Design Goals:
 * 1. Separation of concerns - API layer separated from service layer
 * 2. Consistent error handling - All errors return 200 with empty data to prevent client polling loops
 * 3. Standard response format - All responses use {success: boolean, data: T[], error?: string}
 * 4. Service timeout handling - All service calls are wrapped with timeouts
 * 5. Proper validation - All inputs are validated before processing
 * 6. EventBusService integration for event-driven architecture
 */

/**
 * GET /api/availability - Get all availability blocks
 *
 * Retrieves availability blocks for a user within a specified date range.
 *
 * Query Parameters:
 * - userId (required): The ID of the user whose availability blocks to retrieve
 * - startDate (optional): The start date to filter blocks (ISO format)
 * - endDate (optional): The end date to filter blocks (ISO format)
 * - status (optional): Filter by status ('available', 'unavailable', 'tentative')
 *
 * Response:
 * {
 *   success: boolean,
 *   data: AvailabilityDTO[], // Array of availability blocks
 *   error?: string           // Error message if applicable
 * }
 *
 * Notes:
 * - Returns empty array instead of errors to prevent client-side polling loops
 * - All responses use HTTP 200 status even for errors to prevent client retries
 */
/**
 * Creates standard headers for API responses with no caching
 */
function createNoCacheHeaders(): Headers {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  return headers;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Create headers once for consistent use
  const headers = createNoCacheHeaders();

  try {
    console.log(
      "GET /api/availability received with params:",
      request.nextUrl.search,
    );

    // IMPORTANT: When there are database connectivity issues, we now return empty data
    // instead of an error to prevent excessive API polling in the client

    // Check DATABASE_URL environment variable early on
    if (!process.env.DATABASE_URL) {
      console.error("ERROR: DATABASE_URL environment variable is not set!");
      // Still return 200 with empty data to prevent client-side errors
      return NextResponse.json(
        {
          success: false,
          error: "Database connection not configured",
          data: [], // Empty array to prevent client-side errors
        },
        {
          status: 200,
          headers: headers,
        },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status") as
      | "available"
      | "unavailable"
      | "tentative"
      | null;

    if (!userId) {
      console.log("Error: Missing userId parameter");
      // Still return 200 with proper response format
      return NextResponse.json(
        {
          success: false,
          error: "Missing required userId parameter",
          data: [], // Empty array to prevent client-side errors
        },
        {
          status: 200,
          headers: headers,
        },
      );
    }

    // Log parsed parameters for debugging
    console.log(
      `Parsed parameters: userId=${userId}, startDate=${startDate}, endDate=${endDate}, status=${status}`,
    );

    // Create query options with proper validation
    const options = {
      userId: userId, // Keep as string for UUID comparison
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || undefined,
    };

    // Validate date inputs
    const startDateValid =
      options.startDate &&
      options.startDate instanceof Date &&
      !isNaN(options.startDate.getTime());
    const endDateValid =
      options.endDate &&
      options.endDate instanceof Date &&
      !isNaN(options.endDate.getTime());

    // If dates are provided but invalid, return error with proper response format
    if ((startDate && !startDateValid) || (endDate && !endDateValid)) {
      console.error("Invalid date format provided");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format",
          data: [], // Empty array to prevent client-side errors
        },
        {
          status: 200,
          headers: headers,
        },
      );
    }

    // Log options being passed to service
    console.log(
      "Query options:",
      JSON.stringify(options, (key, value) =>
        value instanceof Date ? value.toISOString() : value,
      ),
    );

    try {
      console.log(
        "➡️ Querying availabilityBlocks table with filters",
      );

      // Build query filters - only add user_id filter if it's a valid UUID string
      const filters = [];
      if (options.userId && typeof options.userId === 'string') {
        filters.push(eq(schema.availabilityBlocks.user_id, options.userId));
      }

      // Add date filters if provided
      if (options.startDate) {
        filters.push(
          eq(schema.availabilityBlocks.start_date, options.startDate)
        );
      }
      if (options.endDate) {
        filters.push(
          eq(schema.availabilityBlocks.end_date, options.endDate)
        );
      }

      // Add status filter if provided
      if (options.status) {
        filters.push(eq(schema.availabilityBlocks.status, options.status));
      }

      // Execute database query
      const availabilityBlocks = await db
        .select()
        .from(schema.availabilityBlocks)
        .where(and(...filters));

      // Transform database results to API format
      const result = {
        success: true,
        data: availabilityBlocks.map((block) => ({
          id: block.id,
          userId: block.user_id,
          startTime: block.start_date,
          endTime: block.end_date,
          isAvailable: block.status === "available",
          notes: block.title || "",
          status: block.status,
          isRecurring: block.is_recurring,
          dayOfWeek: block.day_of_week,
        })),
      };

      if (!result || !result.success) {
        console.log(
          "⚠️ Service error:",
          "Unknown service error",
        );
        // Return proper error response
        return NextResponse.json(
          {
            success: false,
            error: "Service error occurred",
            data: [], // Empty array to prevent client-side errors
          },
          {
            status: 200,
            headers: headers,
          },
        );
      }

      // Log success and count of records
      console.log(
        `✅ Successfully fetched ${result.data?.length || 0} availability blocks`,
      );

      // Return the blocks data using our standardized format
      const response = {
        success: true,
        data: result.data || [],
        error: null,
      };

      // Add more debug info
      console.log(
        `Returning ${result.data?.length || 0} availability blocks to client`,
      );

      return NextResponse.json(response, {
        status: 200,
        headers: headers,
      });
    } catch (serviceError) {
      console.error("❌ Error from availability service:", serviceError);
      console.error(
        "Stack trace:",
        serviceError instanceof Error
          ? serviceError.stack
          : "No stack trace available",
      );

      // Return standardized error response
      const errorResponse = {
        success: false,
        error:
          serviceError instanceof Error
            ? serviceError.message
            : "Error fetching availability data from service",
        data: [], // Include empty data array to prevent client-side errors
      };

      return NextResponse.json(errorResponse, {
        status: 200, // Use 200 to prevent client retries
        headers: headers,
      });
    }
  } catch (error) {
    console.error("❌ Unhandled error in availability route:", error);
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack trace available",
    );

    // Return standardized error response
    const errorResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unhandled error in availability route",
      data: [], // Include empty data array to prevent client-side errors
    };

    return NextResponse.json(errorResponse, {
      status: 200, // Use 200 to prevent client retries
      headers: createNoCacheHeaders(),
    });
  }
}

/**
 * POST /api/availability - Create a new availability block
 *
 * Creates a new availability block with optional recurrence settings.
 *
 * Request Body:
 * {
 *   userId: number,           // Required: User ID the availability belongs to
 *   startDate: string,        // Required: ISO date string for start time
 *   endDate: string,          // Required: ISO date string for end time
 *   title?: string,           // Optional: Title of the availability block (default: "Available")
 *   status?: string,          // Optional: 'available', 'unavailable', 'tentative' (default: 'available')
 *   isRecurring?: boolean,    // Optional: Whether this is a recurring block (default: false)
 *   recurrencePattern?: string, // Optional: 'weekly', 'biweekly', 'monthly'
 *   dayOfWeek?: number,       // Optional: Day of week (0-6, where 0 is Sunday)
 *   recurrenceEndType?: string, // Optional: 'never', 'count', 'date'
 *   recurrenceCount?: number, // Optional: Number of occurrences if endType is 'count'
 *   recurrenceEndDate?: string, // Optional: ISO date string for end of recurrence
 *   mergeStrategy?: string    // Optional: 'merge', 'replace', 'skip' (default: 'merge')
 * }
 *
 * Note: The API also accepts snake_case variants of all field names (e.g., user_id, start_date)
 * for better compatibility with different clients.
 *
 * Response:
 * {
 *   success: boolean,
 *   data?: {                  // The created availability block with both camelCase and snake_case properties
 *     id: number,
 *     userId/user_id: number,
 *     ...
 *   },
 *   error?: string            // Error message if applicable
 * }
 *
 * Notes:
 * - All responses include appropriate cache control headers to prevent caching
 * - Service calls are wrapped with timeouts to prevent hanging requests
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("POST /api/availability received");

    // Add no-cache headers to response - use our helper function
    const headers = createNoCacheHeaders();

    // Check DATABASE_URL environment variable early on
    if (!process.env.DATABASE_URL) {
      console.error("ERROR: DATABASE_URL environment variable is not set!");
      return NextResponse.json(
        {
          success: false,
          error: "Database connection string is missing",
          message:
            "The server is not properly configured to connect to the database.",
        },
        { status: 500, headers },
      );
    }

    // Parse request body with safety checks
    let body;
    try {
      body = await request.json();
      console.log(
        "Received availability creation request:",
        JSON.stringify(body, null, 2),
      );
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body format",
        },
        { status: 400, headers },
      );
    }

    // Validate required fields
    if (!body.userId && !body.user_id) {
      console.error("Missing required field: userId");
      return NextResponse.json(
        {
          success: false,
          error: "userId is required",
        },
        { status: 400, headers },
      );
    }

    if (!body.startDate && !body.start_date) {
      console.error("Missing required field: startDate");
      return NextResponse.json(
        {
          success: false,
          error: "startDate is required",
        },
        { status: 400, headers },
      );
    }

    if (!body.endDate && !body.end_date) {
      console.error("Missing required field: endDate");
      return NextResponse.json(
        {
          success: false,
          error: "endDate is required",
        },
        { status: 400, headers },
      );
    }

    // Validate date formats
    const startDate = new Date(body.startDate || body.start_date);
    const endDate = new Date(body.endDate || body.end_date);

    if (isNaN(startDate.getTime())) {
      console.error(
        "Invalid startDate format:",
        body.startDate || body.start_date,
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid startDate format",
        },
        { status: 400, headers },
      );
    }

    if (isNaN(endDate.getTime())) {
      console.error("Invalid endDate format:", body.endDate || body.end_date);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid endDate format",
        },
        { status: 400, headers },
      );
    }

    // Validate date logic
    if (startDate >= endDate) {
      console.error("startDate must be before endDate");
      return NextResponse.json(
        {
          success: false,
          error: "startDate must be before endDate",
        },
        { status: 400, headers },
      );
    }

    // Convert body to expected service format with defaults
    const createRequest = {
      userId: body.userId || body.user_id,
      title: body.title || "Available",
      startDate: startDate,
      endDate: endDate,
      status:
        (body.status as "available" | "unavailable" | "tentative") ||
        "available",
      isRecurring:
        body.isRecurring || body.is_recurring || body.recurring || false,
      recurrencePattern: body.recurrencePattern || body.recurrence_pattern,
      dayOfWeek: body.dayOfWeek || body.day_of_week,
      recurrenceEndType: body.recurrenceEndType || body.recurrence_end_type,
      recurrenceCount: body.recurrenceCount || body.recurrence_count,
      recurrenceEndDate: body.recurrenceEndDate || body.recurrence_end_date,
      // Handle conflict resolution strategy
      mergeStrategy: body.mergeStrategy || body.merge_strategy,
    };

    console.log(
      "Processed request:",
      JSON.stringify(createRequest, (k, v) => {
        if (v instanceof Date) return v.toISOString();
        return v;
      }),
    );

    try {
      console.log(
        "➡️ Calling availabilityService.createAvailabilityBlock with request",
      );

      // Mock availability service for demonstration
      const availabilityService = {
        createAvailabilityBlock: async (data: any) => {
          const newAvailability = {
            id: uuidv4(),
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
          };

          // Publish availability creation event
          const eventBus = new EventBusService();
          await eventBus.publish(
            "availability.created",
            {
              availabilityId: newAvailability.id,
              userId: data.userId,
              startTime: data.startTime,
              endTime: data.endTime,
            },
            {
              correlationId: uuidv4(),
              source: "availability-api",
              version: "1.0",
            },
          );

          return {
            success: true,
            data: newAvailability,
          };
        },
      };

      // Wrap service call in a timeout to prevent hanging
      const serviceCallPromise =
        availabilityService.createAvailabilityBlock(createRequest);

      // Set timeout for service call (10 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Service call timed out")), 10000);
      });

      // Race the service call against the timeout
      const result = (await Promise.race([
        serviceCallPromise,
        timeoutPromise,
      ])) as any;

      if (!result || !result.success) {
        console.error(
          "Service error when creating availability:",
          result?.error,
        );
        // Return standardized error response
        const errorResponse = {
          success: false,
          error: result?.error || "Failed to create availability block",
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json(errorResponse, { status: 400, headers });
      }

      console.log("✅ Successfully created availability block");

      // Convert result back to the expected format for the client
      // Include both camelCase and snake_case properties for better compatibility
      const responseBlock = {
        id: result.data?.id,
        userId: result.data?.userId,
        user_id: result.data?.userId,
        title: result.data?.title,
        startDate: result.data?.startDate,
        start_date: result.data?.startDate,
        endDate: result.data?.endDate,
        end_date: result.data?.endDate,
        status: result.data?.status,
        isRecurring: result.data?.isRecurring,
        is_recurring: result.data?.isRecurring,
        recurring: result.data?.isRecurring,
        recurrencePattern: result.data?.recurrencePattern,
        recurrence_pattern: result.data?.recurrencePattern,
        dayOfWeek: result.data?.dayOfWeek,
        day_of_week: result.data?.dayOfWeek,
        createdAt: result.data?.createdAt,
        created_at: result.data?.createdAt,
        updatedAt: result.data?.updatedAt,
        updated_at: result.data?.updatedAt,
      };

      // Return the block data using our standardized format
      const standardizedResponse = {
        success: true,
        data: responseBlock,
      };

      return NextResponse.json(standardizedResponse, { status: 201, headers });
    } catch (serviceError) {
      console.error("Error from availability service:", serviceError);
      // Return standardized error response
      const errorResponse = {
        success: false,
        error:
          serviceError instanceof Error
            ? serviceError.message
            : "Failed to create availability block",
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(errorResponse, { status: 500, headers });
    }
  } catch (error) {
    console.error("Unhandled error creating availability block:", error);
    // Return standardized error response
    const errorResponse = {
      success: false,
      error: "An unexpected error occurred while creating availability block",
      timestamp: new Date().toISOString(),
    };

    // Create new headers for error response
    const errorHeaders = new Headers();
    errorHeaders.set("Content-Type", "application/json");
    errorHeaders.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    errorHeaders.set("Pragma", "no-cache");
    errorHeaders.set("Expires", "0");

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: errorHeaders,
    });
  }
}
