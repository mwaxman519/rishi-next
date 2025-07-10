import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { EventBusService } from "../../../services/event-bus-service";
import { authOptions } from "@/lib/auth-options";
import * as userService from "../../services/users/userService";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

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
      { error: result.error || "Failed to fetch users" },
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
    console.log("POST /api/users - Started processing request");

    const body = await request.json();
    console.log("Request body:", body);

    try {
      // Validate the request body against our schema
      console.log("Validating request data with Zod schema");
      const validatedData = insertUserSchema.parse(body);
      console.log("Validation successful:", validatedData);

      // Map the validated data to our service model
      const createUserRequest = {
        username: validatedData.username,
        password: validatedData.password,
        fullName: validatedData.full_name || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        role: validatedData.role,
        profileImage: validatedData.profile_image || null,
      };
      console.log("Mapped to service model:", {
        ...createUserRequest,
        password: "[REDACTED]",
      });

      // Call the service to create the user
      console.log("Calling userService.createUser");
      const result = await userService.createUser(createUserRequest);
      console.log("Service result:", {
        success: result.success,
        error: result.error,
        data: result.data ? "User data returned" : null,
      });

      if (!result.success) {
        const status = result.error === "Username already exists" ? 409 : 500;
        console.log(
          `Returning error response with status ${status}:`,
          result.error,
        );
        return NextResponse.json({ error: result.error }, { status });
      }

      console.log("User created successfully, returning 201 Created");
      return NextResponse.json(result.data, { status: 201 });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error("Zod validation error:", validationError.format());
        return NextResponse.json(
          { error: "Validation error", details: validationError.format() },
          { status: 400 },
        );
      }
      throw validationError; // Re-throw if it's not a ZodError
    }
  } catch (error) {
    console.error("Failed to create user:", error);

    // Provide more detailed error message for debugging
    const errorMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}${error.stack ? "\n" + error.stack : ""}`
        : "Unknown error";

    console.error("Detailed error:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to create user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
