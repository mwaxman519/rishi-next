&quot;use client&quot;;

import { useEffect, useState } from &quot;react&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
import { USER_ROLES } from &quot;../../../shared/rbac/roles&quot;;
import Link from &quot;next/link&quot;;
import * as userService from &quot;../../services/users/userService&quot;;
import { UserProfile } from &quot;../../services/users/models&quot;;

export default function TeamAvailabilityPage() {
  const { user } = useAuth();
  const { checkPermission, isAtLeastRole } = useAuthorization();
  const [agents, setAgents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log(&quot;[team/page.tsx] Loading team members...&quot;);

        // Load agents using direct service call
        const agentsResponse = await userService.getUsersByRole(
          USER_ROLES.BRAND_AGENT,
        );
        console.log(&quot;[team/page.tsx] Agents response:&quot;, agentsResponse);

        if (agentsResponse.success && agentsResponse.data) {
          // Set just the agents first
          setAgents(agentsResponse.data);

          // If user is admin, also get managers and combine
          if (isAtLeastRole(USER_ROLES.INTERNAL_ADMIN)) {
            console.log(&quot;[team/page.tsx] User is admin, fetching managers too&quot;);
            const managersResponse = await userService.getUsersByRole(
              USER_ROLES.INTERNAL_FIELD_MANAGER,
            );

            if (managersResponse.success && managersResponse.data) {
              const combinedTeam = [
                ...agentsResponse.data,
                ...managersResponse.data,
              ];
              console.log(
                `[team/page.tsx] Setting combined team (${combinedTeam.length} members)`,
              );
              setAgents(combinedTeam);
            }
          } else {
            console.log(
              `[team/page.tsx] Setting agents only (${agentsResponse.data.length} members)`,
            );
          }
        } else if (!agentsResponse.success) {
          console.error(
            `[team/page.tsx] Error fetching agents: ${agentsResponse.error}`,
          );
        }
      } catch (error) {
        console.error(&quot;[team/page.tsx] Failed to load team members:&quot;, error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && isAtLeastRole(USER_ROLES.INTERNAL_FIELD_MANAGER)) {
      loadTeamMembers();
    } else {
      setIsLoading(false);
    }
  }, [user, isAtLeastRole]);

  // Check if user has permission to view this page
  if (!user || !checkPermission(&quot;view:users&quot;)) {
    return (
      <div className=&quot;p-6&quot;>
        <h1 className=&quot;text-2xl font-bold mb-6&quot;>Team Availability</h1>
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
        <h1 className=&quot;text-2xl font-bold&quot;>Team Availability</h1>
        <div className=&quot;flex space-x-3&quot;>
          <Link
            href=&quot;/availability&quot;
            className=&quot;px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition&quot;
          >
            Back to Availability
          </Link>
          {isAtLeastRole(USER_ROLES.INTERNAL_ADMIN) && (
            <Link
              href=&quot;/users/agents&quot;
              className=&quot;px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition&quot;
            >
              Manage Agents
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className=&quot;flex justify-center items-center h-64&quot;>
          <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary&quot;></div>
        </div>
      ) : (
        <>
          {/* Team management tools - different for manager vs admin */}
          {isAtLeastRole(USER_ROLES.INTERNAL_FIELD_MANAGER) && (
            <div className=&quot;mb-6 bg-gray-50 p-4 rounded&quot;>
              <h2 className=&quot;text-lg font-semibold mb-2&quot;>
                Team Management Tools
              </h2>
              <div className=&quot;flex flex-wrap gap-2&quot;>
                <button className=&quot;px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50&quot;>
                  Bulk Set Availability
                </button>
                <button className=&quot;px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50&quot;>
                  Import Schedule
                </button>
                <button className=&quot;px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50&quot;>
                  Export Schedule
                </button>
                {isAtLeastRole(USER_ROLES.INTERNAL_ADMIN) && (
                  <button className=&quot;px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50&quot;>
                    System Settings
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Team members grid */}
          <div className=&quot;mb-6&quot;>
            <h2 className=&quot;text-lg font-semibold mb-4&quot;>Team Members</h2>

            {agents.length > 0 ? (
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className=&quot;border rounded-lg p-4 bg-white hover:shadow-md transition&quot;
                  >
                    <div className=&quot;flex items-center mb-4&quot;>
                      <div className=&quot;w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mr-4&quot;>
                        {agent.profileImage ? (
                          <img
                            src={agent.profileImage}
                            alt={agent.fullName || agent.username}
                            className=&quot;w-full h-full rounded-full object-cover&quot;
                          />
                        ) : (
                          <span>
                            {(agent.fullName || agent.username)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className=&quot;font-medium&quot;>
                          {agent.fullName || agent.username}
                        </div>
                        <div className=&quot;text-sm text-gray-500&quot;>
                          {agent.username}
                        </div>
                      </div>
                    </div>

                    <div className=&quot;flex justify-between mt-4&quot;>
                      <Link
                        href={`/availability/team/${agent.id}`}
                        className=&quot;text-primary hover:underline text-sm&quot;
                      >
                        View Availability
                      </Link>

                      {isAtLeastRole(USER_ROLES.INTERNAL_FIELD_MANAGER) && (
                        <button className=&quot;text-sm text-gray-500 hover:text-gray-700&quot;>
                          Set Availability
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className=&quot;text-gray-500&quot;>
                No agents found. Please add agents to view team availability.
              </p>
            )}
          </div>

          {/* Team calendar view button */}
          <div className=&quot;mb-6&quot;>
            <Link
              href=&quot;/availability/team/calendar&quot;
              className=&quot;px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition&quot;
            >
              View Team Calendar
            </Link>
            <p className=&quot;text-sm text-gray-500 mt-2&quot;>
              View a combined calendar of all team members' availability.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
