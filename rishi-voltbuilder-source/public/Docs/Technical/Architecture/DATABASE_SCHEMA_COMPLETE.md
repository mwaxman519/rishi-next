# Complete Database Schema Documentation

_Comprehensive Database Architecture for Rishi Platform_
_Last Updated: June 23, 2025_

## Overview

The Rishi Platform uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema supports multi-organization tenancy, role-based access control, and comprehensive booking management for cannabis industry operations.

## Database Technology Stack

- **Database**: PostgreSQL 15+ (Neon Serverless)
- **ORM**: Drizzle ORM with TypeScript
- **Migration Tool**: Drizzle Kit
- **Connection Pooling**: Native PostgreSQL pooling
- **Environment**: Serverless-optimized for Azure Functions

## Schema Architecture Principles

1. **Multi-Tenancy**: Organization-level data isolation
2. **UUID Primary Keys**: Consistent entity identification across microservices
3. **Audit Trails**: Comprehensive tracking of data changes
4. **Soft Deletes**: Data preservation with deactivation flags
5. **Referential Integrity**: Foreign key constraints with cascading rules
6. **Indexing Strategy**: Optimized for query performance

## Core Tables

### Organizations Table

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type organization_type NOT NULL DEFAULT 'client',
  tier organization_tier,
  settings TEXT, -- JSON string for flexible configuration
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_tier ON organizations(tier);
CREATE INDEX idx_organizations_active ON organizations(is_active);
```

**Purpose**: Multi-tenant organization management
**Relationships**: Parent to users, bookings, locations
**Business Rules**:

- Organization names must be unique within type
- Internal organizations have unrestricted access
- Client organizations have tier-based feature access

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'client_user',
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_last_login ON users(last_login_at);
```

**Purpose**: User authentication and profile management
**Relationships**: Many-to-many with organizations via user_organizations
**Business Rules**:

- Email addresses must be unique across platform
- Password hashing using bcrypt with 12 rounds
- Role determines base permission set

### User Organizations Table

```sql
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  permissions TEXT, -- JSON array of additional permissions
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, organization_id)
);

-- Indexes
CREATE INDEX idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX idx_user_orgs_org ON user_organizations(organization_id);
CREATE INDEX idx_user_orgs_role ON user_organizations(role);
CREATE INDEX idx_user_orgs_default ON user_organizations(is_default);
```

**Purpose**: User-organization relationships with role assignment
**Business Rules**:

- Users can belong to multiple organizations
- Each user has one default organization
- Role can differ between organizations

### Bookings Table (Primary Workflow)

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES users(id),
  location_id UUID REFERENCES locations(id),
  status booking_status NOT NULL DEFAULT 'draft',
  priority booking_priority NOT NULL DEFAULT 'medium',
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  budget DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  requirements TEXT, -- JSON object with booking requirements
  staff_requirements TEXT, -- JSON object with staff needs
  equipment_requirements TEXT, -- JSON object with equipment needs
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_schedule CHECK (scheduled_end > scheduled_start),
  CONSTRAINT valid_actual_times CHECK (actual_end IS NULL OR actual_start IS NULL OR actual_end >= actual_start)
);

-- Indexes
CREATE INDEX idx_bookings_org ON bookings(organization_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_schedule ON bookings(scheduled_start, scheduled_end);
CREATE INDEX idx_bookings_location ON bookings(location_id);
CREATE INDEX idx_bookings_created_by ON bookings(created_by);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_priority ON bookings(priority);
```

**Purpose**: Central booking management for cannabis industry operations
**Business Rules**:

- Booking times cannot overlap for same location
- Budget tracking with actual cost comparison
- Comprehensive status lifecycle management

## Location Management

### Locations Table

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'USA',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  google_place_id VARCHAR(255),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  location_type location_type NOT NULL DEFAULT 'dispensary',
  capacity INTEGER,
  amenities TEXT, -- JSON array of available amenities
  accessibility_features TEXT, -- JSON array of accessibility features
  operating_hours TEXT, -- JSON object with daily hours
  contact_info TEXT, -- JSON object with contact details
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_locations_org ON locations(organization_id);
CREATE INDEX idx_locations_state ON locations(state);
CREATE INDEX idx_locations_city ON locations(city);
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_locations_active ON locations(is_active);
```

**Purpose**: Cannabis industry location management
**Business Rules**:

- Locations tied to specific organizations
- Geographic search capabilities
- Capacity management for bookings

### Brand Management

### Brands Table

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  logo_url TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  brand_category brand_category,
  website_url TEXT,
  social_media TEXT, -- JSON object with social media links
  contact_info TEXT, -- JSON object with contact details
  brand_guidelines TEXT, -- JSON object with branding guidelines
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brands_org ON brands(organization_id);
CREATE INDEX idx_brands_category ON brands(brand_category);
CREATE INDEX idx_brands_active ON brands(is_active);
```

### Brand Locations Table

```sql
CREATE TABLE brand_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  relationship_type brand_location_relationship DEFAULT 'partnership',
  start_date DATE,
  end_date DATE,
  terms TEXT, -- JSON object with partnership terms
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(brand_id, location_id)
);

