import { NextResponse } from &quot;next/server&quot;;

export async function GET() {
  return NextResponse.json({
    credentials: {
      id: &quot;credentials&quot;,
      name: &quot;Credentials&quot;,
      type: &quot;credentials&quot;,
      signinUrl: &quot;/api/auth/signin/credentials&quot;,
      callbackUrl: &quot;/api/auth/callback/credentials&quot;,
    },
  });
}

export const dynamic = &quot;force-dynamic&quot;;
