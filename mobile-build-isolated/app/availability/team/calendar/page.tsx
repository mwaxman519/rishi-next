"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useAuthorization } from "../../../hooks/useAuthorization";
import { USER_ROLES } from "../../../../shared/rbac/roles";
import Link from "next/link";
import * as userService from "../../../services/users/userService";
import { UserProfile } from "../../../services/users/models";

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
        console.error("Failed to load team members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && isAtLeastRole(USER_ROLES.INTERNAL_FIELD_MANAGER)) {
      loadTeamMembers();
    }
  }, [user, isAtLeastRole]);

  // Check if user has permission to view this page
  if (!user || !checkPermission("view:users")) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Team Calendar</h1>
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-700">
            You don't have permission to view this page. Please contact your
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Calendar</h1>
        <div className="flex space-x-3">
          <Link
            href="/availability/team"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Back to Team List
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Team calendar interface will go here */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Team Calendar View</h2>
            <p className="text-gray-500 mb-4">
              This calendar shows all team members' availability in a
              consolidated view.
            </p>

            {/* Calendar placeholder - would be replaced with actual calendar component */}
            <div className="border rounded-lg h-96 flex items-center justify-center bg-gray-50">
              <p className="text-gray-400">
                Calendar view will be implemented here.
              </p>
            </div>
          </div>

          {/* Team members legend */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Team Members</h2>

            {teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center p-2 border rounded"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mr-3">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.fullName || member.username}
                          className="w-full h-full rounded-full object-cover"
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
                      <div className="font-medium">
                        {member.fullName || member.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.role === USER_ROLES.BRAND_AGENT
                          ? "Agent"
                          : "Manager"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No team members found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
