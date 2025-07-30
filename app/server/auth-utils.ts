import { NextRequest } from "next/server";
import { verify } from "./jsonwebtoken";

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
    if (process.env.NODE_ENV === "development") {
      console.log("DEVELOPMENT MODE: Using mock user for testing");
      return {
        id: "00000000-0000-0000-0000-000000000001",
        email: "dev@rishiplatform.com",
        role: "super_admin",
        organizationId: "00000000-0000-0000-0000-000000000001",
      };
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || "dev-secret";

    const decoded = verify(token, secret) as any;

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}
