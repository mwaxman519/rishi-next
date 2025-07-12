import { NextRequest, NextResponse } from "next/server";
import { availabilityService } from "../../../services/availability/availabilityService";
import { availabilityRepository } from "../../../services/availability/repository";
import { distributedEventBus } from "../../../services/infrastructure/eventBus";

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
      console.error("Missing ID parameter in request");
      return NextResponse.json(
        {
          success: false,
          error: "Missing ID parameter",
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
          error: "Invalid ID format",
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
          error: result?.error || "Availability block not found",
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
          error instanceof Error ? error.message : "Unknown error occurred",
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
      console.error("Missing ID parameter in request");
      return NextResponse.json(
        {
          success: false,
          error: "Missing ID parameter",
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
          error: "Invalid ID format",
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
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body format",
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
          error: result?.error || "Update failed",
          data: null,
        },
        {
          status: result?.error === "Availability block not found" ? 404 : 400,
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
          error instanceof Error ? error.message : "Unknown error occurred",
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
      console.error("Missing ID parameter in request");
      return NextResponse.json(
        {
          success: false,
          error: "Missing ID parameter",
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
          error: "Invalid ID format",
          data: null,
        },
        { status: 400, headers },
      );
    }

    // Check if we should delete the entire series (safely)
    let deleteSeries = false;
    try {
      const { searchParams } = new URL(req.url);
      deleteSeries = searchParams.get("deleteSeries") === "true";
    } catch (urlError) {
      console.error("Error parsing URL for query parameters:", urlError);
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
          error: result?.error || "Deletion failed",
          data: null,
        },
        {
          status: result?.error === "Availability block not found" ? 404 : 400,
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
          error instanceof Error ? error.message : "Unknown error occurred",
        data: null,
      },
      { status: 500, headers },
    );
  }
}
