/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Login API for Auth Microservice
 *
 * Handles user authentication.
 */
import { NextRequest } from &quot;next/server&quot;;
import { z } from &quot;zod&quot;;
import { createToken } from &quot;../../utils/jwt&quot;;
import { comparePasswords } from &quot;../../utils/password&quot;;
import {
  errorResponse,
  responseWithAuthCookie,
  successResponse,
} from &quot;../../utils/response&quot;;
import {
  getUserByUsername,
  getUserOrganizations,
} from &quot;../../models/user-repository&quot;;
import { AUTH_CONFIG } from &quot;../../config&quot;;

// Login request schema
const loginSchema = z.object({
  username: z.string().min(1, &quot;Username is required&quot;),
  password: z.string().min(1, &quot;Password is required&quot;),
});

/**
 * Handle POST /api/auth-service/routes/login
 * Authenticate a user
 */
export async function POST(request: NextRequest) {
  try {
    console.log(&quot;[Auth Service] Login attempt&quot;);

    // Development mode bypass
    if (AUTH_CONFIG.DEV_MODE) {
      const urlParams = new URL(request.url).searchParams;
      if (urlParams.get(&quot;dev_mode&quot;) === &quot;true&quot;) {
        console.log(
          &quot;[Auth Service] DEVELOPMENT MODE: Simulating successful login&quot;,
        );

        // Create a token for the mock user
        const token = await createToken(&quot;00000000-0000-0000-0000-000000000001&quot;);

        return responseWithAuthCookie(
          {
            user: {
              id: &quot;00000000-0000-0000-0000-000000000001&quot;,
              username: &quot;admin&quot;,
              email: &quot;admin@example.com&quot;,
              fullName: &quot;Admin User&quot;,
              role: &quot;super_admin&quot;,
              roles: [&quot;SUPER_ADMIN&quot;],
              organizations: [
                {
                  orgId: &quot;00000000-0000-0000-0000-000000000001&quot;,
                  orgName: &quot;Rishi Internal&quot;,
                  orgType: &quot;internal&quot;,
                  role: &quot;super_admin&quot;,
                  isDefault: true,
                },
              ],
              currentOrganization: {
                orgId: &quot;00000000-0000-0000-0000-000000000001&quot;,
                orgName: &quot;Rishi Internal&quot;,
                orgType: &quot;internal&quot;,
                role: &quot;super_admin&quot;,
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
      console.error(&quot;[Auth Service] JSON parse error:&quot;, parseError);
      return errorResponse(&quot;Invalid request format&quot;, 400, &quot;VALIDATION_ERROR&quot;);
    }

    // Validate login data
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(
        &quot;Invalid login data&quot;,
        400,
        &quot;VALIDATION_ERROR&quot;,
        result.error.issues,
      );
    }

    // Get validated data
    const { username, password } = result.data;

    // Find user in database
    const user = await getUserByUsername(username);

    if (!user) {
      return errorResponse(&quot;Invalid username or password&quot;, 401, &quot;AUTH_ERROR&quot;);
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
      return errorResponse(&quot;Authentication error&quot;, 401, &quot;AUTH_ERROR&quot;);
    }

    if (!validPassword) {
      return errorResponse(&quot;Invalid username or password&quot;, 401, &quot;AUTH_ERROR&quot;);
    }

    // Check if user is active
    if (!user.active) {
      return errorResponse(&quot;Account is disabled&quot;, 403, &quot;ACCOUNT_DISABLED&quot;);
    }

    // Get user organizations
    let userOrgs = await getUserOrganizations(user.id);

    // If no organizations found, create fallback for stability (especially for test accounts)
    if (!userOrgs || userOrgs.length === 0) {
      console.log(
        `[Auth Service] No organizations found for user ${username}, creating fallback organization data`,
      );

      // Create a default organization based on the user's role
      if (user.role === &quot;super_admin&quot; || user.role === &quot;admin&quot;) {
        userOrgs = [
          {
            orgId: &quot;ec83b1b1-af6e-4465-806e-8d51a1449e86&quot;,
            orgName: &quot;Rishi Internal&quot;,
            orgType: &quot;internal&quot;,
            role: user.role,
            isPrimary: true,
          },
        ];
      } else {
        userOrgs = [
          {
            orgId: &quot;00000000-0000-0000-0000-000000000002&quot;,
            orgName: &quot;Default Organization&quot;,
            orgType: &quot;client&quot;,
            role: user.role || &quot;brand_agent&quot;,
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
      fullName: user.fullName || null,
      role: user.role || &quot;brand_agent&quot;,
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
          fullName: user.fullName || username,
          organizations: userOrgs,
          currentOrganization: defaultOrg,
        },
      },
      token,
    );
  } catch (error) {
    console.error(&quot;[Auth Service] Login error:&quot;, error);

    return errorResponse(
      &quot;Authentication failed&quot;,
      500,
      &quot;SERVER_ERROR&quot;,
      process.env.NODE_ENV === &quot;development&quot; ? String(error) : undefined,
    );
  }
}
