import NextAuth from "next-auth";
import { authOptions } from "../../../lib/auth-options";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Export the NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
