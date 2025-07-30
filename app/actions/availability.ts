&quot;use server&quot;;

import { getUsersByRole } from &quot;../services/users/userService&quot;;
import { UserProfile, UsersResponse } from &quot;../services/users/models&quot;;
import { USER_ROLES } from &quot;../../shared/rbac/roles&quot;;
import { hasPermission } from &quot;../lib/rbac&quot;;
import { getCurrentUser } from &quot;../lib/auth-utils&quot;;

// Server action for fetching all team members
export async function getTeamMembers(): Promise<UsersResponse> {
  try {
    console.log(&quot;[availability.ts] getTeamMembers - Starting&quot;);

    // Get current user from the server-side auth context
    const currentUser = await getCurrentUser();

    // If no user is authenticated, return unauthorized
    if (!currentUser) {
      console.log(&quot;[availability.ts] getTeamMembers - No authenticated user&quot;);
      return {
        success: false,
        error: &quot;You must be logged in to view team members&quot;,
      };
    }

    // Check if user has permission to view users
    if (!(await hasPermission(&quot;view:users&quot;, currentUser.role))) {
      console.log(&quot;[availability.ts] getTeamMembers - User lacks permission&quot;);
      return {
        success: false,
        error: &quot;You do not have permission to view team members&quot;,
      };
    }

    console.log(&quot;[availability.ts] getTeamMembers - Fetching agents&quot;);

    // Get all agents (brand agents)
    const agentsResponse = await getUsersByRole(USER_ROLES.BRAND_AGENT);

    // If at admin level, also get managers
    if (await hasPermission(&quot;view:managers&quot;, currentUser.role)) {
      console.log(
        &quot;[availability.ts] getTeamMembers - User has admin permission, fetching managers&quot;,
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
      &quot;[availability.ts] Error in getTeamMembers server action:&quot;,
      error,
    );
    return {
      success: false,
      error: &quot;An error occurred while fetching team members&quot;,
    };
  }
}
