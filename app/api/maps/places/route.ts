import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = (searchParams.get(&quot;query&quot;) || undefined);

    if (!query) {
      return NextResponse.json(
        { error: &quot;Query parameter is required&quot; },
        { status: 400 },
      );
    }

    // Use the non-public API key (not prefixed with NEXT_PUBLIC_)
    // This key remains on the server and is not exposed to the client
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
    if (data.status !== &quot;OK&quot;) {
      console.error(&quot;Places API error:&quot;, data.error_message || data.status);
      return NextResponse.json(
        {
          error: &quot;Places API error&quot;,
          status: data.status,
          message: data.error_message || &quot;Failed to get place predictions&quot;,
        },
        { status: 400 },
      );
    }

    // Return the successful result
    return NextResponse.json(data);
  } catch (error) {
    console.error(&quot;Error in Places API route:&quot;, error);
    return NextResponse.json(
      {
        error: &quot;Internal server error&quot;,
        message: error instanceof Error ? error.message : &quot;Unknown error&quot;,
      },
      { status: 500 },
    );
  }
}
