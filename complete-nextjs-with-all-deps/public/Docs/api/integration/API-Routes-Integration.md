# API Routes Integration

## Overview

This document provides comprehensive documentation for all API routes supporting the Event Data Management and Task Management systems, including authentication, validation, error handling, and integration patterns.

## Event Data Management API Routes

### Event Data Submissions

#### GET /api/event-data/submissions

**Purpose**: Retrieve event data submissions with filtering and pagination

**Authentication**: Required (JWT token)

**Query Parameters**:

```typescript
interface SubmissionQuery {
  organizationId?: string;
  agentId?: string;
  eventId?: string;
  status?:
    | "pending"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "needs_revision";
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  page?: number;
  limit?: number;
  sortBy?: "dueDate" | "submittedAt" | "createdAt";
  sortOrder?: "asc" | "desc";
}
```

**Response Format**:

```typescript
interface SubmissionResponse {
  submissions: EventDataSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    applied: object;
    available: object;
  };
}
```

**Implementation**:

```typescript
// app/api/event-data/submissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/server/storage";
import { validateOrganizationAccess } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");

    // Validate organization access
    await validateOrganizationAccess(session.user.id, organizationId);

    const filters = {
      organizationId,
      agentId: searchParams.get("agentId"),
      status: searchParams.get("status"),
      // ... additional filters
    };

    const submissions = await db.getEventDataSubmissions(filters);

    return NextResponse.json({
      submissions,
      pagination: {
        /* pagination data */
      },
      filters: {
        /* filter metadata */
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
```

#### POST /api/event-data/submissions

**Purpose**: Create new event data submission

**Authentication**: Required (Brand Agent, Field Manager, or Internal Admin)

**Request Body**:

```typescript
interface CreateSubmissionRequest {
  eventId: string;
  jotformUrl?: string;
  qualitativeData?: object;
  quantitativeData?: object;
  dueDate: string;
  instructions?: string;
}
```

**Response Format**:

```typescript
interface CreateSubmissionResponse {
  id: string;
  status: "pending";
  createdAt: string;
  dueDate: string;
  jotformUrl?: string;
}
```

#### PUT /api/event-data/submissions/[id]

**Purpose**: Update submission status and data

**Authentication**: Required (Role-based permissions)

**Request Body**:

```typescript
interface UpdateSubmissionRequest {
  status?: EventDataStatus;
  qualitativeData?: object;
  quantitativeData?: object;
  approvalNotes?: string;
  rejectionReason?: string;
}
```

### Event Photos Management

#### POST /api/event-data/photos

**Purpose**: Upload photos for event data submission

**Authentication**: Required

**Request Format**: Multipart form data with files and metadata

**Request Body**:

```typescript
interface PhotoUploadRequest {
  eventDataSubmissionId: string;
  type: "demo_table" | "shelf_image" | "additional_image";
  caption?: string;
  files: File[];
}
```

**Implementation**:

```typescript
// app/api/event-data/photos/route.ts
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const submissionId = formData.get("eventDataSubmissionId") as string;
    const type = formData.get("type") as PhotoType;

    // Validate file types and sizes
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type" },
          { status: 400 },
        );
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        return NextResponse.json({ error: "File too large" }, { status: 400 });
      }
    }

    // Process and store files
    const uploadResults = await Promise.all(
      files.map((file) => processPhotoUpload(file, submissionId, type)),
    );

    return NextResponse.json({ uploads: uploadResults });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

#### PUT /api/event-data/photos/[id]/approve

**Purpose**: Approve or reject individual photos

**Authentication**: Required (Field Manager or Internal Admin)

**Request Body**:

```typescript
interface PhotoApprovalRequest {
  isApproved: boolean;
  rejectionReason?: string;
  approvalNotes?: string;
}
```

## Task Management API Routes

### Task Operations

#### GET /api/tasks

**Purpose**: Retrieve tasks with comprehensive filtering

**Authentication**: Required

**Query Parameters**:

```typescript
interface TaskQuery {
  organizationId?: string;
  assignedTo?: string;
  assignedBy?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  eventId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}
