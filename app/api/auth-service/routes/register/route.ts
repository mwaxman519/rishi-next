/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Register API for Auth Microservice
 *
 * Handles user registration.
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { z } from &quot;zod&quot;;
import { createToken } from &quot;../../utils/jwt&quot;;
import { hashPassword, validatePasswordStrength } from &quot;../../utils/password&quot;;
import {
  errorResponse,
  responseWithAuthCookie,
  successResponse,
} from &quot;../../utils/response&quot;;
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  setupUserOrganization,
  getUserOrganizations,
} from &quot;../../models/user-repository&quot;;
import { AUTH_CONFIG } from &quot;../../config&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;

// Registration request schema
const registerSchema = z
  .object({
    username: z.string().min(1, &quot;Username is required&quot;),
    email: z.string().email(&quot;Invalid email address&quot;).optional().nullable(),
    password: z
      .string()
      .min(
        AUTH_CONFIG.MIN_PASSWORD_LENGTH,
        `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters`,
      ),
    confirmPassword: z.string().min(1, &quot;Confirm password is required&quot;),
    registrationPasscode: z
      .string()
      .min(1, &quot;Registration passcode is required&quot;),
    fullName: z.string().optional().nullable(),
    
    role: z.string().optional().default(&quot;user&quot;),
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
    message: &quot;Passwords don&apos;t match&quot;,
    path: [&quot;confirmPassword&quot;],
  });

