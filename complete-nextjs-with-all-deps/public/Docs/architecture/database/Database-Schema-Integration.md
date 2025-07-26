# Database Schema Integration

## Overview

This document details the comprehensive database schema integration for the Event Data Management and Task Management systems, including all new tables, relationships, and event-driven architecture components implemented in the workforce management platform.

## Schema Architecture

### Event Data Management Tables

#### EventDataSubmissions Table

```sql
CREATE TABLE event_data_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status event_data_status NOT NULL DEFAULT 'pending',
  jotform_submission_id VARCHAR(100),
  jotform_url TEXT,
  qualitative_data JSONB,
  quantitative_data JSONB,
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  approval_notes TEXT,
  rejection_reason TEXT,
  due_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**

- Direct integration with existing events and users tables
- JSONB storage for flexible survey data structure
- Complete approval workflow tracking
- Organization-based data isolation

#### EventPhotos Table

```sql
CREATE TABLE event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_data_submission_id UUID NOT NULL REFERENCES event_data_submissions(id),
  type photo_type NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  caption TEXT,
  metadata JSONB,
  is_approved BOOLEAN,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**

- Three distinct photo types: demo_table, shelf_image, additional_image
- Individual photo approval workflow
- EXIF and metadata storage for compliance
- File management integration

### Task Management Tables

#### Tasks Table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type task_type NOT NULL,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'assigned',
  assigned_to UUID NOT NULL REFERENCES users(id),
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_by_role user_role NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  event_id UUID REFERENCES events(id),
  due_date TIMESTAMP NOT NULL,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  instructions TEXT,
  attachments TEXT[],
  submission_data JSONB,
  review_notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_schedule JSONB,
  tags TEXT[],
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**

- Multi-role assignment capability
- Event linkage for context
- Flexible submission data storage
- Recurring task support

#### TaskComments Table

```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  user_id UUID NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**

- Internal and external comment types
- File attachment support
- Complete conversation history

#### MileageSubmissions Table

```sql
CREATE TABLE mileage_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  user_id UUID NOT NULL REFERENCES users(id),
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  distance DECIMAL(10,2) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  receipt_path TEXT,
  notes TEXT,
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**

- Precise financial calculations
- Receipt documentation
- Location tracking

#### ClockEvents Table

```sql
CREATE TABLE clock_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  user_id UUID NOT NULL REFERENCES users(id),
  event_type clock_event_type NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  location TEXT,
  coordinates JSONB,
  photo_path TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**

- GPS coordinate storage
- Photo verification
- Multiple event types (clock_in, clock_out, break_start, break_end)

## Enumerated Types

### Event Data Enums

```sql
CREATE TYPE event_data_status AS ENUM (
  'pending',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'needs_revision'
);

CREATE TYPE photo_type AS ENUM (
  'demo_table',
  'shelf_image',
  'additional_image'
);
```

### Task Management Enums

```sql
CREATE TYPE task_type AS ENUM (
  'event_report',
  'mileage_submission',
  'clock_in_out',
  'training_required',
  'logistics_kit',
  'shadowing',
  'personnel_update',
  'photo_submission',
  'compliance_check'
);

CREATE TYPE task_status AS ENUM (
  'assigned',
  'in_progress',
  'completed',
  'overdue',
  'cancelled'
);

CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE clock_event_type AS ENUM (
  'clock_in',
  'clock_out',
  'break_start',
  'break_end'
);
```

## Indexes and Performance Optimization

### Event Data Indexes

```sql
-- Primary lookup indexes
CREATE INDEX idx_event_data_submissions_event_id ON event_data_submissions(event_id);
CREATE INDEX idx_event_data_submissions_agent_id ON event_data_submissions(agent_id);
CREATE INDEX idx_event_data_submissions_organization_id ON event_data_submissions(organization_id);
CREATE INDEX idx_event_data_submissions_status ON event_data_submissions(status);
CREATE INDEX idx_event_data_submissions_due_date ON event_data_submissions(due_date);

-- Photo management indexes
CREATE INDEX idx_event_photos_submission_id ON event_photos(event_data_submission_id);
CREATE INDEX idx_event_photos_type ON event_photos(type);
CREATE INDEX idx_event_photos_approval_status ON event_photos(is_approved);
```

### Task Management Indexes

```sql
-- Task lookup indexes
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_event_id ON tasks(event_id);

-- Comment and submission indexes
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_mileage_submissions_task_id ON mileage_submissions(task_id);
CREATE INDEX idx_clock_events_user_id ON clock_events(user_id);
CREATE INDEX idx_clock_events_timestamp ON clock_events(timestamp);
```

## Data Relationships

### Event Data Relationships

```sql
-- Foreign key constraints
ALTER TABLE event_data_submissions
  ADD CONSTRAINT fk_event_data_event
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE event_data_submissions
  ADD CONSTRAINT fk_event_data_agent
  FOREIGN KEY (agent_id) REFERENCES users(id);

ALTER TABLE event_photos
  ADD CONSTRAINT fk_event_photo_submission
  FOREIGN KEY (event_data_submission_id) REFERENCES event_data_submissions(id) ON DELETE CASCADE;
```

### Task Relationships

```sql
-- Task foreign key constraints
ALTER TABLE tasks
  ADD CONSTRAINT fk_task_assigned_to
  FOREIGN KEY (assigned_to) REFERENCES users(id);

