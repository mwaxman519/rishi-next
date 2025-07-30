import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placeId = (searchParams.get(&quot;placeId&quot;) || undefined);

    if (!placeId) {
      return NextResponse.json(
        { error: &quot;Place ID parameter is required&quot; },
        { status: 400 },
      );
    }

    // Use the server-side API key
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error(&quot;Places API key not found in environment variables&quot;);
      return NextResponse.json(
        { error: &quot;API key configuration error&quot; },
        { status: 500 },
      );
    }

    // Call the Places API to get details
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_component,formatted_address,geometry&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Places API request failed with status ${response.status}`,
      );
    }

    const data = await response.json();

    // Check for Google API errors
    if (data.status !== &quot;OK&quot;) {
      console.error(&quot;Places API error:&quot;, data.error_message || data.status);
      return NextResponse.json(
        {
          error: &quot;Places API error&quot;,
          status: data.status,
          message: data.error_message || &quot;Failed to get place details&quot;,
        },
        { status: 400 },
      );
    }

    // Extract the address components
    const result = data.result;
    const addressComponents = result.address_components || [];
    const formattedAddress = result.formatted_address;
    const geometry = result.geometry;

    // Process address components
    const locationData = {
      formattedAddress,
      latitude: geometry?.location?.lat,
      longitude: geometry?.location?.lng,
      address1: "&quot;,
      city: &quot;&quot;,
      state: &quot;&quot;,
      zipcode: &quot;&quot;,
    };

    // Street number and route (address)
    const streetNumber =
      addressComponents.find((component: any) =>
        component.types.includes(&quot;street_number&quot;),
      )?.long_name || &quot;&quot;;
    const route =
      addressComponents.find((component: any) =>
        component.types.includes(&quot;route&quot;),
      )?.long_name || &quot;&quot;;
    locationData.address1 = streetNumber ? `${streetNumber} ${route}` : route;

    // City
    locationData.city =
      addressComponents.find((component: any) =>
        component.types.includes(&quot;locality&quot;),
      )?.long_name || &quot;&quot;;

    // State
    locationData.state =
      addressComponents.find((component: any) =>
        component.types.includes(&quot;administrative_area_level_1&quot;),
      )?.short_name || &quot;&quot;;

    // ZIP Code
    locationData.zipcode =
      addressComponents.find((component: any) =>
        component.types.includes(&quot;postal_code&quot;),
      )?.long_name || &quot;&quot;;

    // Return the structured data
    return NextResponse.json(locationData);
  } catch (error) {
    console.error(&quot;Error in location validation API route:&quot;, error);
    return NextResponse.json(
      {
        error: &quot;Internal server error&quot;,
        message: error instanceof Error ? error.message : &quot;Unknown error",
      },
      { status: 500 },
    );
  }
}