```

**Response Format**:

```typescript
interface TaskResponse {
  tasks: Task[];
  pagination: PaginationData;
  aggregations: {
    statusCounts: Record<TaskStatus, number>;
    typeCounts: Record<TaskType, number>;
    priorityCounts: Record<TaskPriority, number>;
  };
}
```

#### POST /api/tasks

**Purpose**: Create new task assignment

**Authentication**: Required (Client User, Field Manager, or Internal Admin)

**Request Body**:

```typescript
interface CreateTaskRequest {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  assignedTo: string;
  organizationId: string;
  eventId?: string;
  dueDate: string;
  estimatedDuration?: number;
  instructions?: string;
  isRecurring?: boolean;
  recurringSchedule?: object;
  tags?: string[];
}
```

**Validation Rules**:

- Title: Required, 1-255 characters
- Due date: Must be in the future
- Assigned user: Must exist and belong to organization
- Type: Must be valid TaskType enum value

#### PUT /api/tasks/[id]

**Purpose**: Update task details and status

**Authentication**: Required (Assignee, Assigner, or Admin)

**Request Body**:

```typescript
interface UpdateTaskRequest {
  status?: TaskStatus;
  actualDuration?: number;
  submissionData?: object;
  reviewNotes?: string;
  completedAt?: string;
}
```

#### DELETE /api/tasks/[id]

**Purpose**: Cancel or remove task

**Authentication**: Required (Assigner or Admin)

**Business Rules**:

- Cannot delete completed tasks
- Must provide cancellation reason
- Automatic notification to assignee

### Specialized Task Endpoints

#### POST /api/tasks/mileage

**Purpose**: Submit mileage data for expense tracking

**Authentication**: Required

**Request Body**:

```typescript
interface MileageSubmissionRequest {
  taskId?: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  rate: number;
  receiptFile?: File;
  notes?: string;
}
```

**Response Format**:

```typescript
interface MileageSubmissionResponse {
  id: string;
  totalAmount: number;
  status: "submitted";
  submittedAt: string;
  approvalRequired: boolean;
}
```

#### POST /api/tasks/clock-events

**Purpose**: Record time tracking events

**Authentication**: Required

**Request Body**:

```typescript
interface ClockEventRequest {
  eventType: "clock_in" | "clock_out" | "break_start" | "break_end";
  taskId?: string;
  location?: string;
  coordinates?: { latitude: number; longitude: number };
  photoFile?: File;
  notes?: string;
}
```

**Validation**:

- GPS coordinates within reasonable bounds
- Photo file under 5MB
- No duplicate clock-in without clock-out

#### POST /api/tasks/[id]/comments

**Purpose**: Add comments to tasks

**Authentication**: Required

**Request Body**:

```typescript
interface TaskCommentRequest {
  comment: string;
  isInternal?: boolean;
  attachments?: File[];
}
```

## Authentication and Authorization

### JWT Token Validation

```typescript
// lib/auth.ts
export async function validateApiAccess(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new Error("No authorization token provided");
  }

  try {
    const payload = await verify(token, process.env.JWT_SECRET!);
    return payload as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
```

### Role-Based Access Control

```typescript
// lib/rbac.ts
export function validateTaskAccess(
  user: User,
  task: Task,
  action: "read" | "write" | "delete",
) {
  // Check organization membership
  if (task.organizationId !== user.currentOrganizationId) {
    throw new Error("Access denied: Different organization");
  }

  // Check role permissions
  switch (action) {
    case "read":
      return (
        task.assignedTo === user.id ||
        task.assignedBy === user.id ||
        ["internal_admin", "field_manager"].includes(user.role)
      );

    case "write":
      return (
        task.assignedTo === user.id ||
        task.assignedBy === user.id ||
        user.role === "internal_admin"
      );

    case "delete":
      return task.assignedBy === user.id || user.role === "internal_admin";
  }
}
```

## Data Validation

### Request Validation Middleware

```typescript
// lib/validation.ts
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum([
    "event_report",
    "mileage_submission",
    "clock_in_out",
    "training_required",
    "logistics_kit",
    "shadowing",
    "personnel_update",
    "photo_submission",
    "compliance_check",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignedTo: z.string().uuid(),
  dueDate: z.string().datetime(),
  estimatedDuration: z.number().min(1).optional(),
});

export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }
}
```

## Error Handling

### Standard Error Response Format

```typescript
interface ApiError {
  error: string;
  code?: string;
  details?: object;
  timestamp: string;
  path: string;
}
```

### Error Handler Middleware

```typescript
// lib/errorHandler.ts
export function handleApiError(error: unknown, request: NextRequest) {
  console.error("API Error:", error);

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.details,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
      { status: 400 },
    );
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        error: "Access denied",
        timestamp: new Date().toISOString(),
        path: request.url,
      },
      { status: 403 },
    );
  }

  return NextResponse.json(
    {
      error: "Internal server error",
      timestamp: new Date().toISOString(),
      path: request.url,
    },
    { status: 500 },
  );
}
```

## File Upload Handling

### Photo Processing Pipeline

```typescript
// lib/photoProcessing.ts
export async function processPhotoUpload(
  file: File,
  submissionId: string,
  type: PhotoType,
): Promise<PhotoUploadResult> {
  // 1. Validate file
  validatePhotoFile(file);

  // 2. Extract metadata
  const metadata = await extractPhotoMetadata(file);

  // 3. Resize and optimize
  const optimizedFile = await optimizePhoto(file);

  // 4. Store in cloud storage
  const filePath = await uploadToStorage(optimizedFile, submissionId, type);

  // 5. Save to database
  const photo = await db.createEventPhoto({
    eventDataSubmissionId: submissionId,
    type,
    fileName: file.name,
    filePath,
    fileSize: optimizedFile.size,
    mimeType: file.type,
    metadata,
  });

  return { id: photo.id, filePath, metadata };
}
```

## Caching Strategy

### Redis Integration

```typescript
// lib/cache.ts
export class ApiCache {
  private redis: Redis;

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: object, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage in API routes
export async function GET(request: NextRequest) {
  const cacheKey = `submissions:${organizationId}:${filters}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  const data = await fetchSubmissions(filters);
  await cache.set(cacheKey, data, 300); // 5 minutes

  return NextResponse.json(data);
}
```

## Rate Limiting

### API Rate Limiting

```typescript
// lib/rateLimiting.ts
export class RateLimiter {
  private limits = new Map<string, RateLimit>();

  async checkLimit(
    identifier: string,
    limit: number,
    window: number,
  ): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const current = await redis.get(key);

    if (!current) {
      await redis.setex(key, window, "1");
      return true;
    }

    const count = parseInt(current);
    if (count >= limit) {
      return false;
    }

    await redis.incr(key);
    return true;
  }
}

// Middleware usage
export async function middleware(request: NextRequest) {
  const identifier = getUserIdentifier(request);
  const allowed = await rateLimiter.checkLimit(identifier, 100, 3600);

  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  return NextResponse.next();
}
```

## Event Bus Integration

### Event Publishing

```typescript
// lib/eventBus.ts
export async function publishEvent(
  eventType: string,
  entityType: string,
  entityId: string,
  payload: object,
): Promise<void> {
  const event = {
    id: crypto.randomUUID(),
    eventType,
    entityType,
    entityId,
    payload,
    timestamp: new Date().toISOString(),
  };

  // Store in database
  await db.createSystemEvent(event);

  // Publish to message queue
  await messageQueue.publish("events", event);

  // Trigger webhooks
  await triggerWebhooks(eventType, event);
}

// Usage in API routes
export async function POST(request: NextRequest) {
  const task = await db.createTask(taskData);

  await publishEvent("task_assigned", "task", task.id, {
    taskId: task.id,
    assignedTo: task.assignedTo,
    assignedBy: task.assignedBy,
    dueDate: task.dueDate,
  });

  return NextResponse.json(task);
}
```

## Webhook Integration

### Jotform Webhook Handler

```typescript
// app/api/webhooks/jotform/route.ts
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-jotform-signature");
    const body = await request.text();

    // Verify webhook signature
    if (!verifyJotformSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);

    // Process form submission
    const submissionId = data.submissionID;
    const formData = data.rawRequest;

    // Update event data submission
    await db.updateEventDataSubmission(submissionId, {
      qualitativeData: extractQualitativeData(formData),
      quantitativeData: extractQuantitativeData(formData),
      status: "submitted",
      submittedAt: new Date(),
    });

    // Publish event
    await publishEvent("event_data_submitted", "submission", submissionId, {
      submissionId,
      agentId: data.agentId,
      eventId: data.eventId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Jotform webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
```

## Testing Strategy

### API Route Testing

```typescript
// __tests__/api/tasks.test.ts
import { POST } from "@/app/api/tasks/route";
import { createMockRequest } from "@/lib/testUtils";

describe("/api/tasks", () => {
  it("should create task with valid data", async () => {
    const request = createMockRequest("POST", {
      title: "Test Task",
      type: "event_report",
      priority: "medium",
      assignedTo: "user-123",
      dueDate: "2025-07-01T10:00:00Z",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe("Test Task");
    expect(data.status).toBe("assigned");
  });

  it("should reject invalid task data", async () => {
    const request = createMockRequest("POST", {
      title: "", // Invalid: empty title
      type: "invalid_type", // Invalid: bad enum value
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

## Monitoring and Observability

### API Metrics Collection

```typescript
// lib/metrics.ts
export class ApiMetrics {
  static async recordRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
  ): Promise<void> {
    await Promise.all([
      // Log to application metrics
      logger.info("api_request", {
        endpoint,
        method,
        statusCode,
        duration,
        timestamp: new Date().toISOString(),
      }),

      // Send to metrics service
      metricsService.increment("api_requests_total", {
        endpoint,
        method,
        status: statusCode.toString(),
      }),

      metricsService.histogram("api_request_duration", duration, {
        endpoint,
        method,
      }),
    ]);
  }
}
```

This comprehensive API documentation ensures complete integration of the Event Data and Task Management systems with proper authentication, validation, error handling, and monitoring capabilities.
