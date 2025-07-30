import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { OrganizationService } from &quot;@/services/OrganizationService&quot;;
import { getCurrentUser } from &quot;../auth-service/utils/auth-utils&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import { z } from &quot;zod&quot;;

// Request validation schemas
const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum([&quot;internal&quot;, &quot;client&quot;, &quot;partner&quot;]),
  tier: z.enum([&quot;tier_1&quot;, &quot;tier_2&quot;, &quot;tier_3&quot;]),
  status: z.string().optional().default(&quot;active&quot;),
});

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum([&quot;internal&quot;, &quot;client&quot;, &quot;partner&quot;]).optional(),
  tier: z.enum([&quot;tier_1&quot;, &quot;tier_2&quot;, &quot;tier_3&quot;]).optional(),
  status: z.string().optional(),
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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Step 2: Authorization Check
    if (user.role !== &quot;internal_admin&quot; && user.role !== &quot;super_admin&quot;) {
      return NextResponse.json(
        { error: &quot;Forbidden. Admin access required.&quot; },
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
    console.error(&quot;Error in GET /api/organizations:&quot;, error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: &quot;ORGANIZATIONS_FETCH_ERROR&quot;,
          message: &quot;Failed to fetch organizations&quot;,
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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Step 2: Authorization Check
    if (user.role !== &quot;super_admin&quot;) {
      return NextResponse.json(
        { error: &quot;Forbidden. Super admin access required.&quot; },
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
    console.error(&quot;Error in POST /api/organizations:&quot;, error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: &quot;VALIDATION_ERROR&quot;,
            message: &quot;Invalid request data&quot;,
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
          code: &quot;ORGANIZATION_CREATE_ERROR&quot;,
          message: &quot;Failed to create organization&quot;,
          correlationId
        }
      },
      { status: 500 },
    );
  }
}
