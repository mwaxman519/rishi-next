import { generateStaticParams } from &quot;./generateStaticParams&quot;;

import NextAuth from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;

export const dynamic = &quot;force-dynamic&quot;;
export const runtime = &quot;nodejs&quot;;

// Export the NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
