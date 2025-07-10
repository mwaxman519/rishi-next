import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../lib/db";
import { kits, insertKitSchema, USER_ROLES } from "../../lib/schema";
import { and, eq } from "drizzle-orm";
import { getOrganizationHeaderData } from "../../lib/organization-context";
import { getCurrentUser } from "../../lib/auth";
import { checkPermission } from "../../lib/rbac";

// GET /api/kits
export async function GET(req: NextRequest) {
  try {
    // Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(req);

    // Check if user has permission to view kits
    const hasPermission = await checkPermission(req, "view:kits");
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to view kits" },
        { status: 403 },
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const brandRegionId = searchParams.get("brandRegionId");
    const kitStatus = searchParams.get("status");
    const approvalStatus = searchParams.get("approvalStatus");

    // Get current user information
    const user = await getCurrentUser();

    // Build the query
    let query = db.select().from(kits);

    // Apply filters if provided
    if (brandRegionId) {
      query = query.where(eq(kits.brandRegionId, parseInt(brandRegionId)));
    }

    if (kitStatus) {
      query = query.where(eq(kits.status, kitStatus));
    }

    if (approvalStatus) {
      query = query.where(eq(kits.approvalStatus, approvalStatus));
    }

    // For client users, only show approved kits or ones they requested
    if (
      user &&
      (user.role === USER_ROLES.CLIENT_USER ||
        user.role === USER_ROLES.CLIENT_MANAGER)
    ) {
      query = query.where(
        and(eq(kits.approvalStatus, "approved"), eq(kits.status, "active")),
      );
    }

    // Execute the query
    const allKits = await query;

    return NextResponse.json(allKits);
  } catch (error) {
    console.error("Error fetching kits:", error);
    return NextResponse.json(
      { error: "Failed to fetch kits" },
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
    const hasPermission = await checkPermission(req, "create:kits");
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to create kits" },
        { status: 403 },
      );
    }

    // Get current user information
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
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

    const approvalStatus = isRishiStaff ? "approved" : "pending";
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
    console.error("Error creating kit:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create kit" },
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
    const hasPermission = await checkPermission(req, "approve:kits");
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to approve kits" },
        { status: 403 },
      );
    }

    // Get current user information
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
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
        { error: "Only Rishi staff can approve kits" },
        { status: 403 },
      );
    }

    // Parse request path to get kit ID
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid kit ID" }, { status: 400 });
    }

    // Parse and validate request body
    const body = await req.json();
    const updateSchema = z.object({
      approvalStatus: z.enum(["approved", "rejected"]),
      approvalNotes: z.string().optional(),
    });

    const { approvalStatus, approvalNotes } = updateSchema.parse(body);

    // Update the kit's approval status
    const [updatedKit] = await db
      .update(kits)
      .set({
        approvalStatus,
        approvalNotes: approvalNotes || null,
        approvedById: parseInt(user.id),
        approvalDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(kits.id, id))
      .returning();

    if (!updatedKit) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }

    return NextResponse.json(updatedKit);
  } catch (error) {
    console.error("Error approving kit:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to approve kit" },
      { status: 500 },
    );
  }
}
