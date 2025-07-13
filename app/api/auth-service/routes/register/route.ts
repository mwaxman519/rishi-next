/**
 * Register API for Auth Microservice
 *
 * Handles user registration.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createToken } from "../../utils/jwt";
import { hashPassword, validatePasswordStrength } from "../../utils/password";
import {
  errorResponse,
  responseWithAuthCookie,
  successResponse,
} from "../../utils/response";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  setupUserOrganization,
  getUserOrganizations,
} from "../../models/user-repository";
import { AUTH_CONFIG } from "../../config";
import { v4 as uuidv4 } from "uuid";

// Registration request schema
const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address").optional().nullable(),
    password: z
      .string()
      .min(
        AUTH_CONFIG.MIN_PASSWORD_LENGTH,
        `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters`,
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    registrationPasscode: z
      .string()
      .min(1, "Registration passcode is required"),
    fullName: z.string().optional().nullable(),
    // Support fullName fields for form compatibility
    fullName: z.string().optional().nullable(),
    
    role: z.string().optional().default("user"),
    // Organization options (only for internal use)
    organizationId: z.string().optional(),
    // Admin-only fields
    adminToken: z.string().optional(),
    organizationName: z.string().optional(),
    organizationType: z.string().optional(),
    createOrganization: z.boolean().optional().default(false),
    isInternalRequest: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Handle POST /api/auth-service/routes/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Auth Service] Registration attempt");

    // Only use mock data in development environment, not in staging or production
    if (process.env.NODE_ENV === "development") {
      try {
        // Clone the request to avoid "Already consumed" errors when body is read multiple times
        const clonedRequest = request.clone();

        // Parse the request body from the cloned request
        const requestBody = await clonedRequest.json();

        // In DEVELOPMENT environment ONLY, handle test accounts with simulated response
        if (requestBody.username) {
          console.log(
            `[Auth Service] DEVELOPMENT MODE: Using mock registration for test account: ${requestBody.username}`,
          );

          // Verify registration passcode
          if (
            requestBody.registrationPasscode !==
            AUTH_CONFIG.REGISTRATION_PASSCODE
          ) {
            console.log(
              `[Auth Service] Invalid registration passcode: ${requestBody.registrationPasscode}`,
            );
            return errorResponse(
              "Invalid registration passcode",
              400,
              "INVALID_PASSCODE",
            );
          }

          // Create a simulated user with the provided details
          const simulatedUser = {
            id: uuidv4(),
            username: requestBody.username,
            email: requestBody.email || `${requestBody.username}@example.com`,
            fullName:
              requestBody.fullName ||
              (
                (requestBody.fullName || requestBody.firstName || "") +
                " " +
                (requestBody.lastName || "")
              ).trim() ||
              requestBody.username,
            role: requestBody.role || "brand_agent",
            active: true,
            createdAt: new Date().toISOString(),
          };

          // Create auth token asynchronously
          const authToken = await createToken(simulatedUser.id);

          // Return a simulated success response with auth cookie
          return responseWithAuthCookie(
            {
              success: true,
              message: "User registered successfully (DEVELOPMENT MODE)",
              user: simulatedUser,
              service: "auth-service",
              version: "1.0.0",
            },
            authToken,
            201,
          );
        }
      } catch (parseError) {
        console.log(
          "[Auth Service] Unable to use mock registration flow:",
          parseError,
        );
        // Continue with normal flow if parsing fails
      }
    }

    // For staging and production environments, verify database connection with environment detection
    if (process.env.NODE_ENV !== "development") {
      try {
        // Import database module with its environment detection
        const { db, testConnection, getEnvironment } = await import("../../db");

        // Get the environment using the exported function
        const environment = getEnvironment();

        // Check for Replit environment
        const isReplit = process.env.REPL_ID !== undefined;

        console.log(
          `[Auth Service] Running in ${environment} environment (isReplit=${isReplit})`,
        );

        // For Replit staging environment, we need additional validation
        if (isReplit && environment === "staging") {
          console.log(
            "[Auth Service] Replit staging environment detected, testing database connection",
          );

          // Run connection test to verify database is accessible
          const connectionStatus = await testConnection();

          if (!connectionStatus.connected) {
            console.error(
              "[Auth Service] Database connection test failed in Replit staging environment:",
              connectionStatus.error,
            );

            // Provide detailed error message for staging database issues
            return errorResponse(
              "Unable to connect to the staging database. This is likely a configuration issue.",
              500,
              "STAGING_DATABASE_CONNECTION_ERROR",
              connectionStatus,
            );
          }

          console.log(
            "[Auth Service] Database connection verified in Replit staging environment",
          );
        } else {
          console.log(
            `[Auth Service] Database connection verified in ${environment} environment`,
          );
        }
      } catch (dbError) {
        console.error("[Auth Service] Database connection error:", dbError);
        return errorResponse(
          "Database connection error during registration. Please try again later.",
          500,
          "DATABASE_CONNECTION_ERROR",
        );
      }
    }

    // Block self-registration unless explicitly allowed
    if (!AUTH_CONFIG.ALLOW_SELF_REGISTRATION) {
      const headers = request.headers;
      const internalAuthToken = headers.get("x-internal-auth-token");

      // Check if this is a non-internal request
      if (
        !internalAuthToken ||
        internalAuthToken !== AUTH_CONFIG.INTERNAL_AUTH_TOKEN
      ) {
        return errorResponse(
          "Self-registration is disabled. Please contact your organization administrator.",
          403,
          "REGISTRATION_DISABLED",
        );
      }
    }

    // Development mode bypass
    if (AUTH_CONFIG.DEV_MODE) {
      const urlParams = new URL(request.url).searchParams;
      if (urlParams.get("dev_mode") === "true") {
        console.log(
          "[Auth Service] DEVELOPMENT MODE: Simulating successful registration",
        );

        // Create a token for the mock user
        const token = await createToken("00000000-0000-0000-0000-000000010001");

        return responseWithAuthCookie(
          {
            user: {
              id: "00000000-0000-0000-0000-000000010001",
              username: "new_user",
              email: "new_user@example.com",
              fullName: "New User",
              role: "user",
              roles: ["USER"],
              createdAt: new Date().toISOString(),
              organizations: [
                {
                  orgId: "00000000-0000-0000-0000-000000000001",
                  orgName: "Rishi Internal",
                  orgType: "internal",
                  role: "user",
                  isPrimary: true,
                },
              ],
              currentOrganization: {
                orgId: "00000000-0000-0000-0000-000000000001",
                orgName: "Rishi Internal",
                orgType: "internal",
                role: "user",
                isPrimary: true,
              },
            },
          },
          token,
        );
      }
    }

    // Parse request body
    const body = await request.json();

    // Validate registration data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(
        "Invalid registration data",
        400,
        "VALIDATION_ERROR",
        result.error.issues,
      );
    }

    // Get validated data
    const {
      username,
      email,
      password,
      confirmPassword,
      registrationPasscode,
      fullName,
      firstName,
      lastName,
      role,
      organizationId,
      organizationName,
      organizationType,
      createOrganization,
      adminToken,
      isInternalRequest,
    } = result.data;

    // Combine fullName into fullName if provided
    const computedFullName =
      fullName ||
      (fullName
        ? `${fullName}`
        : firstName
          ? firstName
          : lastName
            ? lastName
            : username);

    // Password match is already validated by the schema's refine method

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return errorResponse(
        passwordValidation.message || "Password is not strong enough",
        400,
        "VALIDATION_ERROR",
      );
    }

    // Check if username already exists
    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
      return errorResponse("Username already taken", 409, "USERNAME_CONFLICT");
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingUserByEmail = await getUserByEmail(email);
      if (existingUserByEmail) {
        return errorResponse("Email already registered", 409, "EMAIL_CONFLICT");
      }
    }

    // Organization creation is only allowed for internal management users
    const isInternalManagementRequest =
      isInternalRequest === true ||
      (adminToken && adminToken === AUTH_CONFIG.ADMIN_AUTH_TOKEN);

    // Only allow organization creation if permitted or for internal management users
    if (
      createOrganization &&
      !AUTH_CONFIG.ALLOW_ORG_CREATION &&
      !isInternalManagementRequest
    ) {
      return errorResponse(
        "Organization creation is restricted to internal management users",
        403,
        "PERMISSION_DENIED",
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate unique ID for the user
    const userId = uuidv4();

    // Create new user
    const { user: newUser, error: userCreateError } = await createUser({
      id: userId,
      username,
      password: hashedPassword,
      email,
      fullName: computedFullName,
      role,
      active: true,
      created_at: new Date(),
    });

    if (!newUser) {
      console.error(`[Auth Service] Failed to create user: ${userCreateError}`);
      return errorResponse(
        userCreateError || "Failed to create user",
        500,
        "DATABASE_ERROR",
      );
    }

    // Setup user organization
    let userOrg = null;
    let setupOrgResult = null;

    // Handle super_admin assignment specifically - they are always primarily assigned to Rishi Internal
    if (role === "super_admin") {
      console.log(
        `[Auth Service] Setting up organization for super_admin user ${username}`,
      );
      setupOrgResult = await setupUserOrganization(userId, {
        // Pass the role as super_admin which will trigger special handling
        role: "super_admin",
        // If a specific organization was requested, it will be added as secondary
        ...(organizationId ? { orgId: organizationId } : {}),
      });
    }
    // Handle normal organization assignment for non-super_admin users
    else if (
      isInternalManagementRequest &&
      createOrganization &&
      organizationName
    ) {
      // Create new organization and assign user (only for internal management users)
      console.log(
        `[Auth Service] Creating new organization "${organizationName}" for user ${username}`,
      );
      setupOrgResult = await setupUserOrganization(userId, {
        createNewOrg: true,
        orgName: organizationName,
        orgType: organizationType || "client",
        role: "admin",
      });
    } else if (organizationId) {
      // Assign user to existing organization
      console.log(
        `[Auth Service] Assigning user ${username} to organization ${organizationId}`,
      );
      setupOrgResult = await setupUserOrganization(userId, {
        orgId: organizationId,
        role,
      });
    } else {
      // Assign user to default organization
      console.log(
        `[Auth Service] Assigning user ${username} to default organization`,
      );
      setupOrgResult = await setupUserOrganization(userId, {
        useDefaultOrg: true,
        role,
      });
    }

    if (!setupOrgResult.userOrg) {
      const errorMessage =
        setupOrgResult.error || "Unknown error during organization assignment";
      console.warn(
        `[Auth Service] Failed to assign user ${username} to an organization: ${errorMessage}`,
      );
      // We'll continue the registration process even if org assignment fails,
      // but log the error for troubleshooting
    } else {
      userOrg = setupOrgResult.userOrg;
    }

    // Get user organizations
    const userOrgs = await getUserOrganizations(userId);

    // Find primary organization or use the first one
    const defaultOrg = userOrgs.find((org: any) => org.isPrimary) || userOrgs[0];

    // Create token
    const token = await createToken(newUser.id);

    // Return user data with token cookie
    const { password: _, ...userWithoutPassword } = newUser;

    return responseWithAuthCookie(
      {
        user: {
          ...userWithoutPassword,
          fullName: userWithoutPassword.fullName || username,
          organizations: userOrgs,
          currentOrganization: defaultOrg,
        },
      },
      token,
    );
  } catch (error) {
    console.error("[Auth Service] Registration error:", error);

    // Enhanced error analysis to provide better feedback
    let errorMessage =
      "Registration failed. Please check your information and try again.";
    let errorCode = "SERVER_ERROR";
    let statusCode = 500;
    let errorDetails: any = undefined;

    // Get environment context for better error diagnostics
    const isReplit = process.env.REPL_ID !== undefined;
    const env = process.env.NODE_ENV || "development";
    const envContext = {
      environment: env,
      isReplit,
      repl_id: isReplit ? process.env.REPL_ID : undefined,
    };

    // Extract error information for better diagnostics
    if (error instanceof Error) {
      const errMsg = error.message;

      // Database connection error
      if (
        errMsg.includes("connection") ||
        errMsg.includes("connect") ||
        errMsg.includes("timeout") ||
        errMsg.includes("unable to connect")
      ) {
        errorMessage =
          "Unable to connect to the database. Please try again later.";
        errorCode = "DATABASE_CONNECTION_ERROR";
        // Include environment for diagnostics
        errorDetails = { ...envContext };
      }
      // Authentication error with database - specific handling for Replit staging
      else if (errMsg.includes("password authentication failed")) {
        // Special handling for Replit environments
        if (isReplit && env === "production") {
          errorMessage =
            "Database authentication error in Replit environment. This might be a configuration issue with the staging database.";
          errorCode = "REPLIT_DATABASE_AUTH_ERROR";
          // Include environment context for diagnostics
          errorDetails = { ...envContext };
        } else {
          errorMessage =
            "Database authentication error. Please contact support.";
          errorCode = "DATABASE_AUTH_ERROR";
        }
      }
      // Replit neondb_owner errors
      else if (errMsg.includes("neondb_owner")) {
        errorMessage =
          "Replit database configuration error. Please verify database environment variables are correctly set.";
        errorCode = "REPLIT_DATABASE_CONFIG_ERROR";
        // Include environment context for diagnostics
        errorDetails = { ...envContext };
      }
      // Constraint violation
      else if (
        errMsg.includes("duplicate key") ||
        errMsg.includes("unique constraint")
      ) {
        if (errMsg.includes("username")) {
          errorMessage =
            "Username already exists. Please choose a different username.";
          errorCode = "USERNAME_CONFLICT";
          statusCode = 409;
        } else if (errMsg.includes("email")) {
          errorMessage =
            "Email already registered. Please use a different email.";
          errorCode = "EMAIL_CONFLICT";
          statusCode = 409;
        } else {
          errorMessage =
            "Registration failed due to a conflict. Please try different information.";
          errorCode = "DATA_CONFLICT";
          statusCode = 409;
        }
      }

      // Provide more detailed error information in development environment
      if (process.env.NODE_ENV === "development") {
        errorDetails = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
      }
    } else {
      // For non-Error objects, convert to string for logging
      const errorString = String(error);
      if (process.env.NODE_ENV === "development") {
        errorDetails = errorString;
      }
    }

    return errorResponse(errorMessage, statusCode, errorCode, errorDetails);
  }
}
