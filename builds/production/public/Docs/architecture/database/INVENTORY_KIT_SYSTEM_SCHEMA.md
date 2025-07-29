# Inventory & Kit System Database Schema

## Overview

This document details the new database schema for the Rishi Platform's inventory and kit management system, designed to support the actual business workflow where Rishi staff use core items (tracked in HR) plus brand-specific kits for bookings and activations.

## Business Model Implementation

### Core Items (HR Managed)
- Black polo shirts
- Folding tables  
- Neoprene tablecloths

### Kit Workflow
```
Kit Templates (Rishi + Client) → Kit Instances (Field Deployment) → Location Tracking → Consumption → Replenishment
```

## Database Tables

### 1. Inventory Items
**Table**: `inventory_items`
**Purpose**: Items available for kit replenishment (consumables)

```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  sku VARCHAR(100),
  unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'each',
  cost_per_unit DECIMAL(10,2),
  supplier_info TEXT,
  is_consumable BOOLEAN NOT NULL DEFAULT true,
  minimum_stock_level INTEGER DEFAULT 0,
  maximum_stock_level INTEGER DEFAULT 1000,
  current_stock INTEGER NOT NULL DEFAULT 0,
  available_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Example Data**:
```sql
-- Brand-specific consumables
INSERT INTO inventory_items (name, category, unit_of_measure, is_consumable) VALUES
('Brand A Stickers', 'promotional', 'sheet', true),
('Brand A Pamphlets', 'educational', 'each', true),
('Brand A Samples', 'product', 'unit', true),
('Brand A Swag Bags', 'promotional', 'each', true);
```

### 2. Kit Templates
**Table**: `kit_templates`
**Purpose**: Predetermined by Rishi + client for specific brands/regions

```sql
CREATE TABLE kit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_organization_id UUID NOT NULL REFERENCES organizations(id),
  brand_id UUID REFERENCES brands(id),
  target_regions TEXT[], -- States/regions this template serves
  template_type VARCHAR(50) NOT NULL DEFAULT 'standard',
  estimated_value DECIMAL(10,2),
  setup_instructions TEXT,
  breakdown_instructions TEXT,
  usage_notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 3. Kit Template Items
**Table**: `kit_template_items`
**Purpose**: Items that should be in each kit template

```sql
CREATE TABLE kit_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_template_id UUID NOT NULL REFERENCES kit_templates(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_required INTEGER NOT NULL DEFAULT 1,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  usage_instructions TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 4. Kit Instances
**Table**: `kit_instances`
**Purpose**: Physical instances of templates in service

```sql
CREATE TABLE kit_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_template_id UUID NOT NULL REFERENCES kit_templates(id),
  instance_name VARCHAR(255) NOT NULL,
  serial_number VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'available', -- available, in_use, maintenance, needs_replenishment
  current_location VARCHAR(255),
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMP,
  region VARCHAR(100),
  condition VARCHAR(50) NOT NULL DEFAULT 'good', -- good, fair, poor, damaged
  last_inventory_check TIMESTAMP,
  next_replenishment_due TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 5. Kit Instance Items
**Table**: `kit_instance_items`
**Purpose**: Current items within each kit instance with quantities

```sql
CREATE TABLE kit_instance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_instance_id UUID NOT NULL REFERENCES kit_instances(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  current_quantity INTEGER NOT NULL DEFAULT 0,
  original_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_quantity INTEGER NOT NULL DEFAULT 0,
  consumed_quantity INTEGER NOT NULL DEFAULT 0,
  condition VARCHAR(50) NOT NULL DEFAULT 'good',
  expiration_date TIMESTAMP,
  last_restocked TIMESTAMP,
  needs_replenishment BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 6. Consumption Logs
**Table**: `consumption_logs`
**Purpose**: Track what gets consumed during bookings

```sql
CREATE TABLE consumption_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_instance_id UUID NOT NULL REFERENCES kit_instances(id),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  booking_id UUID REFERENCES bookings(id),
  quantity_consumed INTEGER NOT NULL,
  consumption_date TIMESTAMP NOT NULL DEFAULT NOW(),
  consumed_by UUID REFERENCES users(id),
  reason TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 7. Replenishment Requests
**Table**: `replenishment_requests`
**Purpose**: Track requests to replenish kit instances

