import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


/**
 * GET /api/availability/fallback - Get empty availability data
 *
 * This is a fallback endpoint that guarantees a valid response
 * when the main availability service is unavailable
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log(&quot;GET /api/availability/fallback received&quot;);

  return NextResponse.json([], {
    status: 200,
    headers: {
      &quot;Content-Type&quot;: &quot;application/json&quot;,
      &quot;Cache-Control&quot;: &quot;public, max-age=60, s-maxage=60&quot;,
    },
  });
}
