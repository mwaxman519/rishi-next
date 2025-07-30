&quot;use client&quot;;

import { useEffect, useState } from &quot;react&quot;;
import { useAuth } from &quot;../../../hooks/useAuth&quot;;
import { useAuthorization } from &quot;../../../hooks/useAuthorization&quot;;
import { USER_ROLES } from &quot;../../../../shared/rbac/roles&quot;;
import Link from &quot;next/link&quot;;
import * as userService from &quot;../../../services/users/userService&quot;;
import { UserProfile } from &quot;../../../services/users/models&quot;;

export default function TeamCalendarPage() {
  const { user } = useAuth();
  const { checkPermission, isAtLeastRole } = useAuthorization();
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        // Load agents (brand agents)
        const agentsResponse = await userService.getUsersByRole(
          USER_ROLES.BRAND_AGENT,
        );

        // If at admin level, also load managers
        let managers: UserProfile[] = [];
        if (isAtLeastRole(USER_ROLES.INTERNAL_ADMIN)) {
          const managersResponse = await userService.getUsersByRole(
            USER_ROLES.INTERNAL_FIELD_MANAGER,
          );
          if (managersResponse.success && managersResponse.data) {
            managers = managersResponse.data;
          }
        }

        // Combine all team members
        let allTeamMembers: UserProfile[] = [];
        if (agentsResponse.success && agentsResponse.data) {
          allTeamMembers = [...agentsResponse.data, ...managers];
        }

        setTeamMembers(allTeamMembers);
      } catch (error) {
        console.error(&quot;Failed to load team members:&quot;, error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && isAtLeastRole(USER_ROLES.INTERNAL_FIELD_MANAGER)) {
      loadTeamMembers();
    }
  }, [user, isAtLeastRole]);

  // Check if user has permission to view this page
  if (!user || !checkPermission(&quot;view:users&quot;)) {
    return (
      <div className=&quot;p-6&quot;>
        <h1 className=&quot;text-2xl font-bold mb-6&quot;>Team Calendar</h1>
        <div className=&quot;bg-red-50 border border-red-200 p-4 rounded&quot;>
          <p className=&quot;text-red-700&quot;>
            You don&apos;t have permission to view this page. Please contact your
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;p-6&quot;>
      <div className=&quot;flex justify-between items-center mb-6&quot;>
        <h1 className=&quot;text-2xl font-bold&quot;>Team Calendar</h1>
        <div className=&quot;flex space-x-3&quot;>
          <Link
            href=&quot;/availability/team&quot;
            className=&quot;px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition&quot;
          >
            Back to Team List
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className=&quot;flex justify-center items-center h-64&quot;>
          <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary&quot;></div>
        </div>
      ) : (
        <>
          {/* Team calendar interface will go here */}
          <div className=&quot;bg-white border rounded-lg p-6 mb-6&quot;>
            <h2 className=&quot;text-lg font-semibold mb-4&quot;>Team Calendar View</h2>
            <p className=&quot;text-gray-500 mb-4&quot;>
              This calendar shows all team members' availability in a
              consolidated view.
            </p>

            {/* Calendar placeholder - would be replaced with actual calendar component */}
            <div className=&quot;border rounded-lg h-96 flex items-center justify-center bg-gray-50&quot;>
              <p className=&quot;text-gray-400&quot;>
                Calendar view will be implemented here.
              </p>
            </div>
          </div>

          {/* Team members legend */}
          <div className=&quot;bg-white border rounded-lg p-6&quot;>
            <h2 className=&quot;text-lg font-semibold mb-4&quot;>Team Members</h2>

            {teamMembers.length > 0 ? (
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3&quot;>
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className=&quot;flex items-center p-2 border rounded&quot;
                  >
                    <div className=&quot;w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mr-3&quot;>
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.fullName || member.username}
                          className=&quot;w-full h-full rounded-full object-cover&quot;
                        />
                      ) : (
                        <span>
                          {(member.fullName || member.username)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className=&quot;font-medium&quot;>
                        {member.fullName || member.username}
                      </div>
                      <div className=&quot;text-xs text-gray-500&quot;>
                        {member.role === USER_ROLES.BRAND_AGENT
                          ? &quot;Agent&quot;
                          : &quot;Manager&quot;}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className=&quot;text-gray-500&quot;>No team members found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