```sql
CREATE TABLE replenishment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_instance_id UUID NOT NULL REFERENCES kit_instances(id),
  requested_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, in_progress, completed, canceled
  priority VARCHAR(50) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  due_date TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMP,
  total_estimated_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 8. Replenishment Request Items
**Table**: `replenishment_request_items`
**Purpose**: Specific items to replenish

```sql
CREATE TABLE replenishment_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  replenishment_request_id UUID NOT NULL REFERENCES replenishment_requests(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_requested INTEGER NOT NULL,
  quantity_approved INTEGER DEFAULT 0,
  quantity_supplied INTEGER DEFAULT 0,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  supplier VARCHAR(255),
  tracking_number VARCHAR(100),
  delivered_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Relationships

### Kit Template Relationships
```
kit_templates (1) → (many) kit_template_items
kit_templates (1) → (many) kit_instances
kit_templates (many) → (1) organizations (client)
kit_templates (many) → (1) brands
```

### Kit Instance Relationships
```
kit_instances (1) → (many) kit_instance_items
kit_instances (1) → (many) consumption_logs
kit_instances (1) → (many) replenishment_requests
```

### Inventory Relationships
```
inventory_items (1) → (many) kit_template_items
inventory_items (1) → (many) kit_instance_items
inventory_items (1) → (many) consumption_logs
inventory_items (1) → (many) replenishment_request_items
```

## Indexes

### Performance Indexes
```sql
-- Kit template indexes
CREATE INDEX idx_kit_templates_client_org ON kit_templates(client_organization_id);
CREATE INDEX idx_kit_templates_brand ON kit_templates(brand_id);
CREATE INDEX idx_kit_templates_active ON kit_templates(is_active);

-- Kit instance indexes
CREATE INDEX idx_kit_instances_template ON kit_instances(kit_template_id);
CREATE INDEX idx_kit_instances_status ON kit_instances(status);
CREATE INDEX idx_kit_instances_assigned ON kit_instances(assigned_to);
CREATE INDEX idx_kit_instances_region ON kit_instances(region);

-- Inventory indexes
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_active ON inventory_items(is_active);
CREATE INDEX idx_inventory_items_stock ON inventory_items(current_stock);

-- Consumption tracking indexes
CREATE INDEX idx_consumption_logs_kit_instance ON consumption_logs(kit_instance_id);
CREATE INDEX idx_consumption_logs_booking ON consumption_logs(booking_id);
CREATE INDEX idx_consumption_logs_date ON consumption_logs(consumption_date);

-- Replenishment indexes
CREATE INDEX idx_replenishment_requests_kit_instance ON replenishment_requests(kit_instance_id);
CREATE INDEX idx_replenishment_requests_status ON replenishment_requests(status);
CREATE INDEX idx_replenishment_requests_due_date ON replenishment_requests(due_date);
```

## Event Integration

### Event Types
```typescript
// Kit template events
KIT_TEMPLATE_CREATED
KIT_TEMPLATE_APPROVED
KIT_TEMPLATE_UPDATED

// Kit instance events
KIT_INSTANCE_DEPLOYED
KIT_INSTANCE_ASSIGNED
KIT_INSTANCE_STATUS_CHANGED

// Consumption events
INVENTORY_CONSUMED
CONSUMPTION_LOGGED

// Replenishment events
REPLENISHMENT_REQUESTED
REPLENISHMENT_APPROVED
REPLENISHMENT_COMPLETED
```

## Business Logic Rules

### Kit Template Rules
1. Templates must be approved before kit instances can be created
2. Templates tied to specific client organizations and brands
3. Target regions define where instances can be deployed

### Kit Instance Rules
1. Instances track physical location and assignment
2. Status automatically updates based on inventory levels
3. Condition monitoring triggers maintenance workflows

### Consumption Rules
1. All consumption must be logged with booking reference
2. Consumption triggers replenishment threshold checks
3. Critical items have priority replenishment

### Replenishment Rules
1. Automatic requests when items below minimum quantities
2. Approval workflow for cost management
3. Tracking and delivery confirmation

## Migration Strategy

### Phase 1: Schema Deployment
1. Create new tables in staging database
2. Set up indexes and constraints
3. Test data integrity

### Phase 2: Data Migration
1. Migrate existing kit data to new structure
2. Create template/instance relationships
3. Initialize inventory items

### Phase 3: Application Integration
1. Update API routes to use new schema
2. Implement new business logic
3. Create management interfaces

---

**Last Updated**: January 9, 2025
**Schema Version**: 2.0 (Complete Inventory/Kit System)
**Status**: Ready for Implementation