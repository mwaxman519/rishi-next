import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placeId = ((searchParams.get("placeId") || undefined) || undefined);

    if (!placeId) {
      return NextResponse.json(
        { error: "Place ID parameter is required" },
        { status: 400 },
      );
    }

    // Use the server-side API key
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Places API key not found in environment variables");
      return NextResponse.json(
        { error: "API key configuration error" },
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
    if (data.status !== "OK") {
      console.error("Places API error:", data.error_message || data.status);
      return NextResponse.json(
        {
          error: "Places API error",
          status: data.status,
          message: data.error_message || "Failed to get place details",
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
      address1: "",
      city: "",
      state: "",
      zipcode: "",
    };

    // Street number and route (address)
    const streetNumber =
      addressComponents.find((component: any) =>
        component.types.includes("street_number"),
      )?.long_name || "";
    const route =
      addressComponents.find((component: any) =>
        component.types.includes("route"),
      )?.long_name || "";
    locationData.address1 = streetNumber ? `${streetNumber} ${route}` : route;

    // City
    locationData.city =
      addressComponents.find((component: any) =>
        component.types.includes("locality"),
      )?.long_name || "";

    // State
    locationData.state =
      addressComponents.find((component: any) =>
        component.types.includes("administrative_area_level_1"),
      )?.short_name || "";

    // ZIP Code
    locationData.zipcode =
      addressComponents.find((component: any) =>
        component.types.includes("postal_code"),
      )?.long_name || "";

    // Return the structured data
    return NextResponse.json(locationData);
  } catch (error) {
    console.error("Error in location validation API route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
