# Inventory & Kit System Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the new inventory and kit management system in the Rishi Platform, following the prescribed Next.js serverless + microservices + event bus architecture.

## Business Model Implementation

### Core Workflow
```
1. Rishi + Client create Kit Templates for specific brands/regions
2. Kit Instances are deployed to field locations
3. Brand Agents use kits during bookings (consuming items)
4. Consumption is tracked and logged
5. Replenishment requests are generated and approved
6. New inventory items are supplied to replenish kits
```

### Core Staff Items (HR Managed)
- Black polo shirts (tracked in HR system)
- Folding tables (tracked in HR system)
- Neoprene tablecloths (tracked in HR system)

### Kit-Specific Items (Inventory System)
- Brand-specific pamphlets
- Stickers and promotional materials
- Product samples
- Swag bags and giveaways

## Database Migration

### Step 1: Deploy New Schema
```bash
# Push new schema to database
npm run db:push

# Verify tables created
npm run db:studio
```

### Step 2: Initialize Core Data
```sql
-- Create sample inventory items
INSERT INTO inventory_items (name, category, unit_of_measure, current_stock, reorder_point, is_consumable) VALUES
('Generic Pamphlets', 'educational', 'each', 1000, 50, true),
('Generic Stickers', 'promotional', 'sheet', 500, 25, true),
('Generic Swag Bags', 'promotional', 'each', 200, 10, true),
('Product Samples', 'product', 'unit', 100, 5, true);
```

### Step 3: Create Sample Kit Templates
```sql
-- Create kit template for Brand A in California
INSERT INTO kit_templates (name, description, client_organization_id, target_regions, template_type, created_by) VALUES
('Brand A - California Kit', 'Standard kit for Brand A activations in California', 'client-org-uuid', ARRAY['CA', 'NV'], 'standard', 'admin-user-uuid');

-- Add items to template
INSERT INTO kit_template_items (kit_template_id, inventory_item_id, quantity_required, is_critical) VALUES
('template-uuid', 'pamphlet-uuid', 100, true),
('template-uuid', 'sticker-uuid', 50, false),
('template-uuid', 'swag-uuid', 25, false);
```

## Service Layer Implementation

### 1. Create InventoryService
```typescript
// server/services/InventoryService.ts
import { db } from "@/server/db";
import { inventoryItems, kitTemplates, kitInstances } from "@shared/schema";
import { eq, and, lte } from "drizzle-orm";
import { EventBusService } from "./EventBusService";

export class InventoryService {
  static async getAllItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(eq(inventoryItems.is_active, true));
  }

  static async createItem(data: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db.insert(inventoryItems).values(data).returning();
    
    // Publish event
    await EventBusService.publish({
      type: 'INVENTORY_ITEM_CREATED',
      data: { itemId: item.id, name: item.name }
    });
    
    return item;
  }

  static async updateStock(itemId: string, quantity: number): Promise<void> {
    await db.update(inventoryItems)
      .set({ 
        current_stock: quantity, 
        available_stock: quantity, 
        updated_at: new Date() 
      })
      .where(eq(inventoryItems.id, itemId));
  }

  static async checkReorderPoints(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems)
      .where(and(
        eq(inventoryItems.is_active, true),
        lte(inventoryItems.current_stock, inventoryItems.reorder_point)
      ));
  }
}
```

### 2. Create KitTemplateService
```typescript
// server/services/KitTemplateService.ts
import { db } from "@/server/db";
import { kitTemplates, kitTemplateItems, inventoryItems } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { EventBusService } from "./EventBusService";

export class KitTemplateService {
  static async getByOrganization(organizationId: string): Promise<KitTemplate[]> {
    return await db.select().from(kitTemplates)
      .where(and(
        eq(kitTemplates.client_organization_id, organizationId),
        eq(kitTemplates.is_active, true)
      ));
  }

  static async create(data: InsertKitTemplate): Promise<KitTemplate> {
    const [template] = await db.insert(kitTemplates).values(data).returning();
    
    // Publish event
    await EventBusService.publish({
      type: 'KIT_TEMPLATE_CREATED',
      data: { 
        templateId: template.id, 
        name: template.name,
        organizationId: template.client_organization_id 
      }
    });
    
    return template;
  }

  static async approve(templateId: string, userId: string): Promise<KitTemplate> {
    const [template] = await db.update(kitTemplates)
      .set({ 
        approved_by: userId, 
        approved_at: new Date(),
        updated_at: new Date() 
      })
      .where(eq(kitTemplates.id, templateId))
      .returning();

    // Publish event
    await EventBusService.publish({
      type: 'KIT_TEMPLATE_APPROVED',
      data: { templateId, approvedBy: userId }
    });

    return template;
  }

  static async addItems(templateId: string, items: InsertKitTemplateItem[]): Promise<void> {
    await db.insert(kitTemplateItems).values(
      items.map(item => ({ ...item, kit_template_id: templateId }))
    );
  }
}
```