/**
 * Handle POST /api/auth-service/routes/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    console.log(&quot;[Auth Service] Registration attempt&quot;);

    // Process user registration with database connection
    if (process.env.NODE_ENV !== &quot;development&quot;) {
      try {
        // Import database module with its environment detection
        const { db, testConnection, getEnvironment } = await import(&quot;../../db&quot;);

        // Get the environment using the exported function
        const environment = getEnvironment();

        // Check for Replit environment
        const isReplit = process.env.REPL_ID !== undefined;

        console.log(
          `[Auth Service] Running in ${environment} environment (isReplit=${isReplit})`,
        );

        // For Replit staging environment, we need additional validation
        if (isReplit && environment === &quot;staging&quot;) {
          console.log(
            &quot;[Auth Service] Replit staging environment detected, testing database connection&quot;,
          );

          // Run connection test to verify database is accessible
          const connectionStatus = await testConnection();

          if (!connectionStatus.connected) {
            console.error(
              &quot;[Auth Service] Database connection test failed in Replit staging environment:&quot;,
              connectionStatus.error,
            );

            // Provide detailed error message for staging database issues
            return errorResponse(
              &quot;Unable to connect to the staging database. This is likely a configuration issue.&quot;,
              500,
              &quot;STAGING_DATABASE_CONNECTION_ERROR&quot;,
              connectionStatus,
            );
          }

          console.log(
            &quot;[Auth Service] Database connection verified in Replit staging environment&quot;,
          );
        } else {
          console.log(
            `[Auth Service] Database connection verified in ${environment} environment`,
          );
        }
      } catch (dbError) {
        console.error(&quot;[Auth Service] Database connection error:&quot;, dbError);
        return errorResponse(
          &quot;Database connection error during registration. Please try again later.&quot;,
          500,
          &quot;DATABASE_CONNECTION_ERROR&quot;,
        );
      }
    }

    // Block self-registration unless explicitly allowed
    if (!AUTH_CONFIG.ALLOW_SELF_REGISTRATION) {
      const headers = request.headers;
      const internalAuthToken = headers.get(&quot;x-internal-auth-token&quot;);

      // Check if this is a non-internal request
      if (
        !internalAuthToken ||
        internalAuthToken !== AUTH_CONFIG.INTERNAL_AUTH_TOKEN
      ) {
        return errorResponse(
          &quot;Self-registration is disabled. Please contact your organization administrator.&quot;,
          403,
          &quot;REGISTRATION_DISABLED&quot;,
        );
      }
    }

    // Development mode bypass
    if (AUTH_CONFIG.DEV_MODE) {
      const urlParams = new URL(request.url).searchParams;
      if (urlParams.get(&quot;dev_mode&quot;) === &quot;true&quot;) {
        console.log(
          &quot;[Auth Service] DEVELOPMENT MODE: Simulating successful registration&quot;,
        );

        // Create a token for the mock user
        const token = await createToken(&quot;00000000-0000-0000-0000-000000010001&quot;);

        return responseWithAuthCookie(
          {
            user: {
              id: &quot;00000000-0000-0000-0000-000000010001&quot;,
              username: &quot;new_user&quot;,
              email: &quot;new_user@example.com&quot;,
              fullName: &quot;New User&quot;,
              role: &quot;user&quot;,
              roles: [&quot;USER&quot;],
              createdAt: new Date().toISOString(),
              organizations: [
                {
                  orgId: &quot;00000000-0000-0000-0000-000000000001&quot;,
                  orgName: &quot;Rishi Internal&quot;,
                  orgType: &quot;internal&quot;,
                  role: &quot;user&quot;,
                  isPrimary: true,
                },
              ],
              currentOrganization: {
                orgId: &quot;00000000-0000-0000-0000-000000000001&quot;,
                orgName: &quot;Rishi Internal&quot;,
                orgType: &quot;internal&quot;,
                role: &quot;user&quot;,
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
        &quot;Invalid registration data&quot;,
        400,
        &quot;VALIDATION_ERROR&quot;,
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
      role,
      organizationId,
      organizationName,
      organizationType,
      createOrganization,
      adminToken,
      isInternalRequest,
    } = result.data;

    // Use fullName or fallback to username
    const computedFullName = fullName || username;

    // Password match is already validated by the schema's refine method

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return errorResponse(
        passwordValidation.message || &quot;Password is not strong enough&quot;,
        400,
        &quot;VALIDATION_ERROR&quot;,
      );
    }

    // Check if username already exists
    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
      return errorResponse(&quot;Username already taken&quot;, 409, &quot;USERNAME_CONFLICT&quot;);
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingUserByEmail = await getUserByEmail(email);
      if (existingUserByEmail) {
        return errorResponse(&quot;Email already registered&quot;, 409, &quot;EMAIL_CONFLICT&quot;);
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
        &quot;Organization creation is restricted to internal management users&quot;,
        403,
        &quot;PERMISSION_DENIED&quot;,
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
        userCreateError || &quot;Failed to create user&quot;,
        500,
        &quot;DATABASE_ERROR&quot;,
      );
    }

    // Setup user organization
    let userOrg = null;
    let setupOrgResult = null;

    // Handle super_admin assignment specifically - they are always primarily assigned to Rishi Internal
    if (role === &quot;super_admin&quot;) {
      console.log(
        `[Auth Service] Setting up organization for super_admin user ${username}`,
      );
      setupOrgResult = await setupUserOrganization(userId, {
        // Pass the role as super_admin which will trigger special handling
        role: &quot;super_admin&quot;,
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
        `[Auth Service] Creating new organization &quot;${organizationName}&quot; for user ${username}`,
      );
      setupOrgResult = await setupUserOrganization(userId, {
        createNewOrg: true,
        orgName: organizationName,
        orgType: organizationType || &quot;client&quot;,
        role: &quot;admin&quot;,
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
        setupOrgResult.error || &quot;Unknown error during organization assignment&quot;;
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
    console.error(&quot;[Auth Service] Registration error:&quot;, error);

    // Enhanced error analysis to provide better feedback
    let errorMessage =
      &quot;Registration failed. Please check your information and try again.&quot;;
    let errorCode = &quot;SERVER_ERROR&quot;;
    let statusCode = 500;
    let errorDetails: any = undefined;

    // Get environment context for better error diagnostics
    const isReplit = process.env.REPL_ID !== undefined;
    const env = process.env.NODE_ENV || &quot;development&quot;;
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
        errMsg.includes(&quot;connection&quot;) ||
        errMsg.includes(&quot;connect&quot;) ||
        errMsg.includes(&quot;timeout&quot;) ||
        errMsg.includes(&quot;unable to connect&quot;)
      ) {
        errorMessage =
          &quot;Unable to connect to the database. Please try again later.&quot;;
        errorCode = &quot;DATABASE_CONNECTION_ERROR&quot;;
        // Include environment for diagnostics
        errorDetails = { ...envContext };
      }
      // Authentication error with database - specific handling for Replit staging
      else if (errMsg.includes(&quot;password authentication failed&quot;)) {
        // Special handling for Replit environments
        if (isReplit && env === &quot;production&quot;) {
          errorMessage =
            &quot;Database authentication error in Replit environment. This might be a configuration issue with the staging database.&quot;;
          errorCode = &quot;REPLIT_DATABASE_AUTH_ERROR&quot;;
          // Include environment context for diagnostics
          errorDetails = { ...envContext };
        } else {
          errorMessage =
            &quot;Database authentication error. Please contact support.&quot;;
          errorCode = &quot;DATABASE_AUTH_ERROR&quot;;
        }
      }
      // Replit neondb_owner errors
      else if (errMsg.includes(&quot;neondb_owner&quot;)) {
        errorMessage =
          &quot;Replit database configuration error. Please verify database environment variables are correctly set.&quot;;
        errorCode = &quot;REPLIT_DATABASE_CONFIG_ERROR&quot;;
        // Include environment context for diagnostics
        errorDetails = { ...envContext };
      }
      // Constraint violation
      else if (
        errMsg.includes(&quot;duplicate key&quot;) ||
        errMsg.includes(&quot;unique constraint&quot;)
      ) {
        if (errMsg.includes(&quot;username&quot;)) {
          errorMessage =
            &quot;Username already exists. Please choose a different username.&quot;;
          errorCode = &quot;USERNAME_CONFLICT&quot;;
          statusCode = 409;
        } else if (errMsg.includes(&quot;email&quot;)) {
          errorMessage =
            &quot;Email already registered. Please use a different email.&quot;;
          errorCode = &quot;EMAIL_CONFLICT&quot;;
          statusCode = 409;
        } else {
          errorMessage =
            &quot;Registration failed due to a conflict. Please try different information.&quot;;
          errorCode = &quot;DATA_CONFLICT&quot;;
          statusCode = 409;
        }
      }

      // Provide more detailed error information in development environment
      if ((process.env.NODE_ENV as string) === &quot;development&quot;) {
        errorDetails = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
      }
    } else {
      // For non-Error objects, convert to string for logging
      const errorString = String(error);
      if ((process.env.NODE_ENV as string) === &quot;development&quot;) {
        errorDetails = errorString;
      }
    }

    return errorResponse(errorMessage, statusCode, errorCode, errorDetails);
  }
}
