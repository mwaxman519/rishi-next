import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";
import { checkPermission } from "../../../lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to view locations
    if (!(await checkPermission(req, "view:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const locationId = params.id;

    // Validate that the ID is a valid UUID
    if (
      !locationId ||
      !locationId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    ) {
      // Handle the case where the ID is not a number or UUID
      // In development mode, allow string IDs for testing
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          { error: "Invalid location ID format" },
          { status: 400 },
        );
      }
    }

    // Get the location by ID
    const locationData = await db.location.findById(locationId);

    if (!locationData) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(locationData);
  } catch (error) {
    console.error(`Error fetching location:`, error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to update locations
    if (!(await checkPermission(req, "update:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const locationId = params.id;

    // Validate that the ID is a valid UUID
    if (
      !locationId ||
      !locationId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    ) {
      // Handle the case where the ID is not a number or UUID
      // In development mode, allow string IDs for testing
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          { error: "Invalid location ID format" },
          { status: 400 },
        );
      }
    }

    const body = await req.json();

    // Check if location exists
    const existingLocation = await db.location.findById(locationId);

    if (!existingLocation) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    // Update the location
    const updatedLocation = await db.location.update(locationId, body);

    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error(`Error updating location:`, error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to delete locations
    if (!(await checkPermission(req, "delete:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const locationId = params.id;

    // Validate that the ID is a valid UUID
    if (
      !locationId ||
      !locationId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    ) {
      // Handle the case where the ID is not a number or UUID
      // In development mode, allow string IDs for testing
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          { error: "Invalid location ID format" },
          { status: 400 },
        );
      }
    }

    // Check if location exists
    const existingLocation = await db.location.findById(locationId);

    if (!existingLocation) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    // Delete the location
    await db.location.delete(locationId);

    return NextResponse.json(
      { message: "Location deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Error deleting location:`, error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 },
    );
  }
}
