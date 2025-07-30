/**

export const dynamic = "force-static";
export const revalidate = false;

 * Organization Preferences API Routes
 *
 * These endpoints handle user-specific preferences for each organization, including:
 * - Fetching preferences for all user's organizations
 * - Setting/updating preferences for specific organizations
 * - Managing default organization preferences
 *
 * @module api/organizations/preferences
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  userOrganizationPreferences,
  userOrganizations,
  organizations,
} from "@shared/schema";
import { eq, and, or, asc, desc } from "drizzle-orm";
import { z } from "zod";

/**
 * GET handler for retrieving a user's organization preferences
 *
 * @param request - The incoming request object
 * @returns JSON response with user's organization preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get("organizationId") || undefined);

    // If a specific organization is requested
    if (organizationId) {
      const preference = await db.query.userOrganizationPreferences.findFirst({
        where: and(
          eq(userOrganizationPreferences.userId, user.id),
          eq(
            userOrganizationPreferences.organizationId,
            parseInt(organizationId),
          ),
        ),
      });

      if (!preference) {
        // Create a default preference if none exists
        const newPreference = await db
          .insert(userOrganizationPreferences)
          .values({
            userId: user.id,
            organizationId: parseInt(organizationId),
            theme: "system", // Default theme
            dashboardLayout: "default", // Default layout
            notificationSettings: JSON.stringify({
              email: true,
              inApp: true,
              push: false,
            }),
          })
          .returning();

        return NextResponse.json(newPreference[0]);
      }

      // Parse JSON fields before returning
      if (preference.notificationSettings) {
        try {
          preference.notificationSettings = JSON.parse(
            preference.notificationSettings,
          );
        } catch (e) {
          console.warn("Failed to parse notification settings JSON:", e);
        }
      }

      return NextResponse.json(preference);
    }

    // Get all preferences for the user
    const preferences = await db.query.userOrganizationPreferences.findMany({
      where: eq(userOrganizationPreferences.userId, user.id),
      orderBy: [desc(userOrganizationPreferences.lastActive)],
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            logo_url: true,
            type: true,
            tier: true,
          },
        },
      },
    });

    // Parse JSON fields before returning
    const processedPreferences = preferences.map((pref) => {
      if (pref.notificationSettings) {
        try {
          return {
            ...pref,
            notificationSettings: JSON.parse(pref.notificationSettings),
          };
        } catch (e) {
          console.warn("Failed to parse notification settings JSON:", e);
        }
      }
      return pref;
    });

    return NextResponse.json(processedPreferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

/**
 * Request schema for preference updates
 */
const updatePreferenceSchema = z.object({
  organizationId: z.number(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  dashboardLayout: z.enum(["default", "compact", "expanded"]).optional(),
  notificationSettings: z.record(z.boolean()).optional(),
});

/**
 * POST handler for updating a user's organization preferences
 *
 * @param request - The incoming request object with preference data
 * @returns JSON response indicating success or failure
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updatePreferenceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.format() },
        { status: 400 },
      );
    }

    const { organizationId, theme, dashboardLayout, notificationSettings } =
      validation.data;

    // Check if the user is a member of this organization
    const membership = await db.query.userOrganizations.findFirst({
      where: and(
        eq(userOrganizations.userId, user.id),
        eq(userOrganizations.organizationId, organizationId),
      ),
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 403 },
      );
    }

    // Check if preferences already exist
    const existingPreference =
      await db.query.userOrganizationPreferences.findFirst({
        where: and(
          eq(userOrganizationPreferences.userId, user.id),
          eq(userOrganizationPreferences.organizationId, organizationId),
        ),
      });

    // Prepare the data to update or insert
    const preferenceData: any = {
      lastActive: new Date(),
    };

    if (theme) preferenceData.theme = theme;
    if (dashboardLayout) preferenceData.dashboardLayout = dashboardLayout;
    if (notificationSettings)
      preferenceData.notificationSettings =
        JSON.stringify(notificationSettings);

    let updatedPreference;

    // Create or update preference
    if (existingPreference) {
      updatedPreference = await db
        .update(userOrganizationPreferences)
        .set(preferenceData)
        .where(
          and(
            eq(userOrganizationPreferences.userId, user.id),
            eq(userOrganizationPreferences.organizationId, organizationId),
          ),
        )
        .returning();
    } else {
      updatedPreference = await db
        .insert(userOrganizationPreferences)
        .values({
          userId: user.id,
          organizationId: organizationId,
          theme: theme || "system",
          dashboardLayout: dashboardLayout || "default",
          notificationSettings: notificationSettings
            ? JSON.stringify(notificationSettings)
            : null,
        })
        .returning();
    }

    // Parse the notification settings JSON before returning
    if (updatedPreference[0].notificationSettings) {
      try {
        updatedPreference[0].notificationSettings = JSON.parse(
          updatedPreference[0].notificationSettings,
        );
      } catch (e) {
        console.warn("Failed to parse notification settings JSON:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      data: updatedPreference[0],
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