### 3. Create KitInstanceService
```typescript
// server/services/KitInstanceService.ts
import { db } from "@/server/db";
import { kitInstances, kitInstanceItems } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { EventBusService } from "./EventBusService";

export class KitInstanceService {
  static async getInstances(filters: any): Promise<KitInstance[]> {
    let query = db.select().from(kitInstances);
    
    if (filters.status) {
      query = query.where(eq(kitInstances.status, filters.status));
    }
    
    if (filters.region) {
      query = query.where(eq(kitInstances.region, filters.region));
    }
    
    if (filters.assignedTo) {
      query = query.where(eq(kitInstances.assigned_to, filters.assignedTo));
    }
    
    return await query;
  }

  static async create(data: InsertKitInstance): Promise<KitInstance> {
    const [instance] = await db.insert(kitInstances).values(data).returning();
    
    // Publish event
    await EventBusService.publish({
      type: 'KIT_INSTANCE_DEPLOYED',
      data: { 
        instanceId: instance.id, 
        name: instance.instance_name,
        region: instance.region 
      }
    });
    
    return instance;
  }

  static async assign(instanceId: string, userId: string): Promise<KitInstance> {
    const [instance] = await db.update(kitInstances)
      .set({ 
        assigned_to: userId, 
        assigned_at: new Date(),
        updated_at: new Date() 
      })
      .where(eq(kitInstances.id, instanceId))
      .returning();

    // Publish event
    await EventBusService.publish({
      type: 'KIT_INSTANCE_ASSIGNED',
      data: { instanceId, assignedTo: userId }
    });

    return instance;
  }

  static async updateQuantities(instanceId: string, itemId: string, consumed: number): Promise<void> {
    // Update kit instance item quantities
    await db.update(kitInstanceItems)
      .set({ 
        current_quantity: sql`current_quantity - ${consumed}`,
        consumed_quantity: sql`consumed_quantity + ${consumed}`,
        needs_replenishment: sql`current_quantity - ${consumed} <= minimum_quantity`,
        updated_at: new Date()
      })
      .where(and(
        eq(kitInstanceItems.kit_instance_id, instanceId),
        eq(kitInstanceItems.inventory_item_id, itemId)
      ));
  }
}
```

## API Route Implementation

### 1. Inventory Items API
```typescript
// app/api/inventory/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/server/routes';
import { InventoryService } from '@/server/services/InventoryService';
import { insertInventoryItemSchema } from '@shared/schema';

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticated(request);
    const items = await InventoryService.getAllItems();
    
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await isAuthenticated(request);
    const data = await request.json();
    
    // Validate input
    const validatedData = insertInventoryItemSchema.parse(data);
    
    // Create item
    const item = await InventoryService.createItem(validatedData);
    
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2. Kit Templates API
```typescript
// app/api/kit-templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/server/routes';
import { KitTemplateService } from '@/server/services/KitTemplateService';
import { insertKitTemplateSchema } from '@shared/schema';

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticated(request);
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    const templates = await KitTemplateService.getByOrganization(organizationId);
    
    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await isAuthenticated(request);
    const data = await request.json();
    
    // Validate input
    const validatedData = insertKitTemplateSchema.parse(data);
    
    // Create template
    const template = await KitTemplateService.create(validatedData);
    
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Frontend Implementation

