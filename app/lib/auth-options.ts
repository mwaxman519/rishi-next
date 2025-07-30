import { AuthOptions } from &quot;next-auth&quot;;
import CredentialsProvider from &quot;next-auth/providers/credentials&quot;;

// Authentication options
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: &quot;Credentials&quot;,
      credentials: {
        email: { label: &quot;Email&quot;, type: &quot;email&quot; },
        password: { label: &quot;Password&quot;, type: &quot;password&quot; },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Validate credentials against database
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth-service/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: credentials.email,
              password: credentials.password,
            }),
          });

          if (response.ok) {
            const user = await response.json();
            return {
              id: user.id,
              name: user.fullName || user.username,
              email: user.email,
              role: user.role,
              organizationId: user.organizationId,
            };
          }
          
          return null;
        } catch (error) {
          console.error(&quot;Authentication error:&quot;, error);
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
    signIn: &quot;/auth&quot;,
    error: &quot;/auth&quot;,
  },
  session: {
    strategy: &quot;jwt&quot;,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: (() => {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error(&quot;NEXTAUTH_SECRET environment variable is required&quot;);
    }
    return secret;
  })(),
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