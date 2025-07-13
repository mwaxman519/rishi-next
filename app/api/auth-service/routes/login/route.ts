/**
 * Login API for Auth Microservice
 *
 * Handles user authentication.
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { createToken } from "../../utils/jwt";
import { comparePasswords } from "../../utils/password";
import {
  errorResponse,
  responseWithAuthCookie,
  successResponse,
} from "../../utils/response";
import {
  getUserByUsername,
  getUserOrganizations,
} from "../../models/user-repository";
import { AUTH_CONFIG } from "../../config";

// Login request schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Handle POST /api/auth-service/routes/login
 * Authenticate a user
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Auth Service] Login attempt");

    // Development mode bypass
    if (AUTH_CONFIG.DEV_MODE) {
      const urlParams = new URL(request.url).searchParams;
      if (urlParams.get("dev_mode") === "true") {
        console.log(
          "[Auth Service] DEVELOPMENT MODE: Simulating successful login",
        );

        // Create a token for the mock user
        const token = await createToken("00000000-0000-0000-0000-000000000001");

        return responseWithAuthCookie(
          {
            user: {
              id: "00000000-0000-0000-0000-000000000001",
              username: "admin",
              email: "admin@example.com",
              fullName: "Admin User",
              role: "super_admin",
              roles: ["SUPER_ADMIN"],
              organizations: [
                {
                  orgId: "00000000-0000-0000-0000-000000000001",
                  orgName: "Rishi Internal",
                  orgType: "internal",
                  role: "super_admin",
                  isDefault: true,
                },
              ],
              currentOrganization: {
                orgId: "00000000-0000-0000-0000-000000000001",
                orgName: "Rishi Internal",
                orgType: "internal",
                role: "super_admin",
                isDefault: true,
              },
            },
          },
          token,
        );
      }
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("[Auth Service] JSON parse error:", parseError);
      return errorResponse("Invalid request format", 400, "VALIDATION_ERROR");
    }

    // Validate login data
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(
        "Invalid login data",
        400,
        "VALIDATION_ERROR",
        result.error.issues,
      );
    }

    // Get validated data
    const { username, password } = result.data;

    // Find user in database
    const user = await getUserByUsername(username);

    if (!user) {
      return errorResponse("Invalid username or password", 401, "AUTH_ERROR");
    }

    // Verify password using bcrypt
    let validPassword = false;

    try {
      // Cast user to expected type with password
      const userWithPassword = user as { password: string };
      
      // Use bcrypt to compare password
      validPassword = await comparePasswords(password, userWithPassword.password);
      
      console.log(`[Auth Service] Password check for ${username}: ${validPassword ? 'VALID' : 'INVALID'}`);
    } catch (passwordError) {
      console.error(
        `[Auth Service] Password verification error for ${username}:`,
        passwordError,
      );
      return errorResponse("Authentication error", 401, "AUTH_ERROR");
    }

    if (!validPassword) {
      return errorResponse("Invalid username or password", 401, "AUTH_ERROR");
    }

    // Check if user is active
    if (!user.active) {
      return errorResponse("Account is disabled", 403, "ACCOUNT_DISABLED");
    }

    // Get user organizations
    let userOrgs = await getUserOrganizations(user.id);

    // If no organizations found, create fallback for stability (especially for test accounts)
    if (!userOrgs || userOrgs.length === 0) {
      console.log(
        `[Auth Service] No organizations found for user ${username}, creating fallback organization data`,
      );

      // Create a default organization based on the user's role
      if (user.role === "super_admin" || user.role === "admin") {
        userOrgs = [
          {
            orgId: "ec83b1b1-af6e-4465-806e-8d51a1449e86",
            orgName: "Rishi Internal",
            orgType: "internal",
            role: user.role,
            isPrimary: true,
          },
        ];
      } else {
        userOrgs = [
          {
            orgId: "00000000-0000-0000-0000-000000000002",
            orgName: "Default Organization",
            orgType: "client",
            role: user.role || "brand_agent",
            isPrimary: true,
          },
        ];
      }
    }

    // Create token
    const token = await createToken(user.id);

    // Find default organization (primary organization)
    const defaultOrg = userOrgs.find((org: any) => org.isPrimary) || userOrgs[0];

    // Return user data with token cookie
    // Use a type-safe way to remove password from user object
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email || null,
      fullName: user.fullName || user.name || null,
      role: user.role || "brand_agent",
      active: Boolean(user.active !== false),
    };

    console.log(`[Auth Service] Login successful for ${username}:`);
    console.log(`  User role: ${user.role}`);
    console.log(`  Organizations: ${JSON.stringify(userOrgs)}`);
    console.log(`  Default org: ${JSON.stringify(defaultOrg)}`);

    return responseWithAuthCookie(
      {
        user: {
          ...userWithoutPassword,
          fullName: user.fullName || user.name || username,
          organizations: userOrgs,
          currentOrganization: defaultOrg,
        },
      },
      token,
    );
  } catch (error) {
    console.error("[Auth Service] Login error:", error);

    return errorResponse(
      "Authentication failed",
      500,
      "SERVER_ERROR",
      process.env.NODE_ENV === "development" ? String(error) : undefined,
    );
  }
}
