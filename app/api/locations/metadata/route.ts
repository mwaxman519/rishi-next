import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations } from &quot;@shared/schema&quot;;

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to view locations
    if (!(await checkPermission(req, &quot;view:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    try {
      // Get all locations from database using Drizzle ORM
      const allLocations = await db.select().from(locations);

      // Extract unique states, cities, zip codes, and location types
      const states = new Set<string>();
      const cities = new Set<string>();
      const zipCodes = new Set<string>();
      const locationTypes = new Set<string>();
      const statuses = new Set<string>();

      allLocations.forEach((location) => {
        if (location.state) states.add(location.state);
        if (location.city) cities.add(location.city);
        if (location.zipcode) zipCodes.add(location.zipcode);
        if (location.type) locationTypes.add(location.type);
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
      const statusOrder = [&quot;active&quot;, &quot;pending&quot;, &quot;inactive&quot;, &quot;rejected&quot;];
      statusesArray.sort((a, b) => {
        const indexA = statusOrder.indexOf(a.id);
        const indexB = statusOrder.indexOf(b.id);
        return indexA - indexB;
      });

      // Calculate location statistics
      const totalLocations = locations.length;
      const activeLocations = locations.filter(
        (loc) => loc.status === &quot;active&quot;,
      ).length;
      const pendingLocations = locations.filter(
        (loc) => loc.status === &quot;pending&quot;,
      ).length;

      return NextResponse.json({
        metadata: {
          states: statesArray,
          cities: citiesArray,
          zipCodes: zipCodesArray,
          types: locationTypesArray,
          statuses: statusesArray,
        },
        stats: {
          total: totalLocations,
          active: activeLocations,
          pending: pendingLocations,
        },
      });
    } catch (dbError) {
      console.error(&quot;Database error:&quot;, dbError);
      return NextResponse.json(
        {
          error: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(&quot;Error fetching location metadata:&quot;, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : &quot;Failed to fetch location metadata&quot;,
      },
      { status: 500 },
    );
  }
}
