# Locations Service Implementation Guide

## Overview

This guide provides a detailed roadmap for refactoring the Locations feature into a proper service-oriented architecture within our Next.js application. This implementation will serve as a reference for other services and establish best practices for service-oriented development.

## Service Architecture

The Locations service will be structured as follows:

```
app/
├── services/
│   └── locations/
│       ├── models.ts           # Domain models and DTOs
│       ├── repository.ts       # Data access layer
│       ├── locationsService.ts # Business logic
│       └── index.ts            # Public API
├── api/
│   └── locations/
│       ├── route.ts            # Uses locationsService
│       ├── [id]/
│       │   ├── route.ts        # Uses locationsService
│       │   ├── approve/route.ts
│       │   └── reject/route.ts
├── client/
│   ├── services/
│   │   └── locations.ts        # Client adapter for locations service
│   └── hooks/
│       └── useLocations.ts     # Uses locations client service
└── components/
    └── locations/
        ├── PlacesAutocomplete.tsx
        └── LocationMap.tsx
```

## Implementation Steps

### Step 1: Define Domain Models

Create `app/services/locations/models.ts`:

```typescript
import { z } from "zod";

// Location status enum
export enum LocationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

// Location type enum
export enum LocationType {
  RETAIL = "retail",
  MEDICAL = "medical",
  PROCESSING = "processing",
}

// Base location properties
export const locationBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address1: z.string().min(1, "Street address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  stateId: z.string().min(1, "State is required"),
  zipcode: z.string().min(1, "Zipcode is required"),
  type: z.nativeEnum(LocationType).default(LocationType.RETAIL),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

// Schema for creating a location
export const createLocationSchema = locationBaseSchema.omit({});

// Schema for location entity (internal)
export const locationSchema = locationBaseSchema.extend({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  status: z.nativeEnum(LocationStatus).default(LocationStatus.PENDING),
  rejectionReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  requesterId: z.string().uuid().optional(),
});

// Schema for updating a location
export const updateLocationSchema = locationBaseSchema.partial();

// Types derived from schemas
export type CreateLocationParams = z.infer<typeof createLocationSchema>;
export type UpdateLocationParams = z.infer<typeof updateLocationSchema>;
export type Location = z.infer<typeof locationSchema>;

// DTOs for external consumption
export interface LocationDTO {
  id: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  stateId: string;
  state?: {
    id: string;
    name: string;
    abbreviation: string;
  };
  zipcode: string;
  type: string;
  status: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  requester?: {
    id: string;
    fullName: string;
    email: string;
  };
}

// Approval/rejection parameters
export interface ApproveLocationParams {
  id: string;
}

export interface RejectLocationParams {
  id: string;
  reason: string;
}
```

### Step 2: Implement Repository Layer

Create `app/services/locations/repository.ts`:

