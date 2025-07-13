# Database Schema for Booking-Events Integration

## Overview

This document defines the database schema changes needed to support the integration between the Booking and Events/Activities systems. The schema is designed to maintain clear relationships between entities while supporting the full lifecycle from booking creation to event execution and reporting.

## Entity Relationship Diagram

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ organizations │      │   bookings    │      │event_instances│      │  activities   │
├───────────────┤      ├───────────────┤      ├───────────────┤      ├───────────────┤
│ id            │──┐   │ id            │──┐   │ id            │──┐   │ id            │
│ name          │  │   │ title         │  │   │ date          │  │   │ type          │
│ settings      │  │   │ description   │  │   │ start_time    │  │   │ title         │
│ tier          │  │   │ organization_id│◄─┘   │ end_time      │  │   │ description   │
│ contact_info  │  │   │ status        │  │   │ booking_id    │◄─┘   │ event_instance_id│◄─┘
└───────────────┘  │   │ recurrence    │  │   │ location_id   │──┐   │ status        │
                   │   │ client_notes  │  │   │ status        │  │   │ instructions  │
                   │   │ admin_notes   │  │   │ field_manager_id│◄─┐   │ duration      │
                   │   │ approved_by   │  │   │ notes         │  │   │ kit_template_id│──┐
                   │   │ approved_at   │  │   │ preparation_status│  │   │ created_at    │  │
                   │   │ created_by    │  │   │ created_at    │  │   │ updated_at    │  │
                   │   │ created_at    │  │   │ updated_at    │  │   └───────────────┘  │
                   │   │ updated_at    │  │   └───────────────┘  │                      │
                   │   └───────────────┘  │                      │                      │
                   │                      │                      │                      │
                   │   ┌───────────────┐  │   ┌───────────────┐  │   ┌───────────────┐  │
                   │   │ recurrence    │  │   │   locations   │  │   │ kit_templates │  │
                   │   │   patterns    │  │   ├───────────────┤  │   ├───────────────┤  │
                   │   ├───────────────┤  │   │ id            │◄─┘   │ id            │◄─┘
                   │   │ id            │  │   │ name          │      │ name          │
                   │   │ booking_id    │◄─┘   │ address       │      │ description   │
                   │   │ frequency     │      │ city          │      │ components    │
                   │   │ interval      │      │ state         │      │ brand_id      │
                   │   │ week_days     │      │ postal_code   │      │ approval_status│
                   │   │ month_days    │      │ country       │      └───────────────┘
                   │   │ end_date      │      │ contact_info  │
                   │   │ end_after     │      │ created_at    │      ┌───────────────┐
                   │   │ created_at    │      │ updated_at    │      │     users     │
                   │   │ updated_at    │      └───────────────┘      ├───────────────┤
                   │   └───────────────┘                             │ id            │◄─┐
                   │                                                 │ name          │  │
                   │                                                 │ email         │  │
                   └────────────────────────────────────────────────┤ organization_id│  │
                                                                     │ role          │  │
┌───────────────┐      ┌───────────────┐      ┌───────────────┐      │ status        │  │
│activity_kits  │      │staff_assignments│     │ event_team_   │      └───────────────┘  │
├───────────────┤      ├───────────────┤      │   members     │                         │
│ id            │      │ id            │      ├───────────────┤                         │
│ activity_id   │──┐   │ id            │      │ id            │                         │
│ kit_template_id│  │   │ event_instance_id│──┐   │ event_instance_id│──┐                      │
│ kit_instance_id│  │   │ activity_id   │◄─┘   │ user_id       │◄─┘                      │
│ quantity      │  │   │ user_id       │──┐   │ role          │                         │
│ status        │  │   │ role          │  │   │ created_at    │                         │
│ created_at    │  │   │ status        │  │   │ updated_at    │                         │
│ updated_at    │  │   │ check_in_time │  │   └───────────────┘                         │
└───────────────┘  │   │ check_out_time│  │                                             │
                   │   │ feedback      │  │   ┌───────────────┐                         │
                   │   │ created_at    │  │   │ event_state_  │                         │
                   │   │ updated_at    │  │   │  transitions  │                         │
                   │   └───────────────┘  │   ├───────────────┤                         │
                   │                      │   │ id            │                         │
                   │   ┌───────────────┐  │   │ event_instance_id│                         │
                   │   │  kit_instances│  │   │ from_state    │                         │
                   │   ├───────────────┤  │   │ to_state      │                         │
                   │   │ id            │◄─┘   │ changed_by_id │◄───────────────────────┘
                   │   │ template_id   │      │ reason        │
                   │   │ serial_number │      │ created_at    │
                   │   │ status        │      └───────────────┘
                   │   │ last_checked  │
                   │   │ created_at    │
                   │   │ updated_at    │
                   │   └───────────────┘
