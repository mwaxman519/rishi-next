import { NextRequest } from &quot;next/server&quot;;
import { verify } from &quot;./jsonwebtoken&quot;;

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  organizationId?: string;
}

export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthenticatedUser | null> {
  try {
    // In development mode, return mock user
    if (process.env.NODE_ENV === &quot;development&quot;) {
      console.log(&quot;DEVELOPMENT MODE: Using mock user for testing&quot;);
      return {
        id: &quot;00000000-0000-0000-0000-000000000001&quot;,
        email: &quot;dev@rishiplatform.com&quot;,
        role: &quot;super_admin&quot;,
        organizationId: &quot;00000000-0000-0000-0000-000000000001&quot;,
      };
    }

    const authHeader = request.headers.get(&quot;authorization&quot;);
    if (!authHeader?.startsWith(&quot;Bearer &quot;)) {
      return null;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || &quot;dev-secret&quot;;

    const decoded = verify(token, secret) as any;

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };
  } catch (error) {
    console.error(&quot;Authentication error:&quot;, error);
    return null;
  }
}
