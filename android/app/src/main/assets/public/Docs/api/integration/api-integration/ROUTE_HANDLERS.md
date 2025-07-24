# Next.js API Route Handler Best Practices

This document outlines best practices and common issues with Next.js API route handlers as implemented in the Rishi platform.

## Route Handler Structure

### Basic Structure

```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Handle the request
    return NextResponse.json({ data: "Success" });
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
```

### Dynamic Routes

```typescript
// app/api/resource/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // IMPORTANT: In Next.js 14+, use destructuring to safely access params
    const { id } = params;

    // Now use the id parameter
    return NextResponse.json({ id });
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
```

## Common Issues and Solutions

### 1. Params Usage

**Issue**: `params.id` is used directly without proper handling, leading to sync-dynamic-apis errors.

**Incorrect**:

```typescript
const locationId = params.id; // ERROR: Route used `params.id` without awaiting
```

**Correct**:

```typescript
const { id: locationId } = params; // Destructure to correctly access params
```

### 2. Database Method Mismatch

**Issue**: Using a database method that doesn't exist or has a different signature than expected.

**Typical Error**: `TypeError: db.location.findUnique is not a function`

**Solution**: Check the available methods in the database implementation and use the correct one:

```typescript
// If using a mock implementation for development
const location = await db.location.findById(locationId); // Correct

// For a production Prisma/Drizzle implementation
const location = await db.location.findUnique({
  // Correct for ORM
  where: { id: locationId },
});
```

### 3. Database Update Method Parameter Structure

**Issue**: Update method parameter structure differs between implementations.

**Mock Database Example**:

```typescript
// Mock implementation often uses separate parameters
const updatedLocation = await db.location.update(
  locationId, // ID as first parameter
  {
    status: "active",
    approved: true,
    // other fields to update
  },
);
```

**ORM Example**:

```typescript
// ORM implementations often use a single object parameter
const updatedLocation = await db.location.update({
  where: { id: locationId },
  data: {
    status: "active",
    approved: true,
    // other fields to update
  },
});
```

### 4. Error Handling and Logging

**Best Practice**: Provide detailed error handling with proper logging and client-safe error messages:

```typescript
try {
  // Database operations
} catch (dbError) {
  console.error("Database error:", dbError);

  // Log detailed error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("Full error details:", dbError);
  }

  // Return sanitized error to client
  return NextResponse.json(
    { error: "Database operation failed" },
    { status: 500 },
  );
}
```

### 5. Validation

**Best Practice**: Always validate input parameters before using them:

```typescript
// Validate that the ID matches expected format
if (
  !id ||
  !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
) {
  return NextResponse.json(
    { error: "Invalid resource ID format" },
    { status: 400 },
  );
}
```

## Event Integration

When working with events in route handlers:

```typescript
// Make sure to provide fallbacks for all required fields
await publishLocationApprovedEvent({
  locationId: updatedLocation.id,
  name: updatedLocation.name || "Unknown location",
  approvedById: user.id,
  approvedByName: user.fullName || user.username || "Unknown user",
  approvedAt: updatedLocation.approvedAt || new Date().toISOString(),
  submittedById: updatedLocation.createdById || "unknown",
});
```

## Client-Side Integration

For optimal client-side error handling:

```typescript
async function handleApiCall() {
  try {
    const response = await fetch("/api/resource", options);

    // Log the raw response for debugging
    console.log("API response status:", response.status);

    // Read the response as text first for flexible handling
    const responseText = await response.text();
    console.log("API response body:", responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
    }

    // Handle non-success responses
    if (!response.ok) {
      const errorMsg = data?.error || "Failed to complete operation";
      throw new Error(errorMsg);
    }

    // Use the data
    return data;
  } catch (err) {
    console.error("API request error:", err);
    throw err;
  }
}
```

## Testing API Routes

To test API routes, use the `/api/debug` endpoints or create a custom test client:

```typescript
// app/api/healthcheck/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const routeToTest = url.searchParams.get("route") || "";
  const method = url.searchParams.get("method") || "GET";

  if (!routeToTest) {
    return NextResponse.json(
      { error: "Missing route parameter" },
      { status: 400 },
    );
  }

  try {
    const testUrl = `${url.origin}${routeToTest}`;
    console.log(`Testing ${method} ${testUrl}`);

    const response = await fetch(testUrl, { method });
    const data = await response.text();

    return NextResponse.json({
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    });
  } catch (error) {
    console.error("Test failed:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}
```
