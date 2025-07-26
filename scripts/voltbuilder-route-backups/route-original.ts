import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { EventBusService } from "../../../services/event-bus-service";
import { authOptions } from "@/lib/auth-options";
import * as userService from "../../services/users/userService";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

/**
 * GET /api/users - Get all users
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
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = insertUserSchema.parse(body);

    const createUserRequest = {
      username: validatedData.username,
      password: validatedData.password,
      fullName: validatedData.fullName || null,
      email: validatedData.email || null,
      role: validatedData.role || "brand_agent",
    };

    const result = await userService.createUser(createUserRequest);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create user" },
        { status: 500 },
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}