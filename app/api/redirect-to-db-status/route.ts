import { NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-dynamic&quot;;
export const runtime = &quot;nodejs&quot;;

export async function GET() {
  return NextResponse.redirect(
    new URL(&quot;/debug/db-status&quot;, &quot;http://localhost:5000&quot;),
  );
}
