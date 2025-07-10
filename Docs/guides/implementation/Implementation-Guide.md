# Implementation Guide - Event Data & Task Management Systems

## Overview

This guide provides step-by-step implementation instructions for the comprehensive Event Data Management and Task Management systems integrated into the workforce management platform. This implementation transforms the previous "Submit Reports" functionality into a sophisticated Jotform-integrated event data collection system with multi-photo approval workflows.

## Prerequisites

### Environment Setup

- Next.js 15.3.2 with App Router
- PostgreSQL database (Neon serverless recommended)
- Drizzle ORM for database operations
- JWT-based authentication system
- Role-based access control (RBAC) implementation

### Required Dependencies

```bash
npm install @hookform/resolvers zod react-hook-form
npm install @tanstack/react-query
npm install lucide-react
npm install @radix-ui/react-tabs @radix-ui/react-dialog
```

## Database Implementation

### Step 1: Schema Migration

Execute the database schema changes to add the new tables:

```sql
-- Create enums
CREATE TYPE event_data_status AS ENUM (
  'pending', 'submitted', 'under_review', 'approved', 'rejected', 'needs_revision'
);

CREATE TYPE photo_type AS ENUM (
  'demo_table', 'shelf_image', 'additional_image'
);

CREATE TYPE task_type AS ENUM (
  'event_report', 'mileage_submission', 'clock_in_out', 'training_required',
  'logistics_kit', 'shadowing', 'personnel_update', 'photo_submission', 'compliance_check'
);

CREATE TYPE task_status AS ENUM (
  'assigned', 'in_progress', 'completed', 'overdue', 'cancelled'
);

CREATE TYPE task_priority AS ENUM (
  'low', 'medium', 'high', 'urgent'
);

CREATE TYPE clock_event_type AS ENUM (
  'clock_in', 'clock_out', 'break_start', 'break_end'
);

-- Create tables (see Database-Schema-Integration.md for complete table definitions)
```

### Step 2: Drizzle Configuration

Update the Drizzle schema file with the new table definitions:

```typescript
// shared/schema.ts - Add to existing schema
export const eventDataSubmissions = pgTable("event_data_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .references(() => events.id)
    .notNull(),
  agentId: uuid("agent_id")
    .references(() => users.id)
    .notNull(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  status: eventDataStatusEnum("status").default("pending").notNull(),
  jotformSubmissionId: varchar("jotform_submission_id", { length: 100 }),
  jotformUrl: text("jotform_url"),
  qualitativeData: jsonb("qualitative_data"),
  quantitativeData: jsonb("quantitative_data"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  approvalNotes: text("approval_notes"),
  rejectionReason: text("rejection_reason"),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Step 3: Run Database Migration

```bash
npm run db:push
```

## Frontend Implementation

### Step 1: Navigation Integration

Update the navigation structure to include the Event Data link:

```typescript
// shared/navigation-structure.tsx
const FIELD_MANAGER_NAV = [
  // ... existing navigation items
  {
    id: "event-data",
    name: "Event Data",
    href: "/event-data",
    icon: FileText,
    description: "Manage event data submissions and photo approvals",
  },
  // ... rest of navigation
];

const BRAND_AGENT_NAV = [
  // ... existing navigation items
  {
    id: "event-data",
    name: "Event Data",
    href: "/event-data",
    icon: FileText,
    description: "Submit event reports and photo documentation",
  },
  // ... rest of navigation
];
```

### Step 2: Event Data Page Implementation

The main Event Data page has been implemented at `app/event-data/page.tsx` with:

- **Comprehensive Dashboard**: Status overview cards showing missing, submitted, under review, and completed submissions
- **Advanced Filtering**: Search by event name, location, agent, with status and date filters
- **Tabbed Interface**: Organized views for different submission states
- **Empty State Handling**: Clear messaging when no data is available with proper integration guidance

### Step 3: Task Management Enhancement

The enhanced Task Management page at `app/tasks/page.tsx` includes:

- **Multi-Role Assignment**: Support for Client Users, Field Managers, and Internal Admins
- **Comprehensive Task Types**: Nine different task types covering all operational needs
- **Advanced Filtering**: Filter by type, priority, status, and search across multiple fields
- **Real-time Updates**: Live status synchronization and progress tracking

## API Route Implementation

### Step 1: Event Data API Routes

Create the API routes for event data management:

```typescript
// app/api/event-data/submissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/server/storage";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get("organizationId");

  // Implementation details in API-Routes-Integration.md
}

