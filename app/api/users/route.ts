import { NextResponse, NextRequest } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getServerSession } from &quot;next-auth&quot;;
import { EventBusService } from &quot;../../../services/event-bus-service&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import * as userService from &quot;../../services/users/userService&quot;;
import { insertUserSchema } from &quot;@shared/schema&quot;;
import { z } from &quot;zod&quot;;

/**
 * GET /api/users - Get all users
 *
 * This endpoint functions as part of the API Gateway pattern,
 * delegating the business logic to the User Service.
 */
export async function GET(): Promise<NextResponse> {
  const result = await userService.getAllUsers();

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || &quot;Failed to fetch users&quot; },
      { status: 500 },
    );
  }

  return NextResponse.json(result.data);
}

/**
 * POST /api/users - Create a new user
 *
 * This endpoint functions as part of the API Gateway pattern,
 * delegating the business logic to the User Service.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log(&quot;POST /api/users - Started processing request&quot;);

    const body = await request.json();
    console.log(&quot;Request body:&quot;, body);

    try {
      // Validate the request body against our schema
      console.log(&quot;Validating request data with Zod schema&quot;);
      const validatedData = insertUserSchema.parse(body);
      console.log(&quot;Validation successful:&quot;, validatedData);

      // Map the validated data to our service model
      const createUserRequest = {
        username: validatedData.username,
        password: validatedData.password,
        fullName: validatedData.fullName || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        role: validatedData.role,
        profileImage: validatedData.profileImage || null,
      };
      console.log(&quot;Mapped to service model:&quot;, {
        ...createUserRequest,
        password: &quot;[REDACTED]&quot;,
      });

      // Call the service to create the user
      console.log(&quot;Calling userService.createUser&quot;);
      const result = await userService.createUser(createUserRequest);
      console.log(&quot;Service result:&quot;, {
        success: result.success,
        error: result.error,
        data: result.data ? &quot;User data returned&quot; : null,
      });

      if (!result.success) {
        const status = (result.error === &quot;Username already exists&quot; || result.error === &quot;Email already exists&quot;) ? 409 : 500;
        console.log(
          `Returning error response with status ${status}:`,
          result.error,
        );
        return NextResponse.json({ error: result.error }, { status });
      }

      console.log(&quot;User created successfully, returning 201 Created&quot;);
      return NextResponse.json(result.data, { status: 201 });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error(&quot;Zod validation error:&quot;, validationError.format());
        return NextResponse.json(
          { error: &quot;Validation error&quot;, details: validationError.format() },
          { status: 400 },
        );
      }
      throw validationError; // Re-throw if it&apos;s not a ZodError
    }
  } catch (error) {
    console.error(&quot;Failed to create user:&quot;, error);

    // Provide more detailed error message for debugging
    const errorMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}${error.stack ? &quot;\n&quot; + error.stack : "&quot;}`
        : &quot;Unknown error&quot;;

    console.error(&quot;Detailed error:&quot;, errorMessage);

    return NextResponse.json(
      {
        error: &quot;Failed to create user&quot;,
        message: error instanceof Error ? error.message : &quot;Unknown error",
      },
      { status: 500 },
    );
  }
}
