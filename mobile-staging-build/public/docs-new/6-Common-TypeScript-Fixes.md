# Common TypeScript Fixes

## Overview

This document provides examples of common TypeScript errors encountered in the project and how to fix them, with a focus on the most frequent issues related to date handling and database operations.

## Date Handling Errors

### Problem: Passing Date Objects to Database

```typescript
// ERROR: Type 'Date' is not assignable to type 'string | null | undefined'
await db.insert(users).values({
  birthDate: new Date(),
});
```

### Solution: Convert Date Objects to ISO Strings

```typescript
import { prepareDateForDB } from "@/shared/utils";

// FIXED: Convert Date to ISO string
await db.insert(users).values({
  birthDate: prepareDateForDB(new Date()),
});
```

## Type Mismatch in Database Operations

### Problem: Type Mismatch in Insert Operations

```typescript
// ERROR: Type '{ name: string; email: string; age: string; }' is not assignable to type 'InsertUser'
// 'age' is of type 'string', but 'InsertUser' expects 'number'
const userData = {
  name: "John Doe",
  email: "john@example.com",
  age: "30", // String instead of number
};

await db.insert(users).values(userData);
```

### Solution: Proper Type Conversion

```typescript
import { toNumber } from "@/shared/utils";

// FIXED: Convert age to number
const userData = {
  name: "John Doe",
  email: "john@example.com",
  age: toNumber("30") ?? 0, // Convert to number with fallback
};

await db.insert(users).values(userData);
```

## Nullable Fields

### Problem: Not Handling Nullable Fields

```typescript
// ERROR: Object is possibly 'null' or 'undefined'
function getFullName(user) {
  return `${user.firstName} ${user.middleName} ${user.lastName}`;
}
```

### Solution: Proper Null Checking

```typescript
// FIXED: Handle nullable fields with optional chaining and nullish coalescing
function getFullName(user) {
  return `${user.firstName} ${user.middleName ?? ""} ${user.lastName}`;
}
```

## Array Type Errors

### Problem: Incorrect Array Type Handling

```typescript
// ERROR: Type 'string' is not assignable to type 'string[]'
await db.insert(products).values({
  tags: "tag1,tag2", // String instead of array
});
```

### Solution: Proper Array Handling

```typescript
// FIXED: Ensure tags is an array
const tags =
  typeof incomingTags === "string"
    ? incomingTags.split(",")
    : Array.isArray(incomingTags)
      ? incomingTags
      : [];

await db.insert(products).values({
  tags,
});
```

## Function Parameter Types

### Problem: Missing Parameter Types

```typescript
// ERROR: Parameter 'data' implicitly has an 'any' type
function processData(data) {
  return data.items.map((item) => item.id);
}
```

### Solution: Add Explicit Type Annotations

```typescript
// FIXED: Add explicit type annotation
interface DataWithItems {
  items: Array<{ id: string }>;
}

function processData(data: DataWithItems) {
  return data.items.map((item) => item.id);
}
```

## Type Narrowing

### Problem: Incorrect Type Narrowing

```typescript
// ERROR: Property 'method' does not exist on type 'string | Request'
function handleInput(input: string | Request) {
  if (input.method === "GET") {
    // Error: 'method' doesn't exist on string
    // Handle request
  }
}
```

### Solution: Proper Type Guards

```typescript
// FIXED: Use type guard for proper type narrowing
function handleInput(input: string | Request) {
  if (typeof input !== "string" && input.method === "GET") {
    // Handle request
  }
}
```

## Return Type Mismatches

### Problem: Inconsistent Return Types

```typescript
// ERROR: Function lacks ending return statement and return type does not include 'undefined'
async function getUserById(id: string): Promise<User> {
  const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (user.length > 0) {
    return user[0];
  }
  // Missing return here
}
```

### Solution: Consistent Return Types

```typescript
// FIXED: Make return type nullable and ensure all paths return a value
async function getUserById(id: string): Promise<User | null> {
  const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (user.length > 0) {
    return user[0];
  }
  return null; // Explicit return for all paths
}
```

## Promise Handling

### Problem: Improper Promise Handling

```typescript
// ERROR: Property 'then' does not exist on type 'void'
function processUserData(userId: string) {
  fetchUser(userId).then((user) => {
    console.log(user);
  });
}

// The fetchUser function doesn't return a Promise
function fetchUser(id: string) {
  db.select().from(users).where(eq(users.id, id));
  // Missing return statement
}
```

### Solution: Proper Promise Returns

```typescript
// FIXED: Return the Promise
async function fetchUser(id: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

// Now this works
function processUserData(userId: string) {
  fetchUser(userId).then((user) => {
    console.log(user);
  });
}
```

## Using Type Assertions Safely

### Problem: Unsafe Type Assertions

```typescript
// DANGEROUS: Blindly asserting types
const user = JSON.parse(data) as User; // Could be anything
```

### Solution: Validate Before Asserting

```typescript
// FIXED: Validate with Zod before asserting
import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

try {
  const userData = JSON.parse(data);
  const user = userSchema.parse(userData); // Validated user
  // Safe to use user here
} catch (error) {
  console.error("Invalid user data:", error);
}
```

## Object Property Access

### Problem: Accessing Properties of Unknown Types

```typescript
// ERROR: Property 'name' does not exist on type 'unknown'
function displayName(data: unknown) {
  return `Hello, ${data.name}`;
}
```

### Solution: Type Guards and Property Checking

```typescript
// FIXED: Use type guards and property checking
function displayName(data: unknown) {
  if (
    data &&
    typeof data === "object" &&
    "name" in data &&
    typeof data.name === "string"
  ) {
    return `Hello, ${data.name}`;
  }
  return "Hello, Guest";
}
```

## Generic Function Types

### Problem: Missing Generic Type Constraints

```typescript
// ERROR: Property 'id' does not exist on type 'T'
function getEntityId<T>(entity: T) {
  return entity.id; // Error: 'id' might not exist on T
}
```

### Solution: Add Type Constraints

```typescript
// FIXED: Add constraints to generic type
function getEntityId<T extends { id: string }>(entity: T) {
  return entity.id; // Now safe to access id
}
```

## TypeScript Configuration Fixes

If you're encountering multiple TypeScript errors, sometimes adjusting the TypeScript configuration can help:

```json
// tsconfig.json adjustments for specific issues
{
  "compilerOptions": {
    // If you need to temporarily allow implicit any types during migration
    "noImplicitAny": false,

    // If you're having issues with null checking
    "strictNullChecks": true,

    // If you need to temporarily disable strict checking during migration
    "strict": false,

    // If you're having issues with class property initialization
    "strictPropertyInitialization": false
  }
}
```

However, it's generally better to fix the underlying issues rather than disabling these checks.
