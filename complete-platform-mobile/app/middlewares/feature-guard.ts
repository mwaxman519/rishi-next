/**
 * Feature Guard Middleware
 * This middleware protects API routes by checking if the required feature is available and enabled
 */
import { NextRequest, NextResponse } from "next/server";
import {
  isFeatureEnabled,
  isFeatureAvailableForTier,
} from "../../shared/features/registry";
import { getOrganizationById } from "../lib/organization-server";
import { getUser } from "../lib/auth-server";

export type FeatureGuardConfig = {
  featureId: string;
  redirectPath?: string; // Path to redirect to if feature is not available
  apiMode?: boolean; // If true, returns JSON error instead of redirecting
};

/**
 * Feature guard middleware factory
 * Creates a middleware that protects routes based on feature availability
 *
 * @param config The feature guard configuration
 * @returns A Next.js middleware function
 */
export function createFeatureGuard(config: FeatureGuardConfig) {
  return async function featureGuard(
    request: NextRequest,
    response: NextResponse,
  ) {
    try {
      // Get the authenticated user
      const user = await getUser();

      // If no user, redirect to login or return error
      if (!user) {
        if (config.apiMode) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          );
        } else {
          return NextResponse.redirect(new URL("/auth", request.url));
        }
      }

      // Get user's active organization
      // In a real app, you would get this from the request context or user's preferences
      const userOrgs = await getUserOrganizations(user.id);
      if (!userOrgs || userOrgs.length === 0) {
        if (config.apiMode) {
          return NextResponse.json(
            { error: "No organization access" },
            { status: 403 },
          );
        } else {
          return NextResponse.redirect(new URL("/organizations", request.url));
        }
      }

      // Get active organization (could be from user preferences, cookies, etc.)
      // For this example, we'll take the first organization
      const organizationId = userOrgs[0].organizationId;

      // Get organization details
      const organization = await getOrganizationById(organizationId);
      if (!organization) {
        if (config.apiMode) {
          return NextResponse.json(
            { error: "Organization not found" },
            { status: 404 },
          );
        } else {
          return NextResponse.redirect(new URL("/organizations", request.url));
        }
      }

      // Check if the feature is available for this organization's tier
      const isAvailable = isFeatureAvailableForTier(
        config.featureId,
        organization.tier,
      );
      if (!isAvailable) {
        if (config.apiMode) {
          return NextResponse.json(
            {
              error: "Feature not available",
              message: `The feature '${config.featureId}' is not available for your organization's tier`,
            },
            { status: 403 },
          );
        } else {
          return NextResponse.redirect(
            new URL(config.redirectPath || "/feature-unavailable", request.url),
          );
        }
      }

      // Check if the feature is enabled for this organization
      const isEnabled = await isFeatureEnabled(
        config.featureId,
        organizationId,
      );
      if (!isEnabled) {
        if (config.apiMode) {
          return NextResponse.json(
            {
              error: "Feature not enabled",
              message: `The feature '${config.featureId}' is disabled for your organization`,
            },
            { status: 403 },
          );
        } else {
          return NextResponse.redirect(
            new URL(config.redirectPath || "/feature-disabled", request.url),
          );
        }
      }

      // Feature is available and enabled, continue
      return NextResponse.next();
    } catch (error) {
      console.error("Error in feature guard middleware:", error);

      if (config.apiMode) {
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      } else {
        return NextResponse.redirect(new URL("/error", request.url));
      }
    }
  };
}

// Helper function to get user organizations
// Note: In a real app, this would be implemented in your user service
async function getUserOrganizations(userId: string) {
  // Production implementation - check feature availability against organization tier
  return [
    { organizationId: "00000000-0000-0000-0000-000000000001", role: "user" },
  ];
}