```

## Table Definitions

### 1. Existing Tables to Modify

#### 1.1. `bookings`

```sql
ALTER TABLE bookings
ADD COLUMN event_generation_status TEXT,
ADD COLUMN event_count INTEGER,
ADD COLUMN last_event_generated_at TIMESTAMP,
ADD COLUMN series_start_date DATE,
ADD COLUMN series_end_date DATE;
```

#### 1.2. `activities`

```sql
ALTER TABLE activities
ADD COLUMN event_instance_id UUID REFERENCES event_instances(id),
ADD COLUMN preparation_status TEXT,
ADD COLUMN execution_status TEXT,
ADD COLUMN completion_notes TEXT,
ADD COLUMN target_metrics JSONB,
ADD COLUMN actual_metrics JSONB;
```

### 2. New Tables

#### 2.1. `event_instances`

```sql
CREATE TABLE event_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_id UUID REFERENCES locations(id),
  status TEXT NOT NULL DEFAULT 'scheduled',
  field_manager_id UUID REFERENCES users(id),
  preparation_status TEXT,
  check_in_required BOOLEAN DEFAULT TRUE,
  notes TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_instances_booking_id ON event_instances(booking_id);
CREATE INDEX idx_event_instances_date ON event_instances(date);
CREATE INDEX idx_event_instances_status ON event_instances(status);
CREATE INDEX idx_event_instances_field_manager_id ON event_instances(field_manager_id);
```

#### 2.2. `event_team_members`

```sql
CREATE TABLE event_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_instance_id UUID NOT NULL REFERENCES event_instances(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_instance_id, user_id, role)
);