-- Indexes
CREATE INDEX idx_brand_locations_brand ON brand_locations(brand_id);
CREATE INDEX idx_brand_locations_location ON brand_locations(location_id);
CREATE INDEX idx_brand_locations_dates ON brand_locations(start_date, end_date);
```

## Staff & Availability Management

### Availability Blocks Table

```sql
CREATE TABLE availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status availability_status NOT NULL DEFAULT 'available',
  recurrence_pattern TEXT, -- JSON object for recurring availability
  notes TEXT,
  location_preference UUID REFERENCES locations(id),
  max_distance_miles INTEGER,
  hourly_rate DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_time_block CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_availability_user ON availability_blocks(user_id);
CREATE INDEX idx_availability_time ON availability_blocks(start_time, end_time);
CREATE INDEX idx_availability_status ON availability_blocks(status);
CREATE INDEX idx_availability_location ON availability_blocks(location_preference);
```

### Booking Staff Assignments Table

```sql
CREATE TABLE booking_staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role assignment_role NOT NULL DEFAULT 'staff',
  hourly_rate DECIMAL(8,2),
  hours_worked DECIMAL(6,2),
  status assignment_status NOT NULL DEFAULT 'assigned',
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(booking_id, user_id)
);

-- Indexes
CREATE INDEX idx_staff_assignments_booking ON booking_staff_assignments(booking_id);
CREATE INDEX idx_staff_assignments_user ON booking_staff_assignments(user_id);
CREATE INDEX idx_staff_assignments_status ON booking_staff_assignments(status);
CREATE INDEX idx_staff_assignments_role ON booking_staff_assignments(role);
```

## Task Management System

### Tasks Table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  booking_id UUID REFERENCES bookings(id),
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  task_type task_type NOT NULL DEFAULT 'general',
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'open',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL(6,2),
  actual_hours DECIMAL(6,2),
  tags TEXT, -- JSON array of tags
  attachments TEXT, -- JSON array of file URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_org ON tasks(organization_id);
CREATE INDEX idx_tasks_booking ON tasks(booking_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_type ON tasks(task_type);
```

### Task Comments Table

```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachments TEXT, -- JSON array of file URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_task_comments_user ON task_comments(user_id);
CREATE INDEX idx_task_comments_created ON task_comments(created_at);
```

## Equipment & Inventory Management

### Kit Templates Table

```sql
CREATE TABLE kit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES users(id),
  template_type kit_template_type NOT NULL DEFAULT 'standard',
  items TEXT NOT NULL, -- JSON array of item specifications
  estimated_value DECIMAL(10,2),
  weight_lbs DECIMAL(8,2),
  volume_cubic_ft DECIMAL(8,2),
  setup_instructions TEXT,
  breakdown_instructions TEXT,
  safety_requirements TEXT, -- JSON array of safety requirements
  certifications_required TEXT, -- JSON array of required certifications
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_kit_templates_org ON kit_templates(organization_id);
CREATE INDEX idx_kit_templates_type ON kit_templates(template_type);
CREATE INDEX idx_kit_templates_active ON kit_templates(is_active);
```

### Kit Instances Table

```sql
CREATE TABLE kit_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES kit_templates(id),
  booking_id UUID REFERENCES bookings(id),
  assigned_to UUID REFERENCES users(id),
  status kit_status NOT NULL DEFAULT 'available',
  location_id UUID REFERENCES locations(id),
  checked_out_at TIMESTAMP WITH TIME ZONE,
  checked_out_by UUID REFERENCES users(id),
  due_back_at TIMESTAMP WITH TIME ZONE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID REFERENCES users(id),
  condition_notes TEXT,
  damage_reported BOOLEAN NOT NULL DEFAULT false,
  replacement_cost DECIMAL(10,2),
  serial_numbers TEXT, -- JSON object mapping items to serial numbers
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_kit_instances_template ON kit_instances(template_id);
CREATE INDEX idx_kit_instances_booking ON kit_instances(booking_id);
CREATE INDEX idx_kit_instances_status ON kit_instances(status);
CREATE INDEX idx_kit_instances_location ON kit_instances(location_id);
CREATE INDEX idx_kit_instances_due_back ON kit_instances(due_back_at);
```

## Audit & System Events

### System Events Table

```sql
CREATE TABLE system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  correlation_id UUID,
  event_data TEXT, -- JSON object with event details
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Indexes
CREATE INDEX idx_system_events_type ON system_events(event_type);
CREATE INDEX idx_system_events_entity ON system_events(entity_type, entity_id);
CREATE INDEX idx_system_events_user ON system_events(user_id);
CREATE INDEX idx_system_events_org ON system_events(organization_id);
CREATE INDEX idx_system_events_timestamp ON system_events(timestamp);
CREATE INDEX idx_system_events_correlation ON system_events(correlation_id);
```

