# TypeScript Guidelines for Next.js Project

## General TypeScript Guidelines

### 1. Use Strict Type Checking

Always enable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### 2. Avoid Type Assertions When Possible

Avoid using type assertions (`as Type`) unless absolutely necessary:

```typescript
// Bad
const user = someValue as User;

// Good
if (isUser(someValue)) {
  const user = someValue; // Already typed as User
}
```

### 3. Use Type Guards

Create custom type guards for complex types:

```typescript
function isUser(value: any): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}
```

### 4. Properly Type API Responses

Ensure API responses are properly typed:

```typescript
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return (await response.json()) as User;
}
```

### 5. Use the TypeScript Utility Types

Make use of TypeScript's built-in utility types:

```typescript
type UserWithoutPassword = Omit<User, "password">;
type UserResponse = Pick<User, "id" | "name" | "email">;
type PartialUser = Partial<User>;
```

## Next.js Specific Guidelines

### 1. Type Next.js Pages and API Routes

```typescript
// For pages
import type { NextPage } from 'next';

const HomePage: NextPage = () => {
  return <div>Home Page</div>;
};

export default HomePage;

// For API routes
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  // Handler implementation
}
```

### 2. Type App Router Components

```typescript
// For server components
export default async function PageName() {
  // Component implementation
}

// For client components
("use client");

import { useState } from "react";

export default function ClientComponent() {
  const [state, setState] = useState<string>("");
  // Component implementation
}
```

### 3. Type getServerSideProps and getStaticProps

```typescript
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const getServerSideProps: GetServerSideProps<{
  data: SomeType;
}> = async (context) => {
  // Implementation
  return {
    props: {
      data: someData,
    },
  };
};

const Page = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // Page implementation
};
```

### 4. Type React Props and State

```typescript
type ButtonProps = {
  text: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

function Button({ text, onClick, variant = "primary" }: ButtonProps) {
  // Component implementation
}
```

## Database Schema and Drizzle Guidelines

### 1. Define Schema Types

```typescript
// In schema.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create Zod schema for insertion
export const insertUserSchema = createInsertSchema(users).omit({ id: true });

// Create types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
```

### 2. Type Database Queries

```typescript
// In storage.ts
export async function getUser(id: number): Promise<User | null> {
  try {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}
```

### 3. Date Handling

Use utility functions from `shared/utils.ts` for consistent date handling:

```typescript
import { toDate, toISOString } from "@/shared/utils";

// Convert to Date object
const date = toDate(userInput.date);

// Convert to ISO string
const isoString = toISOString(date);
```

## Common TypeScript Issues and Fixes

### 1. Null/Undefined Handling

```typescript
// Use nullish coalescing operator
const name = user?.name ?? "Unknown";

// Use optional chaining
const address = user?.address?.street;
```

### 2. Array Type Safety

```typescript
// Safely handle potentially undefined arrays
const items: Item[] = data.items ?? [];

// Type guard for arrays
if (Array.isArray(data.items)) {
  data.items.forEach((item) => {
    // Safe to use as item[]
  });
}
```

### 3. Async/Promise Handling

```typescript
// Properly type async functions
async function fetchData(): Promise<DataType> {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) throw new Error("Failed to fetch");
    return (await response.json()) as DataType;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
```

### 4. Event Handlers

```typescript
// Type event handlers properly
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // Submit logic
};
```

## Recommended TypeScript Workflow

1. Run type checks before commits with `./check-types.sh`
2. Regularly update TypeScript version to get the latest features and fixes
3. Use the VS Code TypeScript plugin for real-time type checking
4. Document complex types with JSDoc comments
5. Use the shared utility functions in `shared/utils.ts` for common type conversions