```typescript
import { db } from "@/server/db";
import { locations, states, users } from "@/shared/schema";
import { eq, and, or, desc } from "drizzle-orm";
import {
  Location,
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
} from "./models";

export class LocationRepository {
  /**
   * Find all locations with optional filtering
   */
  async findAll(filters: Record<string, any> = {}): Promise<LocationDTO[]> {
    // Build query filters
    let queryFilters = [];

    if (filters.stateId) {
      queryFilters.push(eq(locations.stateId, filters.stateId));
    }

    if (filters.status) {
      queryFilters.push(eq(locations.status, filters.status));
    }

    if (filters.type) {
      queryFilters.push(eq(locations.type, filters.type));
    }

    if (filters.organizationId) {
      queryFilters.push(eq(locations.organizationId, filters.organizationId));
    }

    // Execute query with relations
    const locationsData = await db
      .select()
      .from(locations)
      .leftJoin(states, eq(locations.stateId, states.id))
      .leftJoin(users, eq(locations.requesterId, users.id))
      .where(queryFilters.length > 0 ? and(...queryFilters) : undefined)
      .orderBy(desc(locations.createdAt));

    // Map to DTOs
    return locationsData.map((row) => this.mapToDTO(row));
  }

  /**
   * Find location by ID
   */
  async findById(id: string): Promise<LocationDTO | null> {
    const [locationData] = await db
      .select()
      .from(locations)
      .leftJoin(states, eq(locations.stateId, states.id))
      .leftJoin(users, eq(locations.requesterId, users.id))
      .where(eq(locations.id, id));

    return locationData ? this.mapToDTO(locationData) : null;
  }

  /**
   * Create a new location
   */
  async create(
    data: CreateLocationParams,
    organizationId: string,
    requesterId?: string,
  ): Promise<LocationDTO> {
    const [newLocation] = await db
      .insert(locations)
      .values({
        ...data,
        organizationId,
        requesterId: requesterId || null,
        status: "pending",
      })
      .returning();

    return this.findById(newLocation.id) as Promise<LocationDTO>;
  }

  /**
   * Update an existing location
   */
  async update(id: string, data: UpdateLocationParams): Promise<LocationDTO> {
    const [updatedLocation] = await db
      .update(locations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(locations.id, id))
      .returning();

    return this.findById(updatedLocation.id) as Promise<LocationDTO>;
  }

  /**
   * Delete a location
   */
  async delete(id: string): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  /**
   * Map raw database rows to DTO
   */
  private mapToDTO(row: any): LocationDTO {
    return {
      id: row.locations.id,
      name: row.locations.name,
      address1: row.locations.address1,
      address2: row.locations.address2 || undefined,
      city: row.locations.city,
      stateId: row.locations.stateId,
      state: row.states
        ? {
            id: row.states.id,
            name: row.states.name,
            abbreviation: row.states.abbreviation,
          }
        : undefined,
      zipcode: row.locations.zipcode,
      type: row.locations.type,
      status: row.locations.status,
      phone: row.locations.phone || undefined,
      email: row.locations.email || undefined,
      website: row.locations.website || undefined,
      latitude: row.locations.latitude || undefined,
      longitude: row.locations.longitude || undefined,
      contactName: row.locations.contactName || undefined,
      contactEmail: row.locations.contactEmail || undefined,
      contactPhone: row.locations.contactPhone || undefined,
      notes: row.locations.notes || undefined,
      rejectionReason: row.locations.rejectionReason || undefined,
      createdAt: row.locations.createdAt.toISOString(),
      updatedAt: row.locations.updatedAt.toISOString(),
      requester: row.users
        ? {
            id: row.users.id,
            fullName: row.users.fullName,
            email: row.users.email,
          }
        : undefined,
    };
  }
}
```

### Step 3: Implement Service Layer

Create `app/services/locations/locationsService.ts`:

```typescript
import { LocationRepository } from "./repository";
import {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
  ApproveLocationParams,
  RejectLocationParams,
  createLocationSchema,
} from "./models";

export class LocationsService {
  private repository: LocationRepository;

  constructor() {
    this.repository = new LocationRepository();
  }

  /**
   * Get all locations with optional filtering
   */
  async getAllLocations(
    filters: Record<string, any> = {},
  ): Promise<LocationDTO[]> {
    return this.repository.findAll(filters);
  }

  /**
   * Get a single location by ID
   */
  async getLocationById(id: string): Promise<LocationDTO | null> {
    return this.repository.findById(id);
  }

  /**
   * Create a new location
   */
  async createLocation(
    data: CreateLocationParams,
    organizationId: string,
    requesterId?: string,
  ): Promise<LocationDTO> {
    // Validate input data
    const validatedData = createLocationSchema.parse(data);

    // Create location
    return this.repository.create(validatedData, organizationId, requesterId);
  }

  /**
   * Update an existing location
   */
  async updateLocation(
    id: string,
    data: UpdateLocationParams,
  ): Promise<LocationDTO> {
    // Check if location exists
    const existingLocation = await this.repository.findById(id);
    if (!existingLocation) {
      throw new Error(`Location with ID ${id} not found`);
    }

    // Update location
    return this.repository.update(id, data);
  }

  /**
   * Delete a location
   */
  async deleteLocation(id: string): Promise<void> {
    // Check if location exists
    const existingLocation = await this.repository.findById(id);
    if (!existingLocation) {
      throw new Error(`Location with ID ${id} not found`);
    }

    // Delete location
    await this.repository.delete(id);
  }

  /**
   * Approve a location
   */
  async approveLocation({ id }: ApproveLocationParams): Promise<LocationDTO> {
    // Check if location exists
    const existingLocation = await this.repository.findById(id);
    if (!existingLocation) {
      throw new Error(`Location with ID ${id} not found`);
    }

    // Only allow approving pending locations
    if (existingLocation.status !== "pending") {
      throw new Error(
        `Cannot approve location with status ${existingLocation.status}`,
      );
    }

    // Approve location
    return this.repository.update(id, {
      status: "approved",
      rejectionReason: undefined,
    });
  }

  /**
   * Reject a location
   */
  async rejectLocation({
    id,
    reason,
  }: RejectLocationParams): Promise<LocationDTO> {
    // Check if location exists
    const existingLocation = await this.repository.findById(id);
    if (!existingLocation) {
      throw new Error(`Location with ID ${id} not found`);
    }

    // Only allow rejecting pending locations
    if (existingLocation.status !== "pending") {
      throw new Error(
        `Cannot reject location with status ${existingLocation.status}`,
      );
    }

    // Reject location
    return this.repository.update(id, {
      status: "rejected",
      rejectionReason: reason,
    });
  }
}
```

