import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations } from &quot;@shared/schema&quot;;

export interface LocationFilterParams {
  search?: string;
  states?: string[];
  cities?: string[];
  zipCodes?: string[];
  types?: string[];
  status?: string[];
  radiusMiles?: number;
  lat?: number;
  lng?: number;
  organizationId?: string;
  skipPending?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: &quot;asc&quot; | &quot;desc&quot;;
}

export async function POST(req: NextRequest) {
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

    // Parse filter parameters from request body
    const filters = (await req.json()) as LocationFilterParams;

    // Set defaults
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skipPending = filters.skipPending !== false; // Default to true
    const sortBy = filters.sortBy || &quot;name&quot;;
    const sortDirection = filters.sortDirection || &quot;asc&quot;;

    try {
      // Get all locations from database using Drizzle ORM
      const allLocations = await db.select().from(locations);

      // Apply filters
      let filteredLocations = allLocations;

      // Filter out pending/rejected locations if requested
      if (skipPending) {
        filteredLocations = filteredLocations.filter(
          (loc) =>
            loc.status === &quot;active&quot; ||
            (loc.status !== &quot;pending&quot; &&
              loc.status !== &quot;rejected&quot;),
        );
      }

      // Apply text search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLocations = filteredLocations.filter(
          (location) =>
            location.name.toLowerCase().includes(searchLower) ||
            location.address1.toLowerCase().includes(searchLower) ||
            (location.city &&
              location.city.toLowerCase().includes(searchLower)) ||
            (location.state &&
              location.state.toLowerCase().includes(searchLower)) ||
            (location.zipcode &&
              location.zipcode.toLowerCase().includes(searchLower)),
        );
      }

      // Apply state filter
      if (filters.states && filters.states.length > 0) {
        filteredLocations = filteredLocations.filter(
          (location) =>
            location.state && filters.states?.includes(location.state),
        );
      }

      // Apply city filter
      if (filters.cities && filters.cities.length > 0) {
        filteredLocations = filteredLocations.filter(
          (location) =>
            location.city && filters.cities?.includes(location.city),
        );
      }

      // Apply zip code filter
      if (filters.zipcode && filters.zipcode.length > 0) {
        filteredLocations = filteredLocations.filter(
          (location) =>
            location.zipcode && filters.zipcode?.includes(location.zipcode),
        );
      }

      // Apply type filter
      if (filters.types && filters.types.length > 0) {
        filteredLocations = filteredLocations.filter(
          (location) =>
            location.type &&
            filters.types?.includes(location.type),
        );
      }

      // Apply status filter
      if (filters.status && filters.status.length > 0) {
        filteredLocations = filteredLocations.filter(
          (location) =>
            location.status && filters.status?.includes(location.status),
        );
      }

      // Apply radius filter if coordinates and radius are provided
      if (
        filters.lat !== undefined &&
        filters.lng !== undefined &&
        filters.radiusMiles !== undefined
      ) {
        const lat1 = filters.lat;
        const lng1 = filters.lng;
        const radiusMiles = filters.radiusMiles;

        filteredLocations = filteredLocations.filter((location) => {
          // Haversine formula for calculating distance between two points on Earth
          const toRad = (value: number) => (value * Math.PI) / 180;
          const lat2 = location.geo_lat;
          const lng2 = location.geo_lng;
          const R = 3958.8; // Earth's radius in miles

          const dLat = toRad(lat2 - lat1);
          const dLng = toRad(lng2 - lng1);

          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
              Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);

          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return distance <= radiusMiles;
        });
      }

      // Apply sorting
      filteredLocations.sort((a, b) => {
        // @ts-ignore - Dynamic property access
        const aValue = a[sortBy];
        // @ts-ignore - Dynamic property access
        const bValue = b[sortBy];

        if (aValue === undefined) return sortDirection === &quot;asc&quot; ? -1 : 1;
        if (bValue === undefined) return sortDirection === &quot;asc&quot; ? 1 : -1;

        // Handle string comparison
        if (typeof aValue === &quot;string&quot; && typeof bValue === &quot;string&quot;) {
          return sortDirection === &quot;asc&quot;
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle number and boolean comparison
        if (aValue < bValue) return sortDirection === &quot;asc&quot; ? -1 : 1;
        if (aValue > bValue) return sortDirection === &quot;asc&quot; ? 1 : -1;
        return 0;
      });

      // Calculate pagination
      const total = filteredLocations.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const paginatedLocations = filteredLocations.slice(
        startIndex,
        startIndex + pageSize,
      );

      // Return results with pagination metadata
      return NextResponse.json({
        locations: paginatedLocations,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
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
    console.error(&quot;Error filtering locations:&quot;, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : &quot;Failed to filter locations&quot;,
      },
      { status: 500 },
    );
  }
}
