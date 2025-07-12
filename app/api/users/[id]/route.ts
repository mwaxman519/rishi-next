import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import * as userService from "../../../services/users/userService";
import { getUserFromRequest } from "@/lib/auth-server";
import { hasPermission } from "@/lib/rbac";
import { formatZodError } from "@/lib/utils";

// GET /api/users/:id - Get a specific user
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Correctly access dynamic params in Next.js 15
    const params = await context.params;
    const id = params.id;
    console.log(`GET /api/users/${id} - Getting user details`);

    // Allow unauthenticated access for now during development
    /*
    // Get the requesting user
    const requestingUser = await getUserFromRequest(request);
    
    // Verify the user has permission to read users
    if (!requestingUser || !hasPermission('read:users', requestingUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    */

    // Get the user by ID
    const result = await userService.getUserById(id);

    if (!result.success) {
      console.error(`Error getting user: ${result.error}`);
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/users/:id:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: formatZodError(error),
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}

// PUT /api/users/:id - Update a user
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Correctly access dynamic params in Next.js 15
    const params = await context.params;
    const id = params.id;
    console.log(`PUT /api/users/${id} - Updating user`);

    // Allow unauthenticated access for now during development
    /*
    // Get the requesting user
    const requestingUser = await getUserFromRequest(request);
    
    // Verify the user has permission to update users
    if (!requestingUser || !hasPermission('edit:users', requestingUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    */

    // Parse request body
    const body = await request.json();
    console.log("Request body:", body);

    // Update the user
    const result = await userService.updateUser(id, {
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      role: body.role,
      profileImage: body.profileImage,
      active: body.active,
    });

    if (!result.success) {
      console.error(`Error updating user: ${result.error}`);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in PUT /api/users/:id:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: formatZodError(error),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE /api/users/:id - Delete a user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Correctly access dynamic params in Next.js 15
    const params = await context.params;
    const id = params.id;
    console.log(`DELETE /api/users/${id} - Deleting user`);

    // Allow unauthenticated access for now during development
    /*
    // Get the requesting user
    const requestingUser = await getUserFromRequest(request);
    
    // Verify the user has permission to delete users
    if (!requestingUser || !hasPermission('delete:users', requestingUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    */

    // Delete the user
    const result = await userService.deleteUser(id);

    if (!result.success) {
      console.error(`Error deleting user: ${result.error}`);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/users/:id:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: formatZodError(error),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