export async function POST(request: NextRequest) {
  // Create new event data submission
  // Implementation details in API-Routes-Integration.md
}
```

### Step 2: Task Management API Routes

Create comprehensive task management endpoints:

```typescript
// app/api/tasks/route.ts
export async function GET(request: NextRequest) {
  // Fetch tasks with filtering
}

export async function POST(request: NextRequest) {
  // Create new task assignment
}

// app/api/tasks/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // Update task status and details
}
```

### Step 3: Specialized Task Endpoints

Implement specialized endpoints for different task types:

```typescript
// app/api/tasks/mileage/route.ts
export async function POST(request: NextRequest) {
  // Handle mileage submissions
}

// app/api/tasks/clock-events/route.ts
export async function POST(request: NextRequest) {
  // Handle time tracking events
}
```

## Storage Layer Implementation

### Step 1: Database Storage Interface

Update the storage interface to support the new functionality:

```typescript
// server/storage.ts
export interface IStorage {
  // Existing methods...

  // Event Data Management
  getEventDataSubmissions(
    filters: SubmissionFilters,
  ): Promise<EventDataSubmission[]>;
  createEventDataSubmission(
    data: InsertEventDataSubmission,
  ): Promise<EventDataSubmission>;
  updateEventDataSubmission(
    id: string,
    data: Partial<EventDataSubmission>,
  ): Promise<EventDataSubmission>;

  // Photo Management
  createEventPhoto(data: InsertEventPhoto): Promise<EventPhoto>;
  updateEventPhotoApproval(
    id: string,
    approved: boolean,
    reason?: string,
  ): Promise<EventPhoto>;

  // Task Management
  getTasks(filters: TaskFilters): Promise<Task[]>;
  createTask(data: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<Task>): Promise<Task>;

  // Specialized Task Operations
  createMileageSubmission(
    data: InsertMileageSubmission,
  ): Promise<MileageSubmission>;
  createClockEvent(data: InsertClockEvent): Promise<ClockEvent>;
  addTaskComment(data: InsertTaskComment): Promise<TaskComment>;
}
```

### Step 2: PostgreSQL Implementation

Implement the storage methods using Drizzle ORM:

```typescript
// server/storage.ts - Add to existing PostgreSQLStorage class
async getEventDataSubmissions(filters: SubmissionFilters): Promise<EventDataSubmission[]> {
  let query = this.db
    .select()
    .from(eventDataSubmissions)
    .leftJoin(events, eq(eventDataSubmissions.eventId, events.id))
    .leftJoin(users, eq(eventDataSubmissions.agentId, users.id));

  if (filters.organizationId) {
    query = query.where(eq(eventDataSubmissions.organizationId, filters.organizationId));
  }

  if (filters.status) {
    query = query.where(eq(eventDataSubmissions.status, filters.status));
  }

  if (filters.dateFrom && filters.dateTo) {
    query = query.where(
      and(
        gte(eventDataSubmissions.dueDate, filters.dateFrom),
        lte(eventDataSubmissions.dueDate, filters.dateTo)
      )
    );
  }

  return await query;
}

