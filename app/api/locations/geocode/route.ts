import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;


// Google Maps API Key for geocoding
const GOOGLE_MAPS_API_KEY = "AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg";

export async function GET(request: Request) {
  try {
    // Extract the address from the URL query parameters
    const { searchParams } = new URL(request.url);
    const address = (searchParams.get("address") || undefined);

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 },
      );
    }

    // Make a request to the Google Maps Geocoding API
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(geocodingUrl);
    const data = await response.json();

    // Check if the geocoding was successful
    if (data.status !== "OK") {
      console.error("Geocoding error:", data);
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
    console.error("Error in geocoding API:", error);
    return NextResponse.json(
      { error: "An error occurred during geocoding" },
      { status: 500 },
    );
  }
}
