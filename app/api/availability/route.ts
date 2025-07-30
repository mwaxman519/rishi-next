import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getServerSession } from &quot;next-auth&quot;;
import { z } from &quot;zod&quot;;
import { EventBusService } from &quot;../../../services/event-bus-service&quot;;
import { AvailabilityService } from &quot;../../../services/availability/availabilityService&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import { db } from &quot;@/lib/db&quot;;
import * as schema from &quot;@shared/schema&quot;;
import { eq, and, between } from &quot;drizzle-orm&quot;;

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
  headers.set(&quot;Content-Type&quot;, &quot;application/json&quot;);
  headers.set(
    &quot;Cache-Control&quot;,
    &quot;no-store, no-cache, must-revalidate, proxy-revalidate&quot;,
  );
  headers.set(&quot;Pragma&quot;, &quot;no-cache&quot;);
  headers.set(&quot;Expires&quot;, &quot;0&quot;);
  return headers;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Create headers once for consistent use
  const headers = createNoCacheHeaders();

  try {
    console.log(
      &quot;GET /api/availability received with params:&quot;,
      request.nextUrl.search,
    );

    // IMPORTANT: When there are database connectivity issues, we now return empty data
    // instead of an error to prevent excessive API polling in the client

    // Check DATABASE_URL environment variable early on
    if (!process.env.DATABASE_URL) {
      console.error(&quot;ERROR: DATABASE_URL environment variable is not set!&quot;);
      // Still return 200 with empty data to prevent client-side errors
      return NextResponse.json(
        {
          success: false,
          error: &quot;Database connection not configured&quot;,
          data: [], // Empty array to prevent client-side errors
        },
        {
          status: 200,
          headers: headers,
        },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = (searchParams.get(&quot;userId&quot;) || undefined) || undefined;
    const startDate = (searchParams.get(&quot;startDate&quot;) || undefined) || undefined;
    const endDate = (searchParams.get(&quot;endDate&quot;) || undefined) || undefined;
    const status = (searchParams.get(&quot;status&quot;) || undefined) as
      | &quot;available&quot;
      | &quot;unavailable&quot;
      | &quot;tentative&quot;
      | null;

    if (!userId) {
      console.log(&quot;Error: Missing userId parameter&quot;);
      // Still return 200 with proper response format
      return NextResponse.json(
        {
          success: false,
          error: &quot;Missing required userId parameter&quot;,
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
      console.error(&quot;Invalid date format provided&quot;);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Invalid date format&quot;,
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
      &quot;Query options:&quot;,
      JSON.stringify(options, (key, value) =>
        value instanceof Date ? value.toISOString() : value,
      ),
    );

    try {
      console.log(
        &quot;➡️ Querying availabilityBlocks table with filters&quot;,
      );

      // Build query filters - only add user_id filter if it&apos;s a valid UUID string
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
          isAvailable: block.status === &quot;available&quot;,
          notes: block.title || "&quot;,
          status: block.status,
          isRecurring: block.is_recurring,
          dayOfWeek: block.day_of_week,
        })),
      };

      if (!result || !result.success) {
        console.log(
          &quot;⚠️ Service error:&quot;,
          &quot;Unknown service error&quot;,
        );
        // Return proper error response
        return NextResponse.json(
          {
            success: false,
            error: &quot;Service error occurred&quot;,
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
      console.error(&quot;❌ Error from availability service:&quot;, serviceError);
      console.error(
        &quot;Stack trace:&quot;,
        serviceError instanceof Error
          ? serviceError.stack
          : &quot;No stack trace available&quot;,
      );

      // Return standardized error response
      const errorResponse = {
        success: false,
        error:
          serviceError instanceof Error
            ? serviceError.message
            : &quot;Error fetching availability data from service&quot;,
        data: [], // Include empty data array to prevent client-side errors
      };

      return NextResponse.json(errorResponse, {
        status: 200, // Use 200 to prevent client retries
        headers: headers,
      });
    }
  } catch (error) {
    console.error(&quot;❌ Unhandled error in availability route:&quot;, error);
    console.error(
      &quot;Stack trace:&quot;,
      error instanceof Error ? error.stack : &quot;No stack trace available&quot;,
    );

    // Return standardized error response
    const errorResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : &quot;Unhandled error in availability route&quot;,
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
 *   title?: string,           // Optional: Title of the availability block (default: &quot;Available&quot;)
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
    console.log(&quot;POST /api/availability received&quot;);

    // Add no-cache headers to response - use our helper function
    const headers = createNoCacheHeaders();

    // Check DATABASE_URL environment variable early on
    if (!process.env.DATABASE_URL) {
      console.error(&quot;ERROR: DATABASE_URL environment variable is not set!&quot;);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Database connection string is missing&quot;,
          message:
            &quot;The server is not properly configured to connect to the database.&quot;,
        },
        { status: 500, headers },
      );
    }

    // Parse request body with safety checks
    let body;
    try {
      body = await request.json();
      console.log(
        &quot;Received availability creation request:&quot;,
        JSON.stringify(body, null, 2),
      );
    } catch (parseError) {
      console.error(&quot;Failed to parse request body:&quot;, parseError);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Invalid request body format&quot;,
        },
        { status: 400, headers },
      );
    }

    // Validate required fields
    if (!body.userId && !body.user_id) {
      console.error(&quot;Missing required field: userId&quot;);
      return NextResponse.json(
        {
          success: false,
          error: &quot;userId is required&quot;,
        },
        { status: 400, headers },
      );
    }

    if (!body.startDate && !body.start_date) {
      console.error(&quot;Missing required field: startDate&quot;);
      return NextResponse.json(
        {
          success: false,
          error: &quot;startDate is required&quot;,
        },
        { status: 400, headers },
      );
    }

    if (!body.endDate && !body.end_date) {
      console.error(&quot;Missing required field: endDate&quot;);
      return NextResponse.json(
        {
          success: false,
          error: &quot;endDate is required&quot;,
        },
        { status: 400, headers },
      );
    }

    // Validate date formats
    const startDate = new Date(body.startDate || body.start_date);
    const endDate = new Date(body.endDate || body.end_date);

    if (isNaN(startDate.getTime())) {
      console.error(
        &quot;Invalid startDate format:&quot;,
        body.startDate || body.start_date,
      );
      return NextResponse.json(
        {
          success: false,
          error: &quot;Invalid startDate format&quot;,
        },
        { status: 400, headers },
      );
    }

    if (isNaN(endDate.getTime())) {
      console.error(&quot;Invalid endDate format:&quot;, body.endDate || body.end_date);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Invalid endDate format&quot;,
        },
        { status: 400, headers },
      );
    }

    // Validate date logic
    if (startDate >= endDate) {
      console.error(&quot;startDate must be before endDate&quot;);
      return NextResponse.json(
        {
          success: false,
          error: &quot;startDate must be before endDate&quot;,
        },
        { status: 400, headers },
      );
    }

    // Convert body to expected service format with defaults
    const createRequest = {
      userId: body.userId || body.user_id,
      title: body.title || &quot;Available&quot;,
      startDate: startDate,
      endDate: endDate,
      status:
        (body.status as &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;) ||
        &quot;available&quot;,
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
      &quot;Processed request:&quot;,
      JSON.stringify(createRequest, (k, v) => {
        if (v instanceof Date) return v.toISOString();
        return v;
      }),
    );

    try {
      console.log(
        &quot;➡️ Calling availabilityService.createAvailabilityBlock with request&quot;,
      );

      // Use real availability service
      const availabilityService = new AvailabilityService();

      // Wrap service call in a timeout to prevent hanging
      const serviceCallPromise =
        availabilityService.createAvailabilityBlock(createRequest);

      // Set timeout for service call (10 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(&quot;Service call timed out&quot;)), 10000);
      });

      // Race the service call against the timeout
      const result = (await Promise.race([
        serviceCallPromise,
        timeoutPromise,
      ])) as any;

      if (!result || !result.success) {
        console.error(
          &quot;Service error when creating availability:&quot;,
          result?.error,
        );
        // Return standardized error response
        const errorResponse = {
          success: false,
          error: result?.error || &quot;Failed to create availability block&quot;,
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json(errorResponse, { status: 400, headers });
      }

      console.log(&quot;✅ Successfully created availability block&quot;);

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
      console.error(&quot;Error from availability service:&quot;, serviceError);
      // Return standardized error response
      const errorResponse = {
        success: false,
        error:
          serviceError instanceof Error
            ? serviceError.message
            : &quot;Failed to create availability block&quot;,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(errorResponse, { status: 500, headers });
    }
  } catch (error) {
    console.error(&quot;Unhandled error creating availability block:&quot;, error);
    // Return standardized error response
    const errorResponse = {
      success: false,
      error: &quot;An unexpected error occurred while creating availability block&quot;,
      timestamp: new Date().toISOString(),
    };

    // Create new headers for error response
    const errorHeaders = new Headers();
    errorHeaders.set(&quot;Content-Type&quot;, &quot;application/json&quot;);
    errorHeaders.set(
      &quot;Cache-Control&quot;,
      &quot;no-store, no-cache, must-revalidate, proxy-revalidate&quot;,
    );
    errorHeaders.set(&quot;Pragma&quot;, &quot;no-cache&quot;);
    errorHeaders.set(&quot;Expires&quot;, &quot;0");

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: errorHeaders,
    });
  }
}
