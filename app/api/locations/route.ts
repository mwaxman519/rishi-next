import { NextRequest, NextResponse } from "next/server";
import { LocationService } from "@/services/LocationService";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { verifyToken } from "../auth-service/utils/jwt";
import { getUserById } from "../auth-service/models/user-repository";

// Request validation schemas
const CreateLocationSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["venue", "warehouse", "office", "retail", "outdoor"]).optional().default("venue"),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  zipcode: z.string().regex(/^\d{5}(-\d{4})?$/),
  geo_lat: z.string().optional(),
  geo_lng: z.string().optional(),
  capacity: z.number().optional(),
  description: z.string().optional(),
});

const UpdateLocationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(["venue", "warehouse", "office", "retail", "outdoor"]).optional(),
  address1: z.string().min(1).optional(),
  address2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(2).max(2).optional(),
  zipcode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  geo_lat: z.string().optional(),
  geo_lng: z.string().optional(),
  capacity: z.number().optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
});

async function getCurrentUser(req: NextRequest) {
  try {
    // In development mode, return mock user
    if (process.env.NODE_ENV === "development") {
      return {
        id: "mock-user-id",
        username: "admin",
        role: "super_admin",
        organizationId: "00000000-0000-0000-0000-000000000001",
      };
    }

    const authToken = req.cookies.get("auth-token");
    
    if (!authToken) {
      return null;
    }

    const payload = await verifyToken(authToken.value);
    
    if (!payload || !payload.sub) {
      return null;
    }

    const user = await getUserById(payload.sub as string);
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      organizationId: "ec83b1b1-af6e-4465-806e-8d51a1449e86", // Default to Rishi Internal
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

async function checkPermission(user: any, permission: string) {
  // For super_admin, allow all permissions
  if (user?.role === "super_admin") {
    return true;
  }
  
  // In production, implement proper RBAC permission checking
  return true;
}

/**
 * Locations API Route - Microservices Pattern
 * Implements: Authentication → Validation → Service Layer → Event Publishing → Response
 */
export async function GET(req: NextRequest) {
  const correlationId = uuidv4();
  
  try {
    // Step 1: Authentication
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Authorization Check
    if (!(await checkPermission(user, "view:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    // Step 3: Service Layer (includes Event Publishing)
    const locationService = LocationService.getInstance();
    const activeLocations = await locationService.getAllLocations(
      user.id,
      (user as any).organizationId,
      correlationId
    );

    // Step 4: Response
    return NextResponse.json({
      success: true,
      data: activeLocations,
      metadata: {
        total: activeLocations.length,
        correlationId
      }
    });
  } catch (error) {
    console.error("Error in GET /api/locations:", error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: "LOCATIONS_FETCH_ERROR",
          message: "Failed to fetch locations",
          correlationId
        }
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const correlationId = uuidv4();
  
  try {
    // Step 1: Authentication
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Authorization Check
    if (!(await checkPermission(user, "create:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    // Step 3: Validation
    const body = await req.json();
    const validatedData = CreateLocationSchema.parse(body);

    // Step 4: Service Layer (includes Event Publishing)
    const locationService = LocationService.getInstance();
    const newLocation = await locationService.createLocation(
      validatedData,
      user.id,
      correlationId
    );

    // Step 5: Response
    return NextResponse.json({
      success: true,
      data: newLocation,
      metadata: {
        correlationId
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/locations:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors,
            correlationId
          }
        },
        { status: 400 },
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: "LOCATION_CREATE_ERROR",
          message: "Failed to create location",
          correlationId
        }
      },
      { status: 500 },
    );
  }
}

// Helper function to get or create test user ID
async function getOrCreateTestUserId(): Promise<string> {
  // Check if test user exists
  const existingUser = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'test@example.com'))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0].id;
  }

  // Create test user if it doesn't exist
  const testUser = await db
    .insert(schema.users)
    .values({
      id: uuidv4(),
      email: 'test@example.com',
      fullName: "Test User",
      
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning();

  return testUser[0].id;
}