### 1. Kit Template Management Component
```typescript
// app/components/inventory/KitTemplateManager.tsx
"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/rbac/PermissionGuard';

export function KitTemplateManager({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient();
  
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/kit-templates', organizationId],
    queryFn: () => fetch(`/api/kit-templates?organizationId=${organizationId}`).then(res => res.json())
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/kit-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kit-templates'] });
    }
  });

  if (isLoading) return <div>Loading templates...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kit Templates</h2>
        <PermissionGuard permission="create:kit-templates">
          <Button onClick={() => {/* Open create modal */}}>
            Create Template
          </Button>
        </PermissionGuard>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates?.templates?.map((template: any) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm">Regions: {template.target_regions?.join(', ')}</span>
                <span className="text-sm font-medium">${template.estimated_value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 2. Kit Instance Tracker Component
```typescript
// app/components/inventory/KitInstanceTracker.tsx
"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/rbac/PermissionGuard';

export function KitInstanceTracker() {
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: instances, isLoading } = useQuery({
    queryKey: ['/api/kit-instances', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      return fetch(`/api/kit-instances?${params}`).then(res => res.json());
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'needs_replenishment': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div>Loading kit instances...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kit Instances</h2>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="maintenance">Maintenance</option>
          <option value="needs_replenishment">Needs Replenishment</option>
        </select>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instances?.instances?.map((instance: any) => (
          <Card key={instance.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{instance.instance_name}</CardTitle>
                <Badge className={getStatusColor(instance.status)}>
                  {instance.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Serial:</strong> {instance.serial_number}</div>
                <div><strong>Location:</strong> {instance.current_location}</div>
                <div><strong>Region:</strong> {instance.region}</div>
                <div><strong>Condition:</strong> {instance.condition}</div>
                {instance.last_inventory_check && (
                  <div><strong>Last Check:</strong> {new Date(instance.last_inventory_check).toLocaleDateString()}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Testing Strategy

### Unit Tests
```typescript
// tests/services/InventoryService.test.ts
import { InventoryService } from '@/server/services/InventoryService';
import { db } from '@/server/db';

describe('InventoryService', () => {
  beforeEach(async () => {
    // Clear test database
    await db.delete(inventoryItems);
  });

  it('should create inventory item', async () => {
    const itemData = {
      name: 'Test Item',
      category: 'test',
      unit_of_measure: 'each',
      current_stock: 100,
      reorder_point: 10
    };

    const item = await InventoryService.createItem(itemData);
    
    expect(item.name).toBe('Test Item');
    expect(item.current_stock).toBe(100);
  });

  it('should check reorder points', async () => {
    // Create item below reorder point
    await InventoryService.createItem({
      name: 'Low Stock Item',
      category: 'test',
      current_stock: 5,
      reorder_point: 10
    });

    const lowStockItems = await InventoryService.checkReorderPoints();
    expect(lowStockItems).toHaveLength(1);
    expect(lowStockItems[0].name).toBe('Low Stock Item');
  });
});
```

### Integration Tests
```typescript
// tests/api/inventory.test.ts
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '@/server/app';

describe('/api/inventory/items', () => {
  it('should get all inventory items', async () => {
    const response = await request(app)
      .get('/api/inventory/items')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('items');
  });

  it('should create inventory item', async () => {
    const itemData = {
      name: 'Test Item',
      category: 'test',
      unit_of_measure: 'each',
      current_stock: 100
    };

    const response = await request(app)
      .post('/api/inventory/items')
      .set('Authorization', 'Bearer valid-token')
      .send(itemData);
    
    expect(response.status).toBe(201);
    expect(response.body.item.name).toBe('Test Item');
  });
});
```

## Deployment Checklist

### Pre-Deployment
- [ ] Database schema deployed to staging
- [ ] Sample data created for testing
- [ ] All service layer classes implemented
- [ ] API routes tested and functional
- [ ] Frontend components created
- [ ] Permission guards in place
- [ ] Event bus integration working

### Post-Deployment
- [ ] Monitor database performance
- [ ] Check event publishing
- [ ] Verify authentication works
- [ ] Test kit creation workflow
- [ ] Verify consumption tracking
- [ ] Test replenishment requests

## Performance Considerations

### Database Optimization
- Index on frequently queried fields
- Use connection pooling
- Batch operations where possible
- Monitor query performance

### API Optimization
- Implement pagination for large datasets
- Use appropriate HTTP caching
- Optimize N+1 queries
- Monitor response times

### Frontend Optimization
- Use React.memo for expensive components
- Implement proper loading states
- Cache query results appropriately
- Optimize bundle sizes

---

**Last Updated**: January 9, 2025
**Implementation Status**: Ready for Development
**Architecture**: Next.js Serverless + Microservices + Event Bus