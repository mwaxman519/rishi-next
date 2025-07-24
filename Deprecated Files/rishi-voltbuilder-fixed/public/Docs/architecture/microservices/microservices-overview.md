# Rishi Platform - Microservices Architecture Overview

## System Architecture

The Rishi platform is built as a collection of event-driven microservices within a Next.js application, emphasizing scalability, maintainability, and enterprise-grade reliability.

### Core Principles

1. **Event-Driven Architecture**: All services communicate through events published via the central EventBus
2. **Service Isolation**: Each microservice has its own models, repository, and business logic
3. **Role-Based Access Control**: Comprehensive RBAC implementation across all services
4. **Repository Pattern**: Data access abstraction for database operations
5. **Type Safety**: Complete TypeScript coverage with Zod validation

## Implemented Microservices

### 1. Time Tracking Service

**Location**: `app/services/timetracking/`
**Purpose**: Manages clock-in/out, time entries, and attendance tracking

**Key Components**:

- `TimeTrackingService.ts` - Core business logic with RBAC
- `repository.ts` - Database operations and queries
- `events.ts` - Event publishing for time tracking operations
- `models.ts` - TypeScript types and Zod schemas

**API Endpoints**:

- `GET /api/timetracking` - List time entries with filtering
- `POST /api/timetracking` - Create new time entry
- `PUT /api/timetracking/[id]` - Update time entry
- `DELETE /api/timetracking/[id]` - Delete time entry
- `POST /api/timetracking/clock-in` - Clock in to shift/event
- `POST /api/timetracking/clock-out` - Clock out from shift/event

**Events Published**:

- `timetracking.clocked_in`
- `timetracking.clocked_out`
- `timetracking.entry_created`
- `timetracking.entry_updated`
- `timetracking.entry_deleted`

### 2. Expense Management Service

**Location**: `app/services/expenses/`
**Purpose**: Handles expense reporting, approval workflows, and reimbursements

**Key Components**:

- `ExpenseService.ts` - Business logic with approval workflows
- `repository.ts` - Database operations with complex queries
- `events.ts` - Event publishing for expense operations
- `models.ts` - Comprehensive expense type definitions

**API Endpoints**:

- `GET /api/expenses` - List expenses with filtering and pagination
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense
- `POST /api/expenses/approval` - Approve/reject expenses
- `GET /api/expenses/mileage` - Calculate mileage expenses

**Events Published**:

- `expense.created`
- `expense.updated`
- `expense.deleted`
- `expense.approved`
- `expense.rejected`
- `expense.submitted`

### 3. Shift Management Service

**Location**: `app/services/shifts/`
**Purpose**: Comprehensive shift scheduling, assignment, and lifecycle management

**Key Components**:

- `ShiftService.ts` - Complete shift lifecycle management
- `repository.ts` - Advanced querying with availability checking
- `events.ts` - Event publishing for all shift operations
- `models.ts` - Shift and assignment type definitions

**API Endpoints**:

- `GET /api/shifts` - List shifts with filtering
- `POST /api/shifts` - Create new shift
- `PUT /api/shifts/[id]` - Update shift
- `DELETE /api/shifts/[id]` - Delete shift
- `POST /api/shifts/assignments` - Assign agents to shifts
- `POST /api/shifts/lifecycle` - Start/complete/cancel shifts

**Events Published**:

- `shift.created`
- `shift.updated`
- `shift.deleted`
- `shift.assigned`
- `shift.unassigned`
- `shift.started`
- `shift.completed`
- `shift.cancelled`

## Supporting Services

### EventBus Service

**Location**: `app/services/core/EventBus.ts`
**Purpose**: Central event publishing and subscription system

**Features**:

- Type-safe event publishing
- Asynchronous event handling
- Error handling and retry logic
- Event persistence for audit trails

### RBAC System

**Location**: Throughout all services
**Purpose**: Role-based access control across the platform

**Roles**:

- `super_admin` - Platform-wide access
- `organization_admin` - Organization-level management
- `internal_field_manager` - Field operations management
- `brand_agent` - Limited operational access

## Database Schema

### Core Tables

- `users` - User accounts and authentication
- `organizations` - Client organizations
- `locations` - Venue and location management
- `events` - Event/campaign management
- `shifts` - Shift scheduling data
- `shift_assignments` - Agent-to-shift assignments
- `time_entries` - Time tracking records
- `expenses` - Expense reporting data

### Audit Tables

- `audit_logs` - System audit trail
- `event_logs` - Event publishing history

## Integration Patterns

### Service-to-Service Communication

All services communicate through events rather than direct calls:

1. **Event Publishing**: Services publish events for state changes
2. **Event Subscription**: Other services can subscribe to relevant events
3. **Eventual Consistency**: Data consistency achieved through event propagation

### External Integrations

- **Google Maps API**: Location services and geocoding
- **Stripe**: Payment processing for expense reimbursements
- **SendGrid**: Email notifications for approvals and assignments

## Development Patterns

### Repository Pattern

```typescript
export interface ServiceRepository<T> {
  findById(id: string): Promise<ServiceResponse<T>>;
  findAll(filters: FilterType): Promise<ServiceResponse<T[]>>;
  create(data: CreateType): Promise<ServiceResponse<T>>;
  update(id: string, data: UpdateType): Promise<ServiceResponse<T>>;
  delete(id: string): Promise<ServiceResponse<boolean>>;
}
```

### Service Pattern

```typescript
export class MicroService {
  private repository: Repository;
  private eventPublisher: EventPublisher;

  // Business logic methods with RBAC
  // Event publishing for all operations
  // Comprehensive error handling
}
```

### Event Pattern

```typescript
export interface ServiceEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId: string;
  organizationId: string;
}
```

## Security Implementation

### Authentication

- JWT-based authentication
- Session management with secure cookies
- Password hashing with bcrypt

### Authorization

- Role-based permissions at API level
- Data filtering based on organizational access
- Resource-level permissions for sensitive operations

### Data Protection

- UUID-based primary keys
- Encrypted sensitive data fields
- Audit logging for all operations

## Performance Optimizations

### Database

- Proper indexing on frequently queried fields
- Connection pooling with Neon PostgreSQL
- Query optimization with Drizzle ORM

### Caching

- Service-level caching for frequently accessed data
- Event deduplication to prevent duplicate processing

### API Design

- Pagination for large result sets
- Filtering and sorting at database level
- Efficient joins and includes

## Monitoring and Observability

### Logging

- Structured logging with contextual information
- Error tracking with stack traces
- Performance metrics for critical operations

### Audit Trail

- Complete audit logging for all data changes
- Event history for debugging and compliance
- User action tracking for security

## Future Microservices (Phases 6-7)

### Calendar Integration Service

- Event-shift coordination
- Availability management
- Schedule conflict resolution

### Reporting and Analytics Service

- Data aggregation and analysis
- Dashboard metrics generation
- Export and reporting capabilities

## Best Practices

### Code Organization

- Consistent file structure across services
- Clear separation of concerns
- Comprehensive TypeScript typing

### Error Handling

- Standardized error responses
- Graceful degradation for service failures
- Comprehensive error logging

### Testing

- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end tests for critical workflows

### Documentation

- Inline code documentation with JSDoc
- API documentation with examples
- Architecture decision records (ADRs)
