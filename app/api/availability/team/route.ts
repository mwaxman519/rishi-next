import { NextRequest, NextResponse } from "next/server";
import { availabilityService } from "../../../services/availability/availabilityService";
import { USER_ROLES } from "../../../../shared/rbac/roles";
import { verifyJwt } from "../../../lib/auth-utils";

/**
 * GET /api/availability/team - Get team members' availability blocks
 *
 * This endpoint retrieves availability blocks for all team members.
 * Only authorized roles (MANAGER, ADMIN) can access this endpoint.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Get the search parameters from the request URL
  const searchParams = request.nextUrl.searchParams;

  // Parse the date range parameters
  const startDateParam = (searchParams.get("startDate") || undefined) || undefined;
  const endDateParam = (searchParams.get("endDate") || undefined) || undefined;

  // Get the auth token and verify user
  const authHeader = request.headers.get("authorization");
  const token =
    authHeader?.split(" ")[1] || request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required",
      },
      { status: 401 },
    );
  }

  const userData = await verifyJwt(token);
  if (!userData) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid authentication token",
      },
      { status: 401 },
    );
  }

  // Check if the user has appropriate role (internal field manager or admin)
  if (
    userData.role !== USER_ROLES.INTERNAL_FIELD_MANAGER &&
    userData.role !== USER_ROLES.INTERNAL_ADMIN
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "You do not have permission to access team availability",
      },
      { status: 403 },
    );
  }

  try {
    // Create date objects from the parameters
    const startDate = startDateParam ? new Date(startDateParam) : new Date();
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // Default to 2 weeks from now

    // For now, we'll return a simple response since this is a new endpoint
    // In the future, we'll use availabilityService to get team data
    return NextResponse.json({
      success: true,
      data: [], // In the future we'll populate this with real data
    });
  } catch (error) {
    console.error("Error fetching team availability:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch team availability",
      },
      { status: 500 },
    );
  }
}
