# Inventory & Kit System API Routes

## Overview

This document outlines the API routes for the new inventory and kit management system, following the prescribed Next.js serverless + microservices + event bus architecture.

## Architecture Pattern

### Request Flow
```
Request → Authentication → Validation → Service Layer → Event Publishing → Response
```

### Service Integration
- All routes use microservices pattern
- EventBusService publishes events for state changes
- UUID correlation tracking for audit trails
- Proper error handling and response formatting

## Authentication

All routes require authentication and proper permissions:

```typescript
// Required imports
import { isAuthenticated } from "@/server/routes";
import { PermissionGuard } from "@/components/rbac/PermissionGuard";
```

## API Routes

### 1. Inventory Items

#### GET /api/inventory/items
**Purpose**: Get all inventory items  
**Permissions**: `view:inventory`

```typescript
export async function GET(request: Request) {
  // Authentication check
  const user = await isAuthenticated(request);
  
  // Service layer call
  const items = await InventoryService.getAllItems();
  
  // Event publishing
  await EventBusService.publish({
    type: 'INVENTORY_VIEWED',
    userId: user.id,
    correlationId: generateUUID(),
    data: { itemCount: items.length }
  });
  
  return Response.json({ items });
}
```

**Response**:
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Brand A Stickers",
      "category": "promotional",
      "current_stock": 500,
      "available_stock": 450,
      "reorder_point": 10,
      "is_active": true
    }
  ]
}
```

#### POST /api/inventory/items
**Purpose**: Create new inventory item  
**Permissions**: `create:inventory`

```typescript
export async function POST(request: Request) {
  const user = await isAuthenticated(request);
  const data = await request.json();
  
  // Validation
  const validatedData = insertInventoryItemSchema.parse(data);
  
  // Service layer
  const item = await InventoryService.createItem(validatedData);
  
  // Event publishing
  await EventBusService.publish({
    type: 'INVENTORY_ITEM_CREATED',
    userId: user.id,
    correlationId: generateUUID(),
    data: { itemId: item.id, name: item.name }
  });
  
  return Response.json({ item }, { status: 201 });
}
```

#### PUT /api/inventory/items/[id]
**Purpose**: Update inventory item  
**Permissions**: `update:inventory`

### 2. Kit Templates

#### GET /api/kit-templates
**Purpose**: Get kit templates for organization  
**Permissions**: `view:kit-templates`

```typescript
export async function GET(request: Request) {
  const user = await isAuthenticated(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');
  
  const templates = await KitTemplateService.getByOrganization(organizationId);
  
  await EventBusService.publish({
    type: 'KIT_TEMPLATES_VIEWED',
    userId: user.id,
    organizationId,
    correlationId: generateUUID(),
    data: { templateCount: templates.length }
  });
  
  return Response.json({ templates });
}
```

**Response**:
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Brand A - California Kit",
      "client_organization_id": "uuid",
      "brand_id": "uuid",
      "target_regions": ["CA", "NV"],
      "template_type": "standard",
      "estimated_value": 150.00,
      "is_active": true,
      "items": [
        {
          "inventory_item_id": "uuid",
          "quantity_required": 100,
          "is_critical": true
        }
      ]
    }
  ]
}
```

#### POST /api/kit-templates
**Purpose**: Create new kit template  
**Permissions**: `create:kit-templates`

```typescript
export async function POST(request: Request) {
  const user = await isAuthenticated(request);
  const data = await request.json();
  
  // Validation
  const validatedData = insertKitTemplateSchema.parse(data);
  
  // Service layer
  const template = await KitTemplateService.create(validatedData);
  
  // Event publishing
  await EventBusService.publish({
    type: 'KIT_TEMPLATE_CREATED',
    userId: user.id,
    correlationId: generateUUID(),
    data: { 
      templateId: template.id, 
      name: template.name,
      organizationId: template.client_organization_id
    }
  });
  
  return Response.json({ template }, { status: 201 });
}
```

### 3. Kit Instances

#### GET /api/kit-instances
**Purpose**: Get kit instances  
**Permissions**: `view:kit-instances`

```typescript
export async function GET(request: Request) {
  const user = await isAuthenticated(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const region = searchParams.get('region');
  
  const instances = await KitInstanceService.getInstances({
    status,
    region,
    assignedTo: user.id // Filter by user if not admin
  });
  
  await EventBusService.publish({
    type: 'KIT_INSTANCES_VIEWED',
    userId: user.id,
    correlationId: generateUUID(),
    data: { instanceCount: instances.length, filters: { status, region } }
  });
  
  return Response.json({ instances });
}
```

**Response**:
```json
{
  "instances": [
    {
      "id": "uuid",
      "kit_template_id": "uuid",
      "instance_name": "Brand A Kit - LA #001",
      "serial_number": "BAK-LA-001",
      "status": "in_use",
      "current_location": "Los Angeles Dispensary",
      "assigned_to": "uuid",
      "region": "CA",
      "condition": "good",
      "last_inventory_check": "2025-01-08T10:00:00Z",
      "items": [
        {
          "inventory_item_id": "uuid",
          "current_quantity": 75,
          "original_quantity": 100,
          "needs_replenishment": true
        }
      ]
    }
  ]
}
```

#### POST /api/kit-instances
**Purpose**: Create new kit instance  
**Permissions**: `create:kit-instances`

#### PUT /api/kit-instances/[id]/assign
**Purpose**: Assign kit instance to user  
**Permissions**: `assign:kit-instances`

```typescript
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await isAuthenticated(request);
  const { assignedTo } = await request.json();
  
  const instance = await KitInstanceService.assign(params.id, assignedTo);
  
  await EventBusService.publish({
    type: 'KIT_INSTANCE_ASSIGNED',
    userId: user.id,
    correlationId: generateUUID(),
    data: { 
      instanceId: params.id,
      assignedTo,
      assignedBy: user.id
    }
  });
  
  return Response.json({ instance });
}
```

### 4. Consumption Tracking

#### POST /api/consumption/log
**Purpose**: Log consumption during booking  
**Permissions**: `log:consumption`

```typescript
export async function POST(request: Request) {
  const user = await isAuthenticated(request);
  const data = await request.json();
  
  // Validation
  const validatedData = insertConsumptionLogSchema.parse(data);
  
  // Service layer
  const log = await ConsumptionService.logConsumption(validatedData);
  
  // Update kit instance quantities
  await KitInstanceService.updateQuantities(
    validatedData.kit_instance_id,
    validatedData.inventory_item_id,
    validatedData.quantity_consumed
  );
  
  // Event publishing
  await EventBusService.publish({
    type: 'INVENTORY_CONSUMED',
    userId: user.id,
    correlationId: generateUUID(),
    data: {
      kitInstanceId: validatedData.kit_instance_id,
      itemId: validatedData.inventory_item_id,
      quantityConsumed: validatedData.quantity_consumed,
      bookingId: validatedData.booking_id
    }
  });
  
  return Response.json({ log }, { status: 201 });
}
```

#### GET /api/consumption/logs
**Purpose**: Get consumption logs  
**Permissions**: `view:consumption-logs`

### 5. Replenishment System

#### POST /api/replenishment/requests
**Purpose**: Create replenishment request  
**Permissions**: `create:replenishment-requests`

```typescript
export async function POST(request: Request) {
  const user = await isAuthenticated(request);
  const data = await request.json();
  
  // Validation
  const validatedData = insertReplenishmentRequestSchema.parse(data);
  
  // Service layer
  const request = await ReplenishmentService.createRequest(validatedData);
  
  // Event publishing
  await EventBusService.publish({
    type: 'REPLENISHMENT_REQUESTED',
    userId: user.id,
    correlationId: generateUUID(),
    data: {
      requestId: request.id,
      kitInstanceId: validatedData.kit_instance_id,
      priority: validatedData.priority
    }
  });
  
  return Response.json({ request }, { status: 201 });
}
```

#### PUT /api/replenishment/requests/[id]/approve
**Purpose**: Approve replenishment request  
**Permissions**: `approve:replenishment-requests`

```typescript
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await isAuthenticated(request);
  const { approved_items } = await request.json();
  
  const request = await ReplenishmentService.approve(params.id, approved_items, user.id);
  
  await EventBusService.publish({
    type: 'REPLENISHMENT_APPROVED',
    userId: user.id,
    correlationId: generateUUID(),
    data: {
      requestId: params.id,
      approvedBy: user.id,
      approvedItems: approved_items
    }
  });
  
  return Response.json({ request });
}
```

#### GET /api/replenishment/requests
**Purpose**: Get replenishment requests  
**Permissions**: `view:replenishment-requests`

### 6. Analytics & Reporting

#### GET /api/analytics/inventory
**Purpose**: Get inventory analytics  
**Permissions**: `view:analytics`

```typescript
export async function GET(request: Request) {
  const user = await isAuthenticated(request);
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  const analytics = await AnalyticsService.getInventoryAnalytics({
    startDate,
    endDate,
    organizationId: user.organizationId
  });
  
  return Response.json({ analytics });
}
```

**Response**:
```json
{
  "analytics": {
    "total_consumption": 1250,
    "replenishment_requests": 15,
    "kit_instances_active": 45,
    "low_stock_items": 8,
    "cost_analysis": {
      "total_spent": 2500.00,
      "avg_cost_per_booking": 55.50
    }
  }
}
```

## Service Layer Classes

### InventoryService
```typescript
class InventoryService {
  static async getAllItems(): Promise<InventoryItem[]>
  static async createItem(data: InsertInventoryItem): Promise<InventoryItem>
  static async updateStock(itemId: string, quantity: number): Promise<void>
  static async checkReorderPoints(): Promise<InventoryItem[]>
}
```

### KitTemplateService
```typescript
class KitTemplateService {
  static async getByOrganization(orgId: string): Promise<KitTemplate[]>
  static async create(data: InsertKitTemplate): Promise<KitTemplate>
  static async approve(templateId: string, userId: string): Promise<KitTemplate>
  static async addItems(templateId: string, items: InsertKitTemplateItem[]): Promise<void>
}
```

### KitInstanceService
```typescript
class KitInstanceService {
  static async getInstances(filters: any): Promise<KitInstance[]>
  static async create(data: InsertKitInstance): Promise<KitInstance>
  static async assign(instanceId: string, userId: string): Promise<KitInstance>
  static async updateQuantities(instanceId: string, itemId: string, consumed: number): Promise<void>
}
```

## Error Handling

### Standard Error Responses
```typescript
// Authentication error
{ error: "Unauthorized", code: 401 }

// Permission error
{ error: "Forbidden", code: 403 }

// Validation error
{ error: "Invalid input", details: validationErrors, code: 400 }

// Not found error
{ error: "Resource not found", code: 404 }

// Server error
{ error: "Internal server error", code: 500 }
```

## Event Bus Integration

### Event Types
```typescript
// Inventory events
INVENTORY_ITEM_CREATED
INVENTORY_ITEM_UPDATED
INVENTORY_CONSUMED
INVENTORY_RESTOCKED

// Kit events  
KIT_TEMPLATE_CREATED
KIT_TEMPLATE_APPROVED
KIT_INSTANCE_DEPLOYED
KIT_INSTANCE_ASSIGNED

// Replenishment events
REPLENISHMENT_REQUESTED
REPLENISHMENT_APPROVED
REPLENISHMENT_COMPLETED
```

### Event Structure
```typescript
interface InventoryEvent {
  type: string;
  userId: string;
  organizationId?: string;
  correlationId: string;
  timestamp: Date;
  data: Record<string, any>;
}
```

---

**Last Updated**: January 9, 2025
**API Version**: 2.0 (Complete Inventory/Kit System)
**Architecture**: Next.js Serverless + Microservices + Event Bus