CREATE INDEX idx_event_team_members_event_instance_id ON event_team_members(event_instance_id);
CREATE INDEX idx_event_team_members_user_id ON event_team_members(user_id);
```

#### 2.3. `staff_assignments`

```sql
CREATE TABLE staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_instance_id UUID NOT NULL REFERENCES event_instances(id),
  activity_id UUID REFERENCES activities(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  location_at_check_in JSONB,
  location_at_check_out JSONB,
  hours_worked DECIMAL(5,2),
  feedback TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_assignments_event_instance_id ON staff_assignments(event_instance_id);
CREATE INDEX idx_staff_assignments_activity_id ON staff_assignments(activity_id);
CREATE INDEX idx_staff_assignments_user_id ON staff_assignments(user_id);
CREATE INDEX idx_staff_assignments_status ON staff_assignments(status);
```

#### 2.4. `activity_kits`

```sql
CREATE TABLE activity_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id),
  kit_template_id UUID REFERENCES kit_templates(id),
  kit_instance_id UUID REFERENCES kit_instances(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'needed',
  checked_out_by UUID REFERENCES users(id),
  checked_out_at TIMESTAMP,
  returned_by UUID REFERENCES users(id),
  returned_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_kits_activity_id ON activity_kits(activity_id);
CREATE INDEX idx_activity_kits_kit_template_id ON activity_kits(kit_template_id);
CREATE INDEX idx_activity_kits_kit_instance_id ON activity_kits(kit_instance_id);
CREATE INDEX idx_activity_kits_status ON activity_kits(status);
```

#### 2.5. `event_state_transitions`

```sql
CREATE TABLE event_state_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_instance_id UUID NOT NULL REFERENCES event_instances(id),
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  changed_by_id UUID REFERENCES users(id),
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_state_transitions_event_instance_id ON event_state_transitions(event_instance_id);
CREATE INDEX idx_event_state_transitions_created_at ON event_state_transitions(created_at);
```

#### 2.6. `event_issues`

```sql
CREATE TABLE event_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_instance_id UUID NOT NULL REFERENCES event_instances(id),
  activity_id UUID REFERENCES activities(id),
  reported_by UUID NOT NULL REFERENCES users(id),
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  photo_urls TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_issues_event_instance_id ON event_issues(event_instance_id);
CREATE INDEX idx_event_issues_activity_id ON event_issues(activity_id);
CREATE INDEX idx_event_issues_status ON event_issues(status);
CREATE INDEX idx_event_issues_severity ON event_issues(severity);
```

### 3. Foreign Key Constraints

```sql
-- Add constraints for cascading deletes where appropriate
ALTER TABLE event_instances
ADD CONSTRAINT fk_event_instances_booking_id
FOREIGN KEY (booking_id)
REFERENCES bookings(id)
ON DELETE CASCADE;

ALTER TABLE event_team_members
ADD CONSTRAINT fk_event_team_members_event_instance_id
FOREIGN KEY (event_instance_id)
REFERENCES event_instances(id)
ON DELETE CASCADE;

ALTER TABLE staff_assignments
ADD CONSTRAINT fk_staff_assignments_event_instance_id
FOREIGN KEY (event_instance_id)
REFERENCES event_instances(id)
ON DELETE CASCADE;

ALTER TABLE activity_kits
ADD CONSTRAINT fk_activity_kits_activity_id
FOREIGN KEY (activity_id)
REFERENCES activities(id)
ON DELETE CASCADE;

ALTER TABLE event_state_transitions
ADD CONSTRAINT fk_event_state_transitions_event_instance_id
FOREIGN KEY (event_instance_id)
REFERENCES event_instances(id)
ON DELETE CASCADE;

ALTER TABLE event_issues
ADD CONSTRAINT fk_event_issues_event_instance_id
FOREIGN KEY (event_instance_id)
REFERENCES event_instances(id)
ON DELETE CASCADE;
```

## State Definitions

### Booking States

| State             | Description                         |
| ----------------- | ----------------------------------- |
| draft             | Initial creation, not yet submitted |
| pending           | Submitted for review                |
| changes_requested | Updates needed from client          |
| approved          | Accepted and ready for execution    |
| rejected          | Declined by internal admin          |
| cancelled         | Called off after submission         |
| completed         | All associated events finished      |

### Event Instance States

| State           | Description                          |
| --------------- | ------------------------------------ |
| scheduled       | Initial state after booking approval |
| preparation     | Active logistics planning            |
| in_progress     | Event currently executing            |
| completed       | All activities finished successfully |
| cancelled       | Event not executed                   |
| issue_reported  | Problem encountered during execution |
| post_processing | Reports and invoicing phase          |

### Activity States

| State          | Description                |
| -------------- | -------------------------- |
| planned        | Initial state when created |
| assigned       | Staff members allocated    |
| in_progress    | Currently being executed   |
| completed      | Successfully finished      |
| issue_reported | Problem encountered        |
| cancelled      | Not executed               |

### Staff Assignment States

| State       | Description                |
| ----------- | -------------------------- |
| assigned    | Initial assignment created |
| offered     | Offered to brand agent     |
| accepted    | Accepted by brand agent    |
| rejected    | Rejected by brand agent    |
| checked_in  | Staff has checked in       |
| checked_out | Staff has checked out      |
| no_show     | Staff did not show up      |
| cancelled   | Assignment cancelled       |

### Activity Kit States

| State          | Description                    |
| -------------- | ------------------------------ |
| needed         | Kit requirement identified     |
| assigned       | Specific kit instance assigned |
| prepared       | Kit has been prepared          |
| checked_out    | Kit in use at event            |
| returned       | Kit returned after event       |
| issue_reported | Problem with kit reported      |

## Indexes and Performance Considerations

The schema includes carefully designed indexes to optimize common query patterns:

1. **Lookup by ID**: Primary keys on all tables
2. **Foreign Key Relationships**: Indexed for join performance
3. **Status Filtering**: Indexes on status columns for filtering
4. **Date Range Queries**: Index on event_instances.date for date range queries
5. **User Assignment Queries**: Indexes on user_id fields for finding assignments

## Data Migration Strategy

For existing data, the following migration steps are recommended:

1. **Structural Changes**:

   - Create new tables
   - Add columns to existing tables
   - Add constraints and indexes

2. **Data Migration**:

   - For existing approved bookings, generate event_instances
   - Link existing activities to the new event_instances
   - Populate staff_assignments from existing data
   - Set appropriate states based on current status

3. **Verification**:
   - Validate data integrity after migration
   - Run test queries to ensure expected results
   - Verify constraint satisfaction

## Schema Evolution Strategy

As the system evolves, consider these guidelines for schema changes:

1. **Additive Changes**: Prefer adding new tables/columns over changing existing ones
2. **Soft Deletes**: Use status flags instead of physical deletion
3. **Version Columns**: Add version columns for optimistic concurrency
4. **JSON Extensions**: Use JSONB for flexible metadata that doesn't need indexing
5. **Audit Trails**: Maintain transition logs for critical state changes
