import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { SignJWT } from "jose";
import { db } from "@db";
import { users, userOrganizations, organizations } from "../../../../../shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

// Secret key for JWT signing - should be in env variables for production
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-secret-key-change-in-production",
);

export async function POST(request: NextRequest) {
  try {
    console.log("Login attempt started");
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Error parsing JSON request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    const { username, password } = body;

    console.log("Received login request for user:", username);

    if (!username || !password) {
      console.log("Missing username or password in request");
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    console.log("Trying to log in with username:", username);

    // Always use try/catch for database operations
    let user;
    try {
      // Get user from database
      [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
    } catch (dbError) {
      console.error("Database error during user lookup:", dbError);
      return NextResponse.json(
        { error: "Service unavailable, please try again later" },
        { status: 503 },
      );
    }

    if (!user) {
      console.log("User not found in database:", username);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    console.log("User found:", {
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // Production-safe password verification
    let passwordMatch = false;

    // Special case for Matt's account for debugging - only in development
    if (process.env.NODE_ENV !== "production" && user.username === "matt") {
      console.log('Development mode: Bypassing password check for "matt" user');
      passwordMatch = true;
    } else {
      // Verify password with detailed logging for debugging
      console.log("Attempting to verify password");

      if (!user.password) {
        console.error("Password missing in user record");
        return NextResponse.json(
          { error: "Account configuration error" },
          { status: 500 },
        );
      }

      try {
        passwordMatch = await comparePasswords(password, user.password);
      } catch (passwordError) {
        console.error("Error during password verification:", passwordError);
        return NextResponse.json(
          { error: "Authentication error" },
          { status: 500 },
        );
      }

      if (!passwordMatch) {
        console.log("Password verification failed for user:", username);
        return NextResponse.json(
          { error: "Invalid username or password" },
          { status: 401 },
        );
      }
    }

    console.log("Password verification successful for user:", username);

    // Get user organizations
    const userOrgs = await db
      .select({
        orgId: organizations.id,
        orgName: organizations.name,
        orgType: organizations.type,
        isPrimary: userOrganizations.is_default,
        role: userOrganizations.role,
      })
      .from(userOrganizations)
      .innerJoin(
        organizations,
        eq(userOrganizations.organization_id, organizations.id),
      )
      .where(eq(userOrganizations.user_id, user.id));

    console.log("User organizations:", userOrgs);

    // Set default organization
    let defaultOrg = userOrgs.find((org: any) => org.isPrimary) || userOrgs[0];

    // Create JWT token
    const token = await new SignJWT({
      sub: user.id,
      username: user.username,
      role: user.role,
      organizationId: defaultOrg?.orgId || null,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // Set cookie with JWT (await is required in Next.js 15.2.2)
    const cookieStore = await cookies();
    await cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        ...userWithoutPassword,
        organizations: userOrgs,
        currentOrganization: defaultOrg,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Compare stored password hash with supplied password
async function comparePasswords(
  supplied: string,
  stored: string,
): Promise<boolean> {
  try {
    // Input validation with detailed logging
    if (!supplied) {
      console.error("Empty supplied password");
      return false;
    }

    if (!stored) {
      console.error("Empty stored password hash");
      return false;
    }

    // Check if the stored password value is properly formatted
    if (!stored.includes(".")) {
      console.error(
        "Invalid password format in database (does not contain separator)",
        {
          storedLength: stored.length,
          storedType: typeof stored,
          firstChars: stored.substring(0, 10) + "...",
        },
      );
      return false;
    }

    // Split the stored hash and salt
    const [hash, salt] = stored.split(".");

    if (!hash || !salt) {
      console.error(
        "Invalid password format in database (missing hash or salt)",
        {
          hashExists: !!hash,
          hashLength: hash?.length || 0,
          saltExists: !!salt,
          saltLength: salt?.length || 0,
        },
      );
      return false;
    }

    // Log more information for debugging
    console.log(`Password format check:`, {
      hashLength: hash.length,
      saltLength: salt.length,
      isHashHex: /^[0-9a-f]+$/i.test(hash),
    });

    // Create buffers for comparison - with safe type assertions since we've checked existence
    try {
      // Convert stored hash to buffer
      const storedHashBuffer = Buffer.from(hash, "hex");

      if (storedHashBuffer.length === 0) {
        console.error("Failed to create storedHashBuffer, buffer is empty");
        return false;
      }

      // Generate hash from supplied password using same salt
      const suppliedHashBuffer = (await scryptAsync(
        supplied,
        salt,
        64,
      )) as Buffer;

      if (!suppliedHashBuffer) {
        console.error("Failed to generate suppliedHashBuffer", {
          type: typeof suppliedHashBuffer,
          isBuffer: Buffer.isBuffer(suppliedHashBuffer),
        });
        return false;
      }

      // Safety check for buffer lengths before comparison
      if (storedHashBuffer.length !== suppliedHashBuffer.length) {
        console.error("Buffer length mismatch", {
          storedLength: storedHashBuffer.length,
          suppliedLength: suppliedHashBuffer.length,
        });
        return false;
      }

      // Compare using timing-safe comparison
      const match = timingSafeEqual(storedHashBuffer, suppliedHashBuffer);
      console.log("Password comparison result:", match);
      return match;
    } catch (bufferError) {
      console.error("Buffer creation error:", bufferError);
      return false;
    }
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}
