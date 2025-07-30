&quot;use client&quot;;

import { useState, Suspense } from &quot;react&quot;;
import { AvailabilityDTO } from &quot;../../models/availability&quot;;
import Link from &quot;next/link&quot;;
import AgentCalendar from &quot;../../components/agent-calendar/AgentCalendar&quot;;
import AvailabilityForm from &quot;../../components/agent-calendar/AvailabilityForm&quot;;

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
  const [activeTab, setActiveTab] = useState<&quot;personal&quot; | &quot;team&quot; | &quot;system&quot;>(
    &quot;personal&quot;,
  );
  const [personalView, setPersonalView] = useState<&quot;calendar&quot; | &quot;list&quot;>(
    &quot;calendar&quot;,
  );

  return (
    <div>
      {/* Primary tabs: Personal vs Team vs System */}
      <div className=&quot;mb-6 border-b&quot;>
        <div className=&quot;flex space-x-4&quot;>
          <button
            className={`pb-2 px-2 ${activeTab === &quot;personal&quot; ? &quot;border-b-2 border-primary font-semibold&quot; : &quot;text-gray-500&quot;}`}
            onClick={() => setActiveTab(&quot;personal&quot;)}
          >
            My Availability
          </button>
          <button
            className={`pb-2 px-2 ${activeTab === &quot;team&quot; ? &quot;border-b-2 border-primary font-semibold&quot; : &quot;text-gray-500&quot;}`}
            onClick={() => setActiveTab(&quot;team&quot;)}
          >
            Team Availability
          </button>
          <button
            className={`pb-2 px-2 ${activeTab === &quot;system&quot; ? &quot;border-b-2 border-primary font-semibold&quot; : &quot;text-gray-500&quot;}`}
            onClick={() => setActiveTab(&quot;system&quot;)}
          >
            System Settings
          </button>
        </div>
      </div>

      {/* Personal Availability Section */}
      {activeTab === &quot;personal&quot; && (
        <div>
          {/* Secondary tabs for personal view */}
          <div className=&quot;mb-6 border-b&quot;>
            <div className=&quot;flex space-x-4&quot;>
              <button
                className={`pb-2 px-2 ${personalView === &quot;calendar&quot; ? &quot;border-b-2 border-secondary font-semibold&quot; : &quot;text-gray-500&quot;}`}
                onClick={() => setPersonalView(&quot;calendar&quot;)}
              >
                Calendar View
              </button>
              <button
                className={`pb-2 px-2 ${personalView === &quot;list&quot; ? &quot;border-b-2 border-secondary font-semibold&quot; : &quot;text-gray-500&quot;}`}
                onClick={() => setPersonalView(&quot;list&quot;)}
              >
                List View
              </button>
            </div>
          </div>

          {/* Calendar view */}
          {personalView === &quot;calendar&quot; && (
            <div className=&quot;mb-6&quot;>
              <div className=&quot;mb-6&quot;>
                <h2 className=&quot;text-lg font-semibold mb-4&quot;>
                  My Availability Calendar
                </h2>
                <p className=&quot;text-gray-600 mb-4&quot;>
                  Manage your availability by selecting dates on the calendar.
                  You can add, edit, or remove availability blocks.
                </p>
                <div className=&quot;h-[600px]&quot;>
                  <AgentCalendar userId={userId} />
                </div>
              </div>
            </div>
          )}

          {/* List view */}
          {personalView === &quot;list&quot; && (
            <div>
              <div className=&quot;mb-6&quot;>
                <h2 className=&quot;text-lg font-semibold mb-4&quot;>Add Availability</h2>
                <AvailabilityForm
                  userId={userId}
                  onSuccess={() => console.log(&quot;Availability block added&quot;)}
                  className=&quot;mb-8&quot;
                />
              </div>

              <div>
                <h2 className=&quot;text-lg font-semibold mb-4&quot;>
                  My Availability Blocks
                </h2>
                {userAvailabilityBlocks.length > 0 ? (
                  <div className=&quot;overflow-x-auto&quot;>
                    <table className=&quot;w-full border-collapse&quot;>
                      <thead>
                        <tr className=&quot;bg-gray-100&quot;>
                          <th className=&quot;p-2 text-left border&quot;>Title</th>
                          <th className=&quot;p-2 text-left border&quot;>Start Date</th>
                          <th className=&quot;p-2 text-left border&quot;>End Date</th>
                          <th className=&quot;p-2 text-left border&quot;>Status</th>
                          <th className=&quot;p-2 text-left border&quot;>Recurring</th>
                          <th className=&quot;p-2 text-left border&quot;>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userAvailabilityBlocks.map((block) => (
                          <tr key={block.id} className=&quot;border-b&quot;>
                            <td className=&quot;p-2 border&quot;>
                              {block.title || &quot;Untitled&quot;}
                            </td>
                            <td className=&quot;p-2 border&quot;>
                              {new Date(block.startDate).toLocaleString()}
                            </td>
                            <td className=&quot;p-2 border&quot;>
                              {new Date(block.endDate).toLocaleString()}
                            </td>
                            <td className=&quot;p-2 border&quot;>{block.status}</td>
                            <td className=&quot;p-2 border&quot;>
                              {block.isRecurring ? &quot;Yes&quot; : &quot;No&quot;}
                            </td>
                            <td className=&quot;p-2 border&quot;>
                              <div className=&quot;flex space-x-2&quot;>
                                <button className=&quot;text-blue-500 hover:text-blue-700&quot;>
                                  Edit
                                </button>
                                <button className=&quot;text-red-500 hover:text-red-700&quot;>
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
                  <p className=&quot;text-gray-500&quot;>
                    No availability blocks found. Add some using the form above.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Availability Section */}
      {activeTab === &quot;team&quot; && (
        <div>
          <div className=&quot;flex justify-between items-center mb-6&quot;>
            <h2 className=&quot;text-lg font-semibold&quot;>
              Organization-Wide Availability
            </h2>
            <div className=&quot;flex space-x-2&quot;>
              <Link
                href=&quot;/availability/team&quot;
                className=&quot;px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition&quot;
              >
                Team View
              </Link>
              <Link
                href=&quot;/users/agents&quot;
                className=&quot;px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition&quot;
              >
                Manage Agents
              </Link>
            </div>
          </div>

          <p className=&quot;text-gray-600 mb-6&quot;>
            View and manage availability for all agents in the organization. Use
            the team view for more detailed options.
          </p>

          {/* Team availability summary */}
          <div className=&quot;bg-gray-50 p-6 rounded-lg mb-6&quot;>
            <h3 className=&quot;font-medium mb-4&quot;>
              Organization Availability Overview
            </h3>

            {/* This would typically be a component that shows a summary of organization-wide availability */}
            <p className=&quot;text-gray-500&quot;>
              Organization-wide availability overview will be displayed here.
            </p>

            {/* Placeholder for organization availability metrics */}
            <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4 mt-4&quot;>
              <div className=&quot;bg-white p-4 rounded shadow&quot;>
                <div className=&quot;font-medium&quot;>Total Agents</div>
                <div className=&quot;text-2xl font-bold mt-2&quot;>0</div>
              </div>
              <div className=&quot;bg-white p-4 rounded shadow&quot;>
                <div className=&quot;font-medium&quot;>Available Agents</div>
                <div className=&quot;text-2xl font-bold mt-2&quot;>0</div>
              </div>
              <div className=&quot;bg-white p-4 rounded shadow&quot;>
                <div className=&quot;font-medium&quot;>Unavailable Agents</div>
                <div className=&quot;text-2xl font-bold mt-2&quot;>0</div>
              </div>
              <div className=&quot;bg-white p-4 rounded shadow&quot;>
                <div className=&quot;font-medium&quot;>Pending Approvals</div>
                <div className=&quot;text-2xl font-bold mt-2&quot;>0</div>
              </div>
            </div>
          </div>

          {/* Recent organization activity */}
          <div className=&quot;mb-6&quot;>
            <h3 className=&quot;font-medium mb-4&quot;>Recent Availability Activity</h3>
            <p className=&quot;text-gray-500&quot;>No recent activity.</p>
          </div>
        </div>
      )}

      {/* System Settings Section - Admin only */}
      {activeTab === &quot;system&quot; && (
        <div>
          <h2 className=&quot;text-lg font-semibold mb-6&quot;>
            Availability System Settings
          </h2>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
            <div className=&quot;bg-white border rounded-lg p-6&quot;>
              <h3 className=&quot;text-md font-medium mb-4&quot;>
                Default Availability Rules
              </h3>
              <div className=&quot;space-y-4&quot;>
                <div>
                  <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
                    Minimum Booking Notice (hours)
                  </label>
                  <input
                    type=&quot;number&quot;
                    className=&quot;border rounded p-2 w-full&quot;
                    defaultValue={24}
                  />
                </div>
                <div>
                  <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
                    Maximum Future Booking Window (days)
                  </label>
                  <input
                    type=&quot;number&quot;
                    className=&quot;border rounded p-2 w-full&quot;
                    defaultValue={60}
                  />
                </div>
                <div>
                  <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
                    Default Appointment Duration (minutes)
                  </label>
                  <input
                    type=&quot;number&quot;
                    className=&quot;border rounded p-2 w-full&quot;
                    defaultValue={30}
                  />
                </div>
              </div>
              <div className=&quot;mt-4&quot;>
                <button className=&quot;px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition&quot;>
                  Save Settings
                </button>
              </div>
            </div>

            <div className=&quot;bg-white border rounded-lg p-6&quot;>
              <h3 className=&quot;text-md font-medium mb-4&quot;>
                Working Hours Configuration
              </h3>
              <div className=&quot;space-y-4&quot;>
                <div>
                  <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
                    Default Working Days
                  </label>
                  <div className=&quot;flex flex-wrap gap-2&quot;>
                    {[
                      &quot;Monday&quot;,
                      &quot;Tuesday&quot;,
                      &quot;Wednesday&quot;,
                      &quot;Thursday&quot;,
                      &quot;Friday&quot;,
                      &quot;Saturday&quot;,
                      &quot;Sunday&quot;,
                    ].map((day) => (
                      <label key={day} className=&quot;flex items-center&quot;>
                        <input
                          type=&quot;checkbox&quot;
                          className=&quot;mr-1&quot;
                          defaultChecked={
                            day !== &quot;Saturday&quot; && day !== &quot;Sunday&quot;
                          }
                        />
                        <span className=&quot;text-sm&quot;>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className=&quot;grid grid-cols-2 gap-4&quot;>
                  <div>
                    <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
                      Default Start Time
                    </label>
                    <input
                      type=&quot;time&quot;
                      className=&quot;border rounded p-2 w-full&quot;
                      defaultValue=&quot;09:00&quot;
                    />
                  </div>
                  <div>
                    <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
                      Default End Time
                    </label>
                    <input
                      type=&quot;time&quot;
                      className=&quot;border rounded p-2 w-full&quot;
                      defaultValue=&quot;17:00&quot;
                    />
                  </div>
                </div>
              </div>
              <div className=&quot;mt-4&quot;>
                <button className=&quot;px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition&quot;>
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
