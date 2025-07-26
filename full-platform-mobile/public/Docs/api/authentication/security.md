# API Security Documentation

## Overview

This guide covers security best practices and implementation details for API endpoints in the Rishi Platform.

## Authentication

### JWT Token Authentication

```typescript
// API route protection
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyJWT(token);
    // Process authenticated request
    return Response.json({ data: payload });
  } catch (error) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}
```

### API Key Authentication

```typescript
export async function validateAPIKey(request: Request): Promise<boolean> {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return false;
  }

  // Verify API key against database
  const keyRecord = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.key, apiKey))
    .limit(1);

  return keyRecord.length > 0 && keyRecord[0].isActive;
}
```

## Authorization

### Role-Based Access Control

```typescript
export function requireRole(allowedRoles: string[]) {
  return async (request: Request, user: AuthenticatedUser) => {
    if (!allowedRoles.includes(user.role)) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }
  };
}

export function requirePermission(permission: string) {
  return async (request: Request, user: AuthenticatedUser) => {
    const hasPermission = await checkUserPermission(user.id, permission);

    if (!hasPermission) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }
  };
}
```

## Input Validation

### Request Validation Middleware

```typescript
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: Request): Promise<T> => {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError("Invalid request data", error.errors);
      }
      throw error;
    }
  };
}
```

### SQL Injection Prevention

```typescript
// Good: Using parameterized queries
export async function getEventsByLocation(locationId: string) {
  return db.select().from(events).where(eq(events.locationId, locationId));
}

// Good: Multiple parameters with proper escaping
export async function searchEvents(query: string, organizationId: string) {
  return db
    .select()
    .from(events)
    .where(
      and(
        ilike(events.name, `%${query}%`),
        eq(events.organizationId, organizationId),
      ),
    );
}
```

## Rate Limiting

### Request Rate Limiting

```typescript
export class RateLimiter {
  private requests = new Map<string, number[]>();

  checkLimit(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter((time) => time > windowStart);

    if (recentRequests.length >= limit) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }
}

// Usage in API route
export async function POST(request: Request) {
  const clientIP = request.headers.get("x-forwarded-for") || "unknown";

  if (!rateLimiter.checkLimit(clientIP, 100, 60000)) {
    // 100 requests per minute
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Process request
}
```

## CORS Configuration

### CORS Headers

```typescript
export function setCORSHeaders(response: Response): Response {
  response.headers.set("Access-Control-Allow-Origin", "https://yourdomain.com");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}
```

## Error Handling

### Secure Error Responses

```typescript
export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
  }
}

export function handleAPIError(error: unknown): Response {
  if (error instanceof APIError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode },
    );
  }

  // Don't expose internal errors
  console.error("Internal API error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
```

## API Monitoring

### Request Logging

```typescript
export function logAPIRequest(
  request: Request,
  response: Response,
  duration: number,
) {
  const logEntry = {
    method: request.method,
    url: request.url,
    status: response.status,
    duration,
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("x-forwarded-for"),
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(logEntry));
}
```

## Security Headers

### Security Headers Middleware

```typescript
export function addSecurityHeaders(response: Response): Response {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'",
  );

  return response;
}
```

## API Documentation

### OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: Rishi Platform API
  version: 1.0.0
  description: API for workforce management platform

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

paths:
  /api/events:
    get:
      summary: List events
      security:
        - BearerAuth: []
      parameters:
        - name: organizationId
          in: query
          required: true
          schema:
            type: string
      responses:
        "200":
          description: List of events
        "401":
          description: Authentication required
        "403":
          description: Insufficient permissions
```

## Testing Security

### Security Test Cases

```typescript
describe("API Security", () => {
  test("should reject requests without authentication", async () => {
    const response = await fetch("/api/events");
    expect(response.status).toBe(401);
  });

  test("should reject requests with invalid tokens", async () => {
    const response = await fetch("/api/events", {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });
    expect(response.status).toBe(401);
  });

  test("should reject requests without required permissions", async () => {
    const token = await getTestToken({ role: "user" });
    const response = await fetch("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.status).toBe(403);
  });
});
```

## Best Practices

### Security Checklist

- [ ] All endpoints require authentication
- [ ] Input validation on all user data
- [ ] SQL injection prevention
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Error messages don't expose sensitive data
- [ ] API keys are securely stored
- [ ] Audit logging is enabled

### Performance Security

- Use connection pooling for database
- Implement response caching where appropriate
- Monitor API performance metrics
- Set up alerts for unusual activity

## Related Documentation

- [Authentication System](../auth/README.md)
- [RBAC System](../rbac/README.md)
- [Input Validation](../development-guides/input-validation.md)
