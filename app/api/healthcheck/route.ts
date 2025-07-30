import { NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


/**
 * Simple health check endpoint that won&apos;t attempt to access the database
 * This is used to confirm the API server is running when the database might be unavailable
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: &quot;healthy&quot;,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        &quot;Cache-Control&quot;: &quot;no-store, max-age=0&quot;,
      },
    },
  );
}
