import { NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


export async function GET() {
  try {
    // Return basic documentation info
    return NextResponse.json({
      title: &quot;Rishi Platform Documentation&quot;,
      description: &quot;Comprehensive documentation for the Rishi Platform&quot;,
      version: &quot;1.0.0&quot;,
      sections: [
        {
          id: &quot;getting-started&quot;,
          title: &quot;Getting Started&quot;,
          description: &quot;Basic setup and introduction to the platform&quot;
        },
        {
          id: &quot;api-reference&quot;,
          title: &quot;API Reference&quot;,
          description: &quot;Complete API documentation&quot;
        },
        {
          id: &quot;user-guide&quot;,
          title: &quot;User Guide&quot;,
          description: &quot;End-user documentation and tutorials&quot;
        }
      ]
    });
  } catch (error) {
    console.error(&quot;Error loading documentation:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to load documentation&quot; },
      { status: 500 }
    );
  }
}