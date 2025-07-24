import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { checkPermission } from "../../../lib/rbac";
import { db } from "../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get user session
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

    try {
      // Get all locations from database
      const locations = await db.location.findMany();

      // Extract unique states, cities, zip codes, and location types
      const states = new Set<string>();
      const cities = new Set<string>();
      const zipCodes = new Set<string>();
      const locationTypes = new Set<string>();
      const statuses = new Set<string>();

      locations.forEach((location) => {
        if (location.state) states.add(location.state);
        if (location.city) cities.add(location.city);
        if (location.zipCode) zipCodes.add(location.zipCode);
        if (location.locationType) locationTypes.add(location.locationType);
        if (location.status) statuses.add(location.status);
      });

      // Convert sets to arrays of objects with id and name for consistent UI rendering
      const statesArray = Array.from(states).map((state) => ({
        id: state,
        name: state,
      }));
      const citiesArray = Array.from(cities).map((city) => ({
        id: city,
        name: city,
      }));
      const zipCodesArray = Array.from(zipCodes).map((zipCode) => ({
        id: zipCode,
        name: zipCode,
      }));
      const locationTypesArray = Array.from(locationTypes).map((type) => ({
        id: type,
        name: type,
      }));
      const statusesArray = Array.from(statuses).map((status) => ({
        id: status,
        name: status,
      }));

      // Sort results alphabetically
      statesArray.sort((a, b) => a.name.localeCompare(b.name));
      citiesArray.sort((a, b) => a.name.localeCompare(b.name));
      zipCodesArray.sort((a, b) => a.name.localeCompare(b.name));
      locationTypesArray.sort((a, b) => a.name.localeCompare(b.name));

      // Sort statuses in a specific order
      const statusOrder = ["active", "pending", "inactive", "rejected"];
      statusesArray.sort((a, b) => {
        const indexA = statusOrder.indexOf(a.id);
        const indexB = statusOrder.indexOf(b.id);
        return indexA - indexB;
      });

      // Calculate location statistics
      const totalLocations = locations.length;
      const activeLocations = locations.filter(
        (loc) => loc.status === "active",
      ).length;
      const pendingLocations = locations.filter(
        (loc) => loc.status === "pending",
      ).length;

      return NextResponse.json({
        metadata: {
          states: statesArray,
          cities: citiesArray,
          zipCodes: zipCodesArray,
          locationTypes: locationTypesArray,
          statuses: statusesArray,
        },
        stats: {
          total: totalLocations,
          active: activeLocations,
          pending: pendingLocations,
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error fetching location metadata:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch location metadata",
      },
      { status: 500 },
    );
  }
}