ALTER TABLE tasks
  ADD CONSTRAINT fk_task_assigned_by
  FOREIGN KEY (assigned_by) REFERENCES users(id);

ALTER TABLE tasks
  ADD CONSTRAINT fk_task_organization
  FOREIGN KEY (organization_id) REFERENCES organizations(id);

ALTER TABLE tasks
  ADD CONSTRAINT fk_task_event
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;
```

## Drizzle ORM Integration

### Schema Definition (`shared/schema.ts`)

```typescript
// Event Data schemas
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
  // ... additional fields
});

export const eventPhotos = pgTable("event_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventDataSubmissionId: uuid("event_data_submission_id")
    .references(() => eventDataSubmissions.id)
    .notNull(),
  type: photoTypeEnum("type").notNull(),
  // ... additional fields
});

// Task Management schemas
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  type: taskTypeEnum("type").notNull(),
  // ... additional fields
});
```

### Insert Schemas

```typescript
// Event Data insert schemas
export const insertEventDataSubmissionSchema =
  createInsertSchema(eventDataSubmissions);
export const insertEventPhotoSchema = createInsertSchema(eventPhotos);

// Task Management insert schemas
export const insertTaskSchema = createInsertSchema(tasks);
export const insertTaskCommentSchema = createInsertSchema(taskComments);
export const insertMileageSubmissionSchema =
  createInsertSchema(mileageSubmissions);
export const insertClockEventSchema = createInsertSchema(clockEvents);
```

### Type Exports

```typescript
// Event Data types
export type EventDataSubmission = typeof eventDataSubmissions.$inferSelect;
export type InsertEventDataSubmission = z.infer<
  typeof insertEventDataSubmissionSchema
>;
export type EventPhoto = typeof eventPhotos.$inferSelect;
export type InsertEventPhoto = z.infer<typeof insertEventPhotoSchema>;

// Task Management types
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;
export type MileageSubmission = typeof mileageSubmissions.$inferSelect;
export type InsertMileageSubmission = z.infer<
  typeof insertMileageSubmissionSchema
>;
export type ClockEvent = typeof clockEvents.$inferSelect;
export type InsertClockEvent = z.infer<typeof insertClockEventSchema>;
```

## Event-Driven Architecture Integration

### Event Bus Integration

The database schema supports comprehensive event-driven architecture through:

#### System Events Table

```sql
CREATE TABLE system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Event Types Supported

- **Event Data Events**: submission_created, submission_reviewed, photo_uploaded, photo_approved
- **Task Events**: task_assigned, task_started, task_completed, task_overdue
- **Time Tracking Events**: clock_in, clock_out, break_events
- **Mileage Events**: mileage_submitted, expense_approved

### Microservices Integration Points

#### Event Data Service

- **Jotform Webhook Processing**: Automatic data ingestion
- **Photo Management Service**: File processing and storage
- **Approval Workflow Service**: Multi-stage review automation
- **Notification Service**: Real-time alert distribution

#### Task Management Service

- **Assignment Engine**: Intelligent task distribution
- **Deadline Management**: Proactive monitoring and escalation
- **Integration Hub**: External system connectivity
- **Analytics Engine**: Performance and completion tracking

## Data Migration Strategy

### Migration Scripts

```sql
-- Create new tables with proper constraints
-- Migrate existing data where applicable
-- Update foreign key relationships
-- Create indexes for performance
-- Set up triggers for event processing
```

### Data Validation

- **Referential Integrity**: All foreign keys properly validated
- **Enum Constraints**: Status and type values restricted to valid options
- **Business Rules**: Due dates, priorities, and workflows enforced
- **Organization Isolation**: Multi-tenant data separation maintained

## Backup and Recovery

### Backup Strategy

- **Incremental Backups**: Hourly incremental backup of new data
- **Full Backups**: Daily complete database backup
- **Point-in-Time Recovery**: Transaction log backup for precise recovery
- **Cross-Region Replication**: Geographic redundancy for disaster recovery

### Data Retention

- **Event Data**: 7-year retention for compliance requirements
- **Task Data**: 3-year retention for operational analysis
- **System Events**: 1-year retention for audit and debugging
- **Photo Storage**: Long-term archival with automated lifecycle management

## Security Implementation

### Access Control

- **Row-Level Security**: Organization-based data isolation
- **Role-Based Permissions**: Granular access control by user role
- **API Authentication**: JWT-based secure API access
- **Audit Logging**: Complete data access and modification tracking

### Data Encryption

- **At-Rest Encryption**: Database-level encryption for sensitive data
- **In-Transit Encryption**: TLS/SSL for all data transmission
- **Application-Level Encryption**: Additional encryption for PII data
- **Key Management**: Secure encryption key rotation and storage

## Performance Monitoring

### Database Metrics

- **Query Performance**: Real-time query execution monitoring
- **Index Usage**: Index effectiveness and optimization tracking
- **Connection Pooling**: Database connection utilization monitoring
- **Storage Growth**: Capacity planning and optimization

### Application Metrics

- **API Response Times**: Endpoint performance tracking
- **Event Processing**: Event bus performance and throughput
- **Cache Hit Rates**: Caching effectiveness monitoring
- **Error Rates**: System reliability and error tracking
