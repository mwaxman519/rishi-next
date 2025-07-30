import { NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


// Google Maps API Key for geocoding
const GOOGLE_MAPS_API_KEY = &quot;AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg&quot;;

export async function GET(request: Request) {
  try {
    // Extract the address from the URL query parameters
    const { searchParams } = new URL(request.url);
    const address = (searchParams.get(&quot;address&quot;) || undefined);

    if (!address) {
      return NextResponse.json(
        { error: &quot;Address parameter is required&quot; },
        { status: 400 },
      );
    }

    // Make a request to the Google Maps Geocoding API
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(geocodingUrl);
    const data = await response.json();

    // Check if the geocoding was successful
    if (data.status !== &quot;OK&quot;) {
      console.error(&quot;Geocoding error:&quot;, data);
      return NextResponse.json(
        { error: `Geocoding failed: ${data.status}` },
        { status: 400 },
      );
    }

    // Extract the latitude and longitude from the response
    const location = data.results[0].geometry.location;

    return NextResponse.json({
      lat: location.lat,
      lng: location.lng,
      formattedAddress: data.results[0].formatted_address,
    });
  } catch (error) {
    console.error(&quot;Error in geocoding API:&quot;, error);
    return NextResponse.json(
      { error: &quot;An error occurred during geocoding&quot; },
      { status: 500 },
    );
  }
}
