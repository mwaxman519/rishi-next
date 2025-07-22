/**
 * Registration API Endpoint
 * Handles user registration with proper validation and error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db-connection";
import { users } from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { getEnvironment } from "@/lib/db-connection";
import { eq } from "drizzle-orm";

// Convert scrypt to a promise-based function
const scryptAsync = promisify(scrypt);

// Function to hash passwords securely
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Registration handler
export async function POST(request: NextRequest) {
  try {
    console.log("Processing registration request...");

    // Parse the request body
    const body = await request.json();
    const {
      username,
      email,
      password,
      fullName,
      role,
      organizationOption,
    } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    // Check if username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Use fullName from request body or default to username

    // Create the user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        role: role || "user",
        fullName: fullName || username,
        email: email || username, // Use email if provided, otherwise use username
      })
      .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
      });

    console.log(`User created successfully: ${newUser.username}`);

    // Return success response with user data (excluding password)
    return NextResponse.json(
      {
        success: true,
        user: newUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in registration process:", error);

    // Log detailed error information for debugging
    const env = getEnvironment();
    console.error(`Registration error in ${env} environment:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return appropriate error response
    return NextResponse.json(
      {
        error: "Failed to register user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
