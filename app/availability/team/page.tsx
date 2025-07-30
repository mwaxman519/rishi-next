"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthorization } from "@/hooks/useAuthorization";
import { USER_ROLES } from "../../../shared/rbac/roles";
import Link from "next/link";
import * as userService from "../../services/users/userService";
import { UserProfile } from "../../services/users/models";

export default function TeamAvailabilityPage() {
  const { user } = useAuth();
  const { checkPermission, isAtLeastRole } = useAuthorization();
  const [agents, setAgents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        console.log("[team/page.tsx] Loading team members...");

        // Load agents using direct service call
        const agentsResponse = await userService.getUsersByRole(
          USER_ROLES.BRAND_AGENT,
        );
        console.log("[team/page.tsx] Agents response:", agentsResponse);

        if (agentsResponse.success && agentsResponse.data) {
          // Set just the agents first
          setAgents(agentsResponse.data);

          // If user is admin, also get managers and combine
          if (isAtLeastRole(USER_ROLES.INTERNAL_ADMIN)) {
            console.log("[team/page.tsx] User is admin, fetching managers too");
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
        console.error("[team/page.tsx] Failed to load team members:", error);
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
  if (!user || !checkPermission("view:users")) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Team Availability</h1>
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className=&quot;text-red-700>
            You don&apos;t have permission to view this page. Please contact your
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Availability</h1>
        <div className="flex space-x-3">
          <Link
            href="/availability"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Back to Availability
          </Link>
          {isAtLeastRole(USER_ROLES.INTERNAL_ADMIN) && (
            <Link
              href="/users/agents"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition"
            >
              Manage Agents
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Team management tools - different for manager vs admin */}
          {isAtLeastRole(USER_ROLES.INTERNAL_FIELD_MANAGER) && (
            <div className="mb-6 bg-gray-50 p-4 rounded">
              <h2 className="text-lg font-semibold mb-2">
                Team Management Tools
              </h2>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Bulk Set Availability
                </button>
                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Import Schedule
                </button>
                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Export Schedule
                </button>
                {isAtLeastRole(USER_ROLES.INTERNAL_ADMIN) && (
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                    System Settings
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Team members grid */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Team Members</h2>

            {agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mr-4">
                        {agent.profileImage ? (
                          <img
                            src={agent.profileImage}
                            alt={agent.fullName || agent.username}
                            className="w-full h-full rounded-full object-cover"
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
                        <div className="font-medium">
                          {agent.fullName || agent.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {agent.username}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <Link
                        href={`/availability/team/${agent.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        View Availability
                      </Link>

                      {isAtLeastRole(USER_ROLES.INTERNAL_FIELD_MANAGER) && (
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Set Availability
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No agents found. Please add agents to view team availability.
              </p>
            )}
          </div>

          {/* Team calendar view button */}
          <div className="mb-6">
            <Link
              href="/availability/team/calendar"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition"
            >
              View Team Calendar
            </Link>
            <p className=&quot;text-sm text-gray-500 mt-2>
              View a combined calendar of all team members' availability.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
