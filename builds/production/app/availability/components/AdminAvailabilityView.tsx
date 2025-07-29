"use client";

import { useState, Suspense } from "react";
import { AvailabilityDTO } from "../../models/availability";
import Link from "next/link";
import AgentCalendar from "../../components/agent-calendar/AgentCalendar";
import AvailabilityForm from "../../components/agent-calendar/AvailabilityForm";

interface AdminAvailabilityViewProps {
  userId: number;
  userAvailabilityBlocks: AvailabilityDTO[];
  teamAvailabilityBlocks: AvailabilityDTO[];
}

export default function AdminAvailabilityView({
  userId,
  userAvailabilityBlocks,
  teamAvailabilityBlocks,
}: AdminAvailabilityViewProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "team" | "system">(
    "personal",
  );
  const [personalView, setPersonalView] = useState<"calendar" | "list">(
    "calendar",
  );

  return (
    <div>
      {/* Primary tabs: Personal vs Team vs System */}
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
          <button
            className={`pb-2 px-2 ${activeTab === "system" ? "border-b-2 border-primary font-semibold" : "text-gray-500"}`}
            onClick={() => setActiveTab("system")}
          >
            System Settings
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
              Organization-Wide Availability
            </h2>
            <div className="flex space-x-2">
              <Link
                href="/availability/team"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition"
              >
                Team View
              </Link>
              <Link
                href="/users/agents"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Manage Agents
              </Link>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            View and manage availability for all agents in the organization. Use
            the team view for more detailed options.
          </p>

          {/* Team availability summary */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="font-medium mb-4">
              Organization Availability Overview
            </h3>

            {/* This would typically be a component that shows a summary of organization-wide availability */}
            <p className="text-gray-500">
              Organization-wide availability overview will be displayed here.
            </p>

            {/* Placeholder for organization availability metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white p-4 rounded shadow">
                <div className="font-medium">Total Agents</div>
                <div className="text-2xl font-bold mt-2">0</div>
              </div>
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

          {/* Recent organization activity */}
          <div className="mb-6">
            <h3 className="font-medium mb-4">Recent Availability Activity</h3>
            <p className="text-gray-500">No recent activity.</p>
          </div>
        </div>
      )}

      {/* System Settings Section - Admin only */}
      {activeTab === "system" && (
        <div>
          <h2 className="text-lg font-semibold mb-6">
            Availability System Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-md font-medium mb-4">
                Default Availability Rules
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Booking Notice (hours)
                  </label>
                  <input
                    type="number"
                    className="border rounded p-2 w-full"
                    defaultValue={24}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Future Booking Window (days)
                  </label>
                  <input
                    type="number"
                    className="border rounded p-2 w-full"
                    defaultValue={60}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Appointment Duration (minutes)
                  </label>
                  <input
                    type="number"
                    className="border rounded p-2 w-full"
                    defaultValue={30}
                  />
                </div>
              </div>
              <div className="mt-4">
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition">
                  Save Settings
                </button>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-md font-medium mb-4">
                Working Hours Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Working Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-1"
                          defaultChecked={
                            day !== "Saturday" && day !== "Sunday"
                          }
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Start Time
                    </label>
                    <input
                      type="time"
                      className="border rounded p-2 w-full"
                      defaultValue="09:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default End Time
                    </label>
                    <input
                      type="time"
                      className="border rounded p-2 w-full"
                      defaultValue="17:00"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
