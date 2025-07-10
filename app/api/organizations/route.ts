import { NextRequest, NextResponse } from "next/server";
import { OrganizationService } from "@/services/OrganizationService";
import { getCurrentUser } from "../auth-service/utils/auth-utils";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// Request validation schemas
const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["internal", "client", "partner"]),
  tier: z.enum(["tier_1", "tier_2", "tier_3"]),
  active: z.boolean().optional().default(true),
});

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["internal", "client", "partner"]).optional(),
  tier: z.enum(["tier_1", "tier_2", "tier_3"]).optional(),
  active: z.boolean().optional(),
});

/**
 * Organizations API Route - Microservices Pattern
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
    if (user.role !== "internal_admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }

    // Step 3: Service Layer (includes Event Publishing)
    const organizationService = OrganizationService.getInstance();
    const allOrganizations = await organizationService.getAllOrganizations(
      user.id,
      correlationId
    );

    // Step 4: Response
    return NextResponse.json({
      success: true,
      data: allOrganizations,
      metadata: {
        total: allOrganizations.length,
        correlationId
      }
    });
  } catch (error) {
    console.error("Error in GET /api/organizations:", error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: "ORGANIZATIONS_FETCH_ERROR",
          message: "Failed to fetch organizations",
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
    if (user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden. Super admin access required." },
        { status: 403 },
      );
    }

    // Step 3: Validation
    const body = await req.json();
    const validatedData = CreateOrganizationSchema.parse(body);

    // Step 4: Service Layer (includes Event Publishing)
    const organizationService = OrganizationService.getInstance();
    const newOrganization = await organizationService.createOrganization(
      validatedData,
      user.id,
      correlationId
    );

    // Step 5: Response
    return NextResponse.json({
      success: true,
      data: newOrganization,
      metadata: {
        correlationId
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/organizations:", error);
    
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
          code: "ORGANIZATION_CREATE_ERROR",
          message: "Failed to create organization",
          correlationId
        }
      },
      { status: 500 },
    );
  }
}
