import { NextResponse } from &quot;next/server&quot;;
import { randomBytes } from &quot;crypto&quot;;

export async function GET() {
  const csrfToken = randomBytes(32).toString(&quot;hex&quot;);

  return NextResponse.json({
    csrfToken,
  });
}

export const dynamic = &quot;force-dynamic&quot;;
