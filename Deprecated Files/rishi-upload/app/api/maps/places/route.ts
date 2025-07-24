import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 },
      );
    }

    // Use the non-public API key (not prefixed with NEXT_PUBLIC_)
    // This key remains on the server and is not exposed to the client
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

    // Call the Places API Autocomplete
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`;
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
          message: data.error_message || "Failed to get place predictions",
        },
        { status: 400 },
      );
    }

    // Return the successful result
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Places API route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
