/**
 * Geocoding API Route
 * Provides geocoding features to client-side applications
 */
import { NextRequest, NextResponse } from "next/server";
import { geocodingService } from "../../../services/maps";
import { getCurrentUser } from "../../../lib/auth";
import { checkPermission } from "../../../lib/rbac";

// Geocode an address
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!(await checkPermission(req, "create:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    // Get address from request body
    const body = await req.json();
    const { address } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Invalid request: address is required" },
        { status: 400 },
      );
    }

    // Call geocoding service
    const result = await geocodingService.geocodeAddress(address);

    if (!result) {
      return NextResponse.json(
        { error: "Could not geocode the provided address" },
        { status: 422 },
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in geocode API route:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// Reverse geocode coordinates
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!(await checkPermission(req, "view:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    // Get coordinates from query params
    const searchParams = req.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        {
          error:
            "Invalid request: lat and lng are required and must be numbers",
        },
        { status: 400 },
      );
    }

    // Call reverse geocoding service
    const result = await geocodingService.reverseGeocode(lat, lng);

    if (!result) {
      return NextResponse.json(
        { error: "Could not reverse geocode the provided coordinates" },
        { status: 422 },
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in reverse geocode API route:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