### Step 4: Create Service Entry Point

Create `app/services/locations/index.ts`:

```typescript
import { LocationsService } from "./locationsService";

// Export singleton instance
export const locationsService = new LocationsService();

// Export types and interfaces
export * from "./models";
```

### Step 5: Update API Routes

Update `app/api/locations/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { locationsService } from "@/services/locations";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";
import { getOrganizationFromRequest } from "@/lib/organizations";

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      stateId: searchParams.get("stateId") || undefined,
      status: searchParams.get("status") || undefined,
      type: searchParams.get("type") || undefined,
    };

    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to view locations
    if (!(await checkPermission(req, "view:locations"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get organization context
    const organization = await getOrganizationFromRequest(req);
    if (organization) {
      filters.organizationId = organization.id;
    }

    // Use service to get locations
    const locations = await locationsService.getAllLocations(filters);

    return NextResponse.json({ locations });
  } catch (error: any) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch locations" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to create locations
    if (!(await checkPermission(req, "create:locations"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get organization context
    const organization = await getOrganizationFromRequest(req);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 },
      );
    }

    // Parse request body
    const data = await req.json();

    // Use service to create location
    const location = await locationsService.createLocation(
      data,
      organization.id,
      user.id,
    );

    return NextResponse.json({ location }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating location:", error);

    // Handle validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create location" },
      { status: 500 },
    );
  }
}
```

Update `app/api/locations/[id]/approve/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { locationsService } from "@/services/locations";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to approve locations
    if (!(await checkPermission(req, "approve:locations"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use service to approve location
    const location = await locationsService.approveLocation({ id });

    return NextResponse.json({ location });
  } catch (error: any) {
    console.error("Error approving location:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve location" },
      { status: 500 },
    );
  }
}
```

### Step 6: Create Client Service Adapter

Create `app/client/services/locations.ts`:

