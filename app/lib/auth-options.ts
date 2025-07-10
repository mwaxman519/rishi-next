import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "../db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // In development mode, return a mock user for testing
          if (process.env.NODE_ENV === "development") {
            console.log(
              "DEVELOPMENT MODE: Using mock auth credentials for testing",
            );
            return {
              id: "00000000-0000-0000-0000-000000000001",
              name: "Admin User",
              email: "admin@example.com",
              role: "super_admin",
              organizationId: "00000000-0000-0000-0000-000000000001",
            };
          }

          // In production, verify against database
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email));

          if (!user) {
            return null;
          }

          const passwordValid = await compare(
            credentials.password,
            user.password,
          );

          if (!passwordValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },
  },
};
