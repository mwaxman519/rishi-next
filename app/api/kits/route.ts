import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { z } from &quot;zod&quot;;
import { db } from &quot;@/lib/db&quot;;
import { kitInstances, insertKitSchema, USER_ROLES, kits } from &quot;@shared/schema&quot;;
import { and, eq } from &quot;drizzle-orm&quot;;
import { getOrganizationHeaderData } from &quot;@/lib/organization-context&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;

// GET /api/kits
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(req);

    // Check if user has permission to view kits
    const hasPermission = await checkPermission(req, &quot;read:staff&quot;);
    if (!hasPermission) {
      return NextResponse.json(
        { error: &quot;You do not have permission to view kits&quot; },
        { status: 403 },
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const brandRegionId = (searchParams.get(&quot;brandRegionId&quot;) || undefined);
    const kitStatus = (searchParams.get(&quot;status&quot;) || undefined);
    const approvalStatus = (searchParams.get(&quot;approvalStatus&quot;) || undefined);

    // Build the query - use kits (alias for kitInstances)
    let query = db.select().from(kits);

    // Apply filters if provided
    if (kitStatus) {
      query = query.where(eq(kits.status, kitStatus));
    }

    // For client users, only show available kits
    if (
      user &&
      (user.role === USER_ROLES.CLIENT_USER ||
        user.role === USER_ROLES.CLIENT_MANAGER)
    ) {
      query = query.where(eq(kits.status, &quot;available&quot;));
    }

    // Execute the query
    const allKits = await query;

    return NextResponse.json(allKits);
  } catch (error) {
    console.error(&quot;Error fetching kits:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch kits&quot; },
      { status: 500 },
    );
  }
}

// POST /api/kits
export async function POST(req: NextRequest) {
  try {
    // Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(req);

    // Check if user has permission to create kits
    const hasPermission = await checkPermission(req, &quot;create:staff&quot;);
    if (!hasPermission) {
      return NextResponse.json(
        { error: &quot;You do not have permission to create kits&quot; },
        { status: 403 },
      );
    }

    // Get current user information
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: &quot;User not authenticated&quot; },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = insertKitSchema.parse(body);

    // Determine the approval status based on user role
    // Internal Rishi staff can auto-approve, clients need approval
    const isRishiStaff = [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.INTERNAL_ADMIN,
      USER_ROLES.INTERNAL_FIELD_MANAGER,
    ].includes(user.role);

    const approvalStatus = isRishiStaff ? &quot;approved&quot; : &quot;pending&quot;;
    const approvalData = {
      ...validatedData,
      approvalStatus,
      requestedById: parseInt(user.id),
    };

    // If Rishi staff is creating the kit, they are also the approver
    if (isRishiStaff) {
      approvalData.approvedById = parseInt(user.id);
      approvalData.approvalDate = new Date();
    }

    // Insert the new kit
    const [newKit] = await db.insert(kits).values(approvalData).returning();

    return NextResponse.json(newKit, { status: 201 });
  } catch (error) {
    console.error(&quot;Error creating kit:&quot;, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: &quot;Validation error&quot;, details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: &quot;Failed to create kit&quot; },
      { status: 500 },
    );
  }
}

// PATCH /api/kits/:id/approve
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(req);

    // Check if user has permission to approve kits
    const hasPermission = await checkPermission(req, &quot;update:staff&quot;);
    if (!hasPermission) {
      return NextResponse.json(
        { error: &quot;You do not have permission to approve kits&quot; },
        { status: 403 },
      );
    }

    // Get current user information
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: &quot;User not authenticated&quot; },
        { status: 401 },
      );
    }

    // Check if the user is Rishi staff
    const isRishiStaff = [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.INTERNAL_ADMIN,
      USER_ROLES.INTERNAL_FIELD_MANAGER,
    ].includes(user.role);

    if (!isRishiStaff) {
      return NextResponse.json(
        { error: &quot;Only Rishi staff can approve kits&quot; },
        { status: 403 },
      );
    }

    // Parse request path to get kit ID
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: &quot;Invalid kit ID&quot; }, { status: 400 });
    }

    // Parse and validate request body
    const body = await req.json();
    const updateSchema = z.object({
      approvalStatus: z.enum([&quot;approved&quot;, &quot;rejected&quot;]),
      approvalNotes: z.string().optional(),
    });

    const { approvalStatus, approvalNotes } = updateSchema.parse(body);

    // Update the kit&apos;s approval status
    const [updatedKit] = await db
      .update(kits)
      .set({
        approvalStatus,
        approvalNotes: approvalNotes || null,
        approvedById: parseInt(user.id),
        approvalDate: new Date(),
        updated_at: new Date(),
      })
      .where(eq(kits.id, id))
      .returning();

    if (!updatedKit) {
      return NextResponse.json({ error: &quot;Kit not found&quot; }, { status: 404 });
    }

    return NextResponse.json(updatedKit);
  } catch (error) {
    console.error(&quot;Error approving kit:&quot;, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: &quot;Validation error&quot;, details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: &quot;Failed to approve kit&quot; },
      { status: 500 },
    );
  }
}
