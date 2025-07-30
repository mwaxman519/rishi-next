import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { availabilityService } from &quot;../../../services/availability/availabilityService&quot;;
import { availabilityRepository } from &quot;../../../services/availability/repository&quot;;
import { distributedEventBus } from &quot;../../../services/infrastructure/eventBus&quot;;

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

/**
 * GET handler for retrieving a specific availability block
 * - Returns 400 for invalid ID format
 * - Returns 404 if block not found
 * - Returns 200 with block data if found
 * - Returns 500 for server errors
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // Create headers once
  const headers = createNoCacheHeaders();

  try {
    // Await params and validate that we have an ID parameter
    const params = await context.params;
    if (!params || !params.id) {
      console.error(&quot;Missing ID parameter in request&quot;);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Missing ID parameter&quot;,
          data: null,
        },
        { status: 400, headers },
      );
    }

    // Parse the ID
    const id = parseInt(params.id);

    // Validate ID format
    if (isNaN(id)) {
      console.error(`Invalid ID format: ${id}`);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Invalid ID format&quot;,
          data: null,
        },
        { status: 400, headers },
      );
    }

    console.log(`Fetching availability block with ID: ${id}`);

    // Use the imported availabilityService instance
    const result = await availabilityService.getAvailabilityBlockById(id);

    // Handle not found case
    if (!result || !result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result?.error || &quot;Availability block not found&quot;,
          data: null,
        },
        { status: 404, headers },
      );
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        error: null,
      },
      { status: 200, headers },
    );
  } catch (error) {
    // Log and handle any unexpected errors
    console.error(`Error retrieving availability block:`, error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : &quot;Unknown error occurred&quot;,
        data: null,
      },
      { status: 500, headers },
    );
  }
}

/**
 * PUT handler for updating an availability block
 * - Returns 400 for invalid ID format or malformed request
 * - Returns 404 if block not found
 * - Returns 200 with updated block data on success
 * - Returns 500 for server errors
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // Create headers once
  const headers = createNoCacheHeaders();

  try {
    // Await params and validate that we have an ID parameter
    const params = await context.params;
    if (!params || !params.id) {
      console.error(&quot;Missing ID parameter in request&quot;);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Missing ID parameter&quot;,
          data: null,
        },
        { status: 400, headers },
      );
    }

    // Parse the ID
    const id = parseInt(params.id);

    // Validate ID format
    if (isNaN(id)) {
      console.error(`Invalid ID format: ${id}`);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Invalid ID format&quot;,
          data: null,
        },
        { status: 400, headers },
      );
    }

    // Parse request body
    let updateData;
    try {
      updateData = await req.json();
    } catch (parseError) {
      console.error(&quot;Failed to parse request body:&quot;, parseError);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Invalid request body format&quot;,
          data: null,
        },
        { status: 400, headers },
      );
    }

    console.log(
      `Received update request for availability block ${id}:`,
      updateData,
    );

    // Use the imported availabilityService instance
    const result = await availabilityService.updateAvailabilityBlock(
      id,
      updateData,
    );

    // Handle not found or validation error cases
    if (!result || !result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result?.error || &quot;Update failed&quot;,
          data: null,
        },
        {
          status: result?.error === &quot;Availability block not found&quot; ? 404 : 400,
          headers,
        },
      );
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        error: null,
      },
      { status: 200, headers },
    );
  } catch (error) {
    // Log and handle any unexpected errors
    console.error(`Error updating availability block:`, error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : &quot;Unknown error occurred&quot;,
        data: null,
      },
      { status: 500, headers },
    );
  }
}

/**
 * DELETE handler for removing an availability block
 * - Returns 400 for invalid ID format
 * - Returns 404 if block not found
 * - Returns 200 on successful deletion
 * - Returns 500 for server errors
 * - Supports ?deleteSeries=true query parameter to delete recurring series
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // Create headers once
  const headers = createNoCacheHeaders();

  try {
    // Await params and validate that we have an ID parameter
    const params = await context.params;
    if (!params || !params.id) {
      console.error(&quot;Missing ID parameter in request&quot;);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Missing ID parameter&quot;,
          data: null,
        },
        { status: 400, headers },
      );
    }

    // Parse the ID
    const id = parseInt(params.id);

    // Validate ID format
    if (isNaN(id)) {
      console.error(`Invalid ID format: ${id}`);
      return NextResponse.json(
        {
          success: false,
          error: &quot;Invalid ID format&quot;,
          data: null,
        },
        { status: 400, headers },
      );
    }

    // Check if we should delete the entire series (safely)
    let deleteSeries = false;
    try {
      const { searchParams } = new URL(req.url);
      deleteSeries = (searchParams.get(&quot;deleteSeries&quot;) || undefined) === &quot;true&quot;;
    } catch (urlError) {
      console.error(&quot;Error parsing URL for query parameters:&quot;, urlError);
      // Continue with default deleteSeries=false
    }

    console.log(
      `DELETE request for block ID ${id} with deleteSeries=${deleteSeries}`,
    );

    // Use the imported availabilityService instance with the deleteSeries parameter
    const result = await availabilityService.deleteAvailabilityBlock(
      id,
      deleteSeries,
    );

    // Handle not found or error cases
    if (!result || !result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result?.error || &quot;Deletion failed&quot;,
          data: null,
        },
        {
          status: result?.error === &quot;Availability block not found&quot; ? 404 : 400,
          headers,
        },
      );
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        error: null,
      },
      { status: 200, headers },
    );
  } catch (error) {
    // Log and handle any unexpected errors
    console.error(`Error deleting availability block:`, error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : &quot;Unknown error occurred&quot;,
        data: null,
      },
      { status: 500, headers },
    );
  }
}
