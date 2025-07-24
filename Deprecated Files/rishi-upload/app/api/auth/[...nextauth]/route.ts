import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Authentication options
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In a real app, you would verify the credentials against your database
        // For development purposes, we're using a mock user
        // Always return mock user for development
        return {
          id: "00000000-0000-0000-0000-000000000001",
          name: "Admin User",
          email: credentials?.email || "admin@example.com",
          role: "super_admin",
          organizationId: "00000000-0000-0000-0000-000000000001",
        };

        // Non-development environment: Actually validate credentials
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Validate with your authentication service
          // This is a placeholder - implement proper authentication
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add custom user data to the JWT token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom user data to the session
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).organizationId = token.organizationId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "development-secret-key-for-local-development-only",
  debug: false,
  trustHost: true,
  useSecureCookies: false,
  logger: {
    error: () => {},
    warn: () => {},
    debug: () => {},
  },
  events: {
    error: () => {},
  },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Export the NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
