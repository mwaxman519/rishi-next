"use server";

import { getUsersByRole } from "../services/users/userService";
import { UserProfile, UsersResponse } from "../services/users/models";
import { USER_ROLES } from "../../shared/rbac/roles";
import { hasPermission } from "../lib/rbac";
import { getCurrentUser } from "../lib/auth-utils";

// Server action for fetching all team members
export async function getTeamMembers(): Promise<UsersResponse> {
  try {
    console.log("[availability.ts] getTeamMembers - Starting");

    // Get current user from the server-side auth context
    const currentUser = await getCurrentUser();

    // If no user is authenticated, return unauthorized
    if (!currentUser) {
      console.log("[availability.ts] getTeamMembers - No authenticated user");
      return {
        success: false,
        error: "You must be logged in to view team members",
      };
    }

    // Check if user has permission to view users
    if (!hasPermission("view:users", currentUser.role)) {
      console.log("[availability.ts] getTeamMembers - User lacks permission");
      return {
        success: false,
        error: "You do not have permission to view team members",
      };
    }

    console.log("[availability.ts] getTeamMembers - Fetching agents");

    // Get all agents (brand agents)
    const agentsResponse = await getUsersByRole(USER_ROLES.BRAND_AGENT);

    // If at admin level, also get managers
    if (hasPermission("view:managers", currentUser.role)) {
      console.log(
        "[availability.ts] getTeamMembers - User has admin permission, fetching managers",
      );

      const managersResponse = await getUsersByRole(
        USER_ROLES.INTERNAL_FIELD_MANAGER,
      );

      if (
        agentsResponse.success &&
        managersResponse.success &&
        agentsResponse.data &&
        managersResponse.data
      ) {
        // Combine agents and managers
        const combinedTeam = [...agentsResponse.data, ...managersResponse.data];
        console.log(
          `[availability.ts] getTeamMembers - Returning combined team (${combinedTeam.length} members)`,
        );

        return {
          success: true,
          data: combinedTeam,
        };
      }
    }

    // Return just agents if not admin or if manager fetch failed
    console.log(
      `[availability.ts] getTeamMembers - Returning agents only (${agentsResponse.data?.length || 0} members)`,
    );
    return agentsResponse;
  } catch (error) {
    console.error(
      "[availability.ts] Error in getTeamMembers server action:",
      error,
    );
    return {
      success: false,
      error: "An error occurred while fetching team members",
    };
  }
}
