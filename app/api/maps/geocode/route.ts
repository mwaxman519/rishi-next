/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Geocoding API Route
 * Provides geocoding features to client-side applications
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { geocodingService } from &quot;../../../services/maps&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;

// Geocode an address
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check permissions
    if (!(await checkPermission(req, &quot;create:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    // Get address from request body
    const body = await req.json();
    const { address } = body;

    if (!address || typeof address !== &quot;string&quot;) {
      return NextResponse.json(
        { error: &quot;Invalid request: address is required&quot; },
        { status: 400 },
      );
    }

    // Call geocoding service
    const result = await geocodingService.geocodeAddress(address);

    if (!result) {
      return NextResponse.json(
        { error: &quot;Could not geocode the provided address&quot; },
        { status: 422 },
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error(&quot;Error in geocode API route:&quot;, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : &quot;Internal server error&quot;,
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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check permissions
    if (!(await checkPermission(req, &quot;view:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    // Get coordinates from query params
    const searchParams = req.nextUrl.searchParams;
    const lat = parseFloat((searchParams.get(&quot;lat&quot;) || undefined) || "&quot;);
    const lng = parseFloat((searchParams.get(&quot;lng&quot;) || undefined) || &quot;&quot;);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        {
          error:
            &quot;Invalid request: lat and lng are required and must be numbers&quot;,
        },
        { status: 400 },
      );
    }

    // Call reverse geocoding service
    const result = await geocodingService.reverseGeocode(lat, lng);

    if (!result) {
      return NextResponse.json(
        { error: &quot;Could not reverse geocode the provided coordinates&quot; },
        { status: 422 },
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error(&quot;Error in reverse geocode API route:&quot;, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : &quot;Internal server error",
      },
      { status: 500 },
    );
  }
}