async createTask(data: InsertTask): Promise<Task> {
  const [task] = await this.db.insert(tasks).values(data).returning();

  // Publish event for real-time updates
  await this.publishEvent('task_assigned', 'task', task.id, {
    assignedTo: task.assignedTo,
    assignedBy: task.assignedBy,
    type: task.type,
    priority: task.priority,
  });

  return task;
}
```

## Jotform Integration

### Step 1: Webhook Configuration

Set up Jotform webhooks to automatically process form submissions:

```typescript
// app/api/webhooks/jotform/route.ts
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-jotform-signature");
  const body = await request.text();

  // Verify webhook signature
  if (!verifyJotformSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const data = JSON.parse(body);

  // Process form submission
  await processJotformSubmission(data);

  return NextResponse.json({ success: true });
}
```

### Step 2: Form Embedding

Create reusable Jotform embedding components:

```typescript
// components/JotformEmbed.tsx
export const JotformEmbed: React.FC<JotformEmbedProps> = ({
  formId,
  submissionId,
  prefillData,
  onSubmissionComplete,
}) => {
  // Implementation details in Frontend-Component-Integration.md
};
```

## Event-Driven Architecture Integration

### Step 1: Event Bus Setup

Configure the event bus for real-time updates:

```typescript
// lib/eventBus.ts
export class EventBus {
  async publish(
    eventType: string,
    entityType: string,
    entityId: string,
    payload: object,
  ) {
    // Store in database
    await db.insert(systemEvents).values({
      eventType,
      entityType,
      entityId,
      payload,
    });

    // Publish to WebSocket clients
    await this.websocketServer.broadcast({
      type: eventType,
      entity: { type: entityType, id: entityId },
      data: payload,
    });

    // Trigger webhooks
    await this.triggerWebhooks(eventType, payload);
  }
}
```

### Step 2: Real-time Updates

Implement WebSocket integration for live updates:

```typescript
// hooks/useRealTimeUpdates.ts
export function useRealTimeUpdates(organizationId: string) {
  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/updates`);

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);

      // Update React Query cache based on event type
      if (type === "task_updated") {
        queryClient.setQueryData(["tasks", organizationId], (old: Task[]) =>
          old.map((task) =>
            task.id === data.id ? { ...task, ...data } : task,
          ),
        );
      }
    };

    return () => ws.close();
  }, [organizationId]);
}
```

## Security Implementation

### Step 1: Authentication Middleware

Ensure all API routes are properly secured:

```typescript
// lib/auth.ts
export async function withAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Add user context to request
    request.user = session.user;

    return handler(request, ...args);
  };
}
```

### Step 2: Role-Based Access Control

Implement granular permissions:

```typescript
// lib/rbac.ts
export function hasPermission(
  user: User,
  resource: string,
  action: string,
  context?: object,
): boolean {
  const permissions = getUserPermissions(user);

  return permissions.some(
    (permission) =>
      permission.resource === resource &&
      permission.action === action &&
      matchesContext(permission.context, context),
  );
}
```

## File Upload Implementation

### Step 1: Photo Processing Pipeline

Set up comprehensive photo processing:

```typescript
// lib/photoProcessing.ts
export async function processPhotoUpload(
  file: File,
  submissionId: string,
  type: PhotoType,
): Promise<PhotoUploadResult> {
  // 1. Validate file
  validatePhotoFile(file);

  // 2. Extract metadata (EXIF, location, etc.)
  const metadata = await extractPhotoMetadata(file);

  // 3. Resize and optimize
  const optimizedFile = await optimizePhoto(file);

  // 4. Store in cloud storage
  const filePath = await uploadToCloudStorage(optimizedFile);

  // 5. Save to database
  const photo = await db
    .insert(eventPhotos)
    .values({
      eventDataSubmissionId: submissionId,
      type,
      fileName: file.name,
      filePath,
      fileSize: optimizedFile.size,
      mimeType: file.type,
      metadata,
    })
    .returning();

  return { id: photo[0].id, filePath, metadata };
}
```

## Testing Implementation

### Step 1: API Route Testing

Create comprehensive test coverage:

```typescript
// __tests__/api/event-data.test.ts
describe("/api/event-data/submissions", () => {
  it("should fetch submissions with filters", async () => {
    const request = createMockRequest("GET", null, {
      organizationId: "org-123",
      status: "pending",
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.submissions).toBeDefined();
    expect(data.pagination).toBeDefined();
  });

  it("should create new submission", async () => {
    const submissionData = {
      eventId: "event-123",
      dueDate: "2025-07-01T18:00:00Z",
      jotformUrl: "https://form.jotform.com/123456",
    };

    const request = createMockRequest("POST", submissionData);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.status).toBe("pending");
  });
});
```

### Step 2: Component Testing

Test React components with proper mocking:

```typescript
// __tests__/components/EventDataPage.test.tsx
describe('EventDataPage', () => {
  it('should render submission cards', () => {
    const mockSubmissions = [
      {
        id: '1',
        eventName: 'Test Event',
        status: 'pending',
        agentName: 'Test Agent',
        // ... other props
      }
    ];

    render(
      <EventDataPage
        initialSubmissions={mockSubmissions}
        userRole="field_manager"
        organizationId="org-123"
      />
    );

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});
```

## Performance Optimization

### Step 1: Caching Strategy

Implement intelligent caching:

```typescript
// lib/cache.ts
export class CacheManager {
  async getCachedSubmissions(
    key: string,
  ): Promise<EventDataSubmission[] | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setCachedSubmissions(
    key: string,
    data: EventDataSubmission[],
    ttl: number = 300,
  ): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(data));
  }

  async invalidateSubmissionCache(organizationId: string): Promise<void> {
    const pattern = `submissions:${organizationId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

### Step 2: Database Optimization

Add proper indexes for performance:

```sql
-- Critical indexes for performance
CREATE INDEX CONCURRENTLY idx_event_data_submissions_org_status
ON event_data_submissions(organization_id, status);

CREATE INDEX CONCURRENTLY idx_event_data_submissions_due_date
ON event_data_submissions(due_date) WHERE status != 'completed';

CREATE INDEX CONCURRENTLY idx_tasks_assigned_to_status
ON tasks(assigned_to, status);

CREATE INDEX CONCURRENTLY idx_tasks_organization_type
ON tasks(organization_id, type, status);
```

## Deployment Considerations

### Step 1: Environment Variables

Set up required environment variables:

```env
# Jotform Integration
JOTFORM_API_KEY=your_jotform_api_key
JOTFORM_WEBHOOK_SECRET=your_webhook_secret

# File Upload
CLOUDINARY_URL=your_cloudinary_url
UPLOAD_MAX_SIZE=10485760  # 10MB

# Real-time Updates
WEBSOCKET_URL=wss://your-websocket-server

# Event Bus
REDIS_URL=your_redis_url
```

### Step 2: Production Checklist

- [ ] Database migrations executed
- [ ] All environment variables configured
- [ ] File upload storage configured
- [ ] Webhook endpoints secured
- [ ] Performance monitoring enabled
- [ ] Error tracking configured
- [ ] Backup procedures verified

## Monitoring and Maintenance

### Step 1: Application Monitoring

Set up comprehensive monitoring:

```typescript
// lib/monitoring.ts
export class ApplicationMonitor {
  async recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>,
  ) {
    await metricsService.gauge(name, value, tags);
  }

  async recordError(error: Error, context?: object) {
    await errorTrackingService.captureException(error, context);
  }

  async recordAPICall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
  ) {
    await this.recordMetric("api_request_duration", duration, {
      endpoint,
      method,
      status: status.toString(),
    });
  }
}
```

### Step 2: Health Checks

Implement system health monitoring:

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabaseConnection(),
      redis: await checkRedisConnection(),
      fileStorage: await checkFileStorageConnection(),
      eventBus: await checkEventBusConnection(),
    },
  };

  const isHealthy = Object.values(health.checks).every(
    (check) => check.status === "healthy",
  );

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503,
  });
}
```

This implementation guide provides a complete roadmap for integrating the Event Data Management and Task Management systems into the existing workforce management platform with proper security, performance, and monitoring considerations.
