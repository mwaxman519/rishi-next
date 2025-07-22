# Next.js API Architecture for Rishi Platform

## Overview

This document outlines the architecture for the Rishi Enterprise Authentication Platform, designed to be deployed on Azure Static Apps with Next.js and Neon PostgreSQL. Instead of using microservices in separate repositories, we'll implement a modular monolith approach using Next.js API routes to maintain separation of concerns.

## Architecture Components

### 1. Next.js as the Application Framework

- **App Router**: Used for frontend routing and rendering
- **API Routes**: Used to create service-like endpoints for different functional domains
- **Middleware**: Used for cross-cutting concerns like authentication and request logging

### 2. Folder Structure

```
app/
  ├── api/  # API routes organized by domain
  │   ├── auth/  # Authentication-related endpoints
  │   │   ├── register.ts
  │   │   ├── login.ts
  │   │   ├── logout.ts
  │   │   └── validate.ts
  │   ├── users/  # User management endpoints
  │   │   ├── [id].ts
  │   │   ├── index.ts
  │   │   └── profile/[id].ts
  │   ├── access/  # Access control endpoints
  │   │   ├── roles.ts
  │   │   ├── permissions.ts
  │   │   └── check.ts
  │   └── notifications/  # Notification endpoints
  ├── (auth)/  # Authentication-related pages
  ├── dashboard/  # Dashboard pages
  ├── components/  # Shared components
  ├── lib/  # Utilities and shared logic
  │   ├── db/  # Database utilities
  │   │   ├── schema.ts  # Drizzle schema
  │   │   └── index.ts  # Database connection
  │   ├── auth/  # Authentication utilities
  │   ├── api/  # API utilities
  │   └── utils/  # General utilities
```

### 3. Domain-Specific Modules

Each domain will have:

- API route handlers for specific functionality
- Database models and queries
- Business logic
- Type definitions

### 4. Database Integration with Neon PostgreSQL

- Use Drizzle ORM for type-safe database operations
- Schema definitions for each domain
- Connection pooling optimized for serverless environment

### 5. Authentication and Authorization

- JWT-based authentication implemented via Next.js middleware
- Role-based access control
- Session management using secure cookies

## Implementation Approach

### 1. Data Models

Define core data models in a centralized schema.ts file:

```typescript
// lib/db/schema.ts
import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Profile model
export const profiles = pgTable("profiles", {
  userId: serial("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  department: varchar("department", { length: 100 }),
});

// Define relationships
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));
```

### 2. API Routes

Implement domain-specific API routes:

```typescript
// app/api/auth/login.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { comparePasswords, signJwt } from "@/lib/auth/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user || !(await comparePasswords(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = await signJwt({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Server error during login" },
      { status: 500 },
    );
  }
}
```

### 3. Authentication Middleware

Create middleware for authentication:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "./lib/auth/utils";

export async function middleware(request: NextRequest) {
  // Protected routes that require authentication
  const protectedPaths = ["/dashboard", "/api/users", "/api/access"];

  // Check if the request path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Get the token from the cookies
  const token = request.cookies.get("token")?.value;

  if (!token) {
    // Redirect to login for page requests
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Return 401 for API requests
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify the token
    const verifiedToken = await verifyJwt(token);

    // Add user info to headers for API routes to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", verifiedToken.id.toString());
    requestHeaders.set("x-user-role", verifiedToken.role);

    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    // Token is invalid, redirect or return 401
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

## Benefits of This Approach

1. **Deployment Compatibility**: Works with Azure Static Apps
2. **Simplified Architecture**: Single codebase instead of multiple repositories
3. **Separation of Concerns**: Maintains logical separation of domains
4. **Type Safety**: Shared types between frontend and API
5. **Easier Development**: No need to run multiple services locally
6. **Performance**: Reduced network hops compared to true microservices

## Next Steps

1. Set up Neon PostgreSQL connection
2. Implement basic API routes
3. Create authentication middleware
4. Develop frontend components
5. Test end-to-end functionality

This architecture provides the foundation for building a scalable, maintainable enterprise authentication platform while being compatible with Azure Static Apps deployment.