## Notification System

### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  notification_type notification_type NOT NULL DEFAULT 'info',
  priority notification_priority NOT NULL DEFAULT 'medium',
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  push_sent BOOLEAN NOT NULL DEFAULT false,
  push_sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_expires ON notifications(expires_at);
```

## Enumerated Types

### User Roles

```sql
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'internal_admin',
  'internal_field_manager',
  'brand_agent',
  'client_manager',
  'client_user'
);
```

### Organization Types

```sql
CREATE TYPE organization_type AS ENUM (
  'internal',
  'client',
  'partner'
);

CREATE TYPE organization_tier AS ENUM (
  'internal',
  'tier1',
  'tier2',
  'tier3'
);
```

### Booking Statuses

```sql
CREATE TYPE booking_status AS ENUM (
  'draft',
  'pending_approval',
  'approved',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'on_hold'
);

CREATE TYPE booking_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);
```

### Location Types

```sql
CREATE TYPE location_type AS ENUM (
  'dispensary',
  'cultivation_facility',
  'manufacturing_facility',
  'distribution_center',
  'testing_lab',
  'consumption_lounge',
  'delivery_hub',
  'warehouse',
  'office',
  'event_venue',
  'other'
);
```

### Task Management Types

```sql
CREATE TYPE task_type AS ENUM (
  'general',
  'setup',
  'breakdown',
  'training',
  'documentation',
  'compliance',
  'inventory',
  'quality_check',
  'customer_service',
  'maintenance'
);

CREATE TYPE task_status AS ENUM (
  'open',
  'in_progress',
  'pending_review',
  'completed',
  'cancelled',
  'blocked'
);

CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);
```

## Database Functions & Triggers

### Updated At Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... (apply to all relevant tables)
```

### Audit Trigger Function

```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO system_events (
    event_type,
    source,
    entity_type,
    entity_id,
    event_data,
    timestamp
  ) VALUES (
    TG_OP,
    'database_trigger',
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
      ELSE row_to_json(NEW)
    END,
    NOW()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_bookings AFTER INSERT OR UPDATE OR DELETE ON bookings FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
-- ... (apply to other critical tables)
```

## Performance Optimization

### Query Optimization Strategies

1. **Composite Indexes**: Multi-column indexes for common query patterns
2. **Partial Indexes**: Filtered indexes for frequently queried subsets
3. **Covering Indexes**: Include frequently selected columns
4. **Connection Pooling**: Optimized for serverless environments

### Example Composite Indexes

```sql
-- Booking queries by organization and date range
CREATE INDEX idx_bookings_org_schedule ON bookings(organization_id, scheduled_start, scheduled_end);

-- User organization lookup with role filtering
CREATE INDEX idx_user_orgs_lookup ON user_organizations(user_id, organization_id, role);

-- Staff availability queries
CREATE INDEX idx_availability_user_time ON availability_blocks(user_id, start_time, end_time, status);

-- Task management queries
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status, due_date);
```

### Partial Indexes for Active Records

```sql
-- Index only active organizations
CREATE INDEX idx_organizations_active_name ON organizations(name) WHERE is_active = true;

-- Index only active users
CREATE INDEX idx_users_active_email ON users(email) WHERE is_active = true;

-- Index only non-cancelled bookings
CREATE INDEX idx_bookings_active_schedule ON bookings(scheduled_start, scheduled_end) WHERE status != 'cancelled';
```

## Data Migration & Seeding

### Migration Strategy

1. **Version Control**: All schema changes tracked in Drizzle migrations
2. **Rollback Support**: Each migration includes down migration
3. **Data Validation**: Post-migration data integrity checks
4. **Environment Consistency**: Same migrations across dev/staging/prod

### Seed Data Requirements

```sql
-- Default Internal Organization
INSERT INTO organizations (id, name, type, tier) VALUES
('00000000-0000-0000-0000-000000000001', 'Rishi Internal', 'internal', 'internal');

-- Super Admin User
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@rishi.internal', '$2b$12$...', 'System', 'Administrator', 'super_admin');

-- Link Super Admin to Internal Organization
INSERT INTO user_organizations (user_id, organization_id, role, is_default) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'super_admin', true);
```

## Backup & Recovery

### Backup Strategy

- **Automated Daily Backups**: Via Neon platform
- **Point-in-Time Recovery**: 30-day retention
- **Export Procedures**: Regular data exports for compliance
- **Cross-Region Replication**: Disaster recovery preparation

### Recovery Procedures

1. **Corruption Recovery**: Point-in-time restore
2. **Data Loss Prevention**: Transaction log backup
3. **Testing**: Regular backup restoration tests
4. **Documentation**: Step-by-step recovery procedures

---

**Database Status**: ✅ PRODUCTION READY
**Schema Version**: Current with all tables implemented
**Migration Status**: All migrations applied successfully
**Performance**: Optimized for cannabis industry workflows
