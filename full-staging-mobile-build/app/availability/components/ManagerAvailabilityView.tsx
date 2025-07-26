"use client";

import { useState, Suspense } from "react";
import { AvailabilityDTO } from "../../models/availability";
import Link from "next/link";
import AgentCalendar from "../../components/agent-calendar/AgentCalendar";
import AvailabilityForm from "../../components/agent-calendar/AvailabilityForm";

interface ManagerAvailabilityViewProps {
  userId: number;
  userAvailabilityBlocks: AvailabilityDTO[];
  teamAvailabilityBlocks: AvailabilityDTO[];
}

export default function ManagerAvailabilityView({
  userId,
  userAvailabilityBlocks,
  teamAvailabilityBlocks,
}: ManagerAvailabilityViewProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "team">("personal");
  const [personalView, setPersonalView] = useState<"calendar" | "list">(
    "calendar",
  );

  return (
    <div>
      {/* Primary tabs: Personal vs Team */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={`pb-2 px-2 ${activeTab === "personal" ? "border-b-2 border-primary font-semibold" : "text-gray-500"}`}
            onClick={() => setActiveTab("personal")}
          >
            My Availability
          </button>
          <button
            className={`pb-2 px-2 ${activeTab === "team" ? "border-b-2 border-primary font-semibold" : "text-gray-500"}`}
            onClick={() => setActiveTab("team")}
          >
            Team Availability
          </button>
        </div>
      </div>

      {/* Personal Availability Section */}
      {activeTab === "personal" && (
        <div>
          {/* Secondary tabs for personal view */}
          <div className="mb-6 border-b">
            <div className="flex space-x-4">
              <button
                className={`pb-2 px-2 ${personalView === "calendar" ? "border-b-2 border-secondary font-semibold" : "text-gray-500"}`}
                onClick={() => setPersonalView("calendar")}
              >
                Calendar View
              </button>
              <button
                className={`pb-2 px-2 ${personalView === "list" ? "border-b-2 border-secondary font-semibold" : "text-gray-500"}`}
                onClick={() => setPersonalView("list")}
              >
                List View
              </button>
            </div>
          </div>

          {/* Calendar view */}
          {personalView === "calendar" && (
            <div className="mb-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">
                  My Availability Calendar
                </h2>
                <p className="text-gray-600 mb-4">
                  Manage your availability by selecting dates on the calendar.
                  You can add, edit, or remove availability blocks.
                </p>
                <div className="h-[600px]">
                  <AgentCalendar userId={userId} />
                </div>
              </div>
            </div>
          )}

          {/* List view */}
          {personalView === "list" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Add Availability</h2>
                <AvailabilityForm
                  userId={userId}
                  onSuccess={() => console.log("Availability block added")}
                  className="mb-8"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">
                  My Availability Blocks
                </h2>
                {userAvailabilityBlocks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left border">Title</th>
                          <th className="p-2 text-left border">Start Date</th>
                          <th className="p-2 text-left border">End Date</th>
                          <th className="p-2 text-left border">Status</th>
                          <th className="p-2 text-left border">Recurring</th>
                          <th className="p-2 text-left border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userAvailabilityBlocks.map((block) => (
                          <tr key={block.id} className="border-b">
                            <td className="p-2 border">
                              {block.title || "Untitled"}
                            </td>
                            <td className="p-2 border">
                              {new Date(block.startDate).toLocaleString()}
                            </td>
                            <td className="p-2 border">
                              {new Date(block.endDate).toLocaleString()}
                            </td>
                            <td className="p-2 border">{block.status}</td>
                            <td className="p-2 border">
                              {block.isRecurring ? "Yes" : "No"}
                            </td>
                            <td className="p-2 border">
                              <div className="flex space-x-2">
                                <button className="text-blue-500 hover:text-blue-700">
                                  Edit
                                </button>
                                <button className="text-red-500 hover:text-red-700">
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No availability blocks found. Add some using the form above.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Availability Section */}
      {activeTab === "team" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Team Availability Overview
            </h2>
            <Link
              href="/availability/team"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition"
            >
              Detailed Team View
            </Link>
          </div>

          <p className="text-gray-600 mb-6">
            View and manage availability for your team members. Use the detailed
            team view for more options.
          </p>

          {/* Team availability summary would go here */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="font-medium mb-4">Quick Team Status</h3>

            {/* This would typically be a component that shows a summary of team availability */}
            <p className="text-gray-500">
              Team availability overview will be displayed here.
            </p>

            {/* Placeholder for team availability metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white p-4 rounded shadow">
                <div className="font-medium">Available Agents</div>
                <div className="text-2xl font-bold mt-2">0</div>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="font-medium">Unavailable Agents</div>
                <div className="text-2xl font-bold mt-2">0</div>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="font-medium">Pending Approvals</div>
                <div className="text-2xl font-bold mt-2">0</div>
              </div>
            </div>
          </div>

          {/* Recent team activity would go here */}
          <div className="mb-6">
            <h3 className="font-medium mb-4">Recent Availability Changes</h3>
            <p className="text-gray-500">No recent changes.</p>
          </div>
        </div>
      )}
    </div>
  );
}
