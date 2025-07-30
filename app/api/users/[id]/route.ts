import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { ZodError } from &quot;zod&quot;;
import * as userService from &quot;../../../services/users/userService&quot;;
import { getUserFromRequest } from &quot;@/lib/auth-server&quot;;
import { hasPermission } from &quot;@/lib/rbac&quot;;
import { formatZodError } from &quot;@/lib/utils&quot;;

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
    console.error(&quot;Error in GET /api/users/:id:&quot;, error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: &quot;Validation error&quot;,
          details: formatZodError(error),
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: &quot;Failed to get user&quot; }, { status: 500 });
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
    if (!requestingUser || !hasPermission('update:users', requestingUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    */

    // Parse request body
    const body = await request.json();
    console.log(&quot;Request body:&quot;, body);

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
    console.error(&quot;Error in PUT /api/users/:id:&quot;, error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: &quot;Validation error&quot;,
          details: formatZodError(error),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: &quot;Failed to update user&quot; },
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

    return NextResponse.json({ message: &quot;User deleted successfully&quot; });
  } catch (error) {
    console.error(&quot;Error in DELETE /api/users/:id:&quot;, error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: &quot;Validation error&quot;,
          details: formatZodError(error),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: &quot;Failed to delete user&quot; },
      { status: 500 },
    );
  }
}