```typescript
import { api } from "@/lib/api";
import type {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
  ApproveLocationParams,
  RejectLocationParams,
} from "@/services/locations";

export class LocationsClientService {
  /**
   * Get all locations with optional filtering
   */
  async getAllLocations(filters = {}): Promise<LocationDTO[]> {
    const queryString = new URLSearchParams(filters as any).toString();
    const response = await api.get(`/api/locations?${queryString}`);
    return response.data.locations;
  }

  /**
   * Get a single location by ID
   */
  async getLocationById(id: string): Promise<LocationDTO | null> {
    const response = await api.get(`/api/locations/${id}`);
    return response.data.location;
  }

  /**
   * Create a new location
   */
  async createLocation(data: CreateLocationParams): Promise<LocationDTO> {
    const response = await api.post("/api/locations", data);
    return response.data.location;
  }

  /**
   * Update an existing location
   */
  async updateLocation(
    id: string,
    data: UpdateLocationParams,
  ): Promise<LocationDTO> {
    const response = await api.patch(`/api/locations/${id}`, data);
    return response.data.location;
  }

  /**
   * Delete a location
   */
  async deleteLocation(id: string): Promise<void> {
    await api.delete(`/api/locations/${id}`);
  }

  /**
   * Approve a location
   */
  async approveLocation(id: string): Promise<LocationDTO> {
    const response = await api.patch(`/api/locations/${id}/approve`);
    return response.data.location;
  }

  /**
   * Reject a location
   */
  async rejectLocation({
    id,
    reason,
  }: {
    id: string;
    reason?: string;
  }): Promise<LocationDTO> {
    const response = await api.patch(`/api/locations/${id}/reject`, { reason });
    return response.data.location;
  }
}

// Export singleton instance
export const locationsClient = new LocationsClientService();
```

### Step 7: Update React Hooks

Update `app/hooks/useLocations.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { locationsClient } from "@/client/services/locations";
import type {
  LocationDTO,
  CreateLocationParams,
  UpdateLocationParams,
} from "@/services/locations";
import { useToast } from "./use-toast";

export function useLocations(filters = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: locations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/locations", filters],
    queryFn: () => locationsClient.getAllLocations(filters),
  });

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLocationParams) =>
      locationsClient.createLocation(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create location",
        variant: "destructive",
      });
    },
  });

  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationParams }) =>
      locationsClient.updateLocation(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update location",
        variant: "destructive",
      });
    },
  });

  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationsClient.deleteLocation(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete location",
        variant: "destructive",
      });
    },
  });

  // Approve location mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => locationsClient.approveLocation(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve location",
        variant: "destructive",
      });
    },
  });

  // Reject location mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      locationsClient.rejectLocation({ id, reason }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location rejected successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject location",
        variant: "destructive",
      });
    },
  });

  return {
    locations,
    isLoading,
    error,
    refetch,
    createLocation: createMutation.mutateAsync,
    updateLocation: updateMutation.mutateAsync,
    deleteLocation: deleteMutation.mutateAsync,
    approveLocation: approveMutation.mutateAsync,
    rejectLocation: rejectMutation.mutateAsync,
    createMutation,
    updateMutation,
    deleteMutation,
    approveMutation,
    rejectMutation,
  };
}

export function useLocation(id: string) {
  const {
    data: location,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/locations", id],
    queryFn: () => locationsClient.getLocationById(id),
    enabled: !!id,
  });

  return {
    location,
    isLoading,
    error,
    refetch,
  };
}
```

## Testing the Implementation

### Unit Tests

Create `__tests__/services/locations.test.ts`:

```typescript
import { locationsService } from "@/services/locations";
import { db } from "@/server/db";

// Mock the database
jest.mock("@/server/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("LocationsService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getAllLocations", () => {
    it("should retrieve all locations", async () => {
      // Mock implementation
      const mockLocations = [{ id: "1", name: "Test Location" }];
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockLocations),
              }),
            }),
          }),
        }),
      });

      // Call the service
      const locations = await locationsService.getAllLocations();

      // Assert
      expect(locations).toEqual(mockLocations);
      expect(db.select).toHaveBeenCalled();
    });
  });

  // Add more tests for other methods
});
```

## Benefits of this Architecture

1. **Clear Separation of Concerns**: Each layer has a specific responsibility.
2. **Improved Testability**: Business logic can be tested independently.
3. **Type Safety**: Strong typing across all layers.
4. **Consistent Interface**: Standardized approach to service implementation.
5. **Business Logic Centralization**: Business rules are contained in the service layer.
6. **Reusability**: Components can be reused across different parts of the application.
7. **Maintainability**: Easier to understand and maintain.

## Migration Strategy

1. Implement the service layer first without changing existing code.
2. Gradually update API routes to use the new service.
3. Create client service adapter.
4. Update hooks to use the client service adapter.
5. Update UI components as needed.

This phased approach allows for incremental migration without breaking existing functionality.
