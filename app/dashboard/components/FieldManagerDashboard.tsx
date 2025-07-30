&quot;use client&quot;;

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;../../components/ui/card&quot;;
import { Button } from &quot;../../components/ui/button&quot;;
import { Badge } from &quot;../../components/ui/badge&quot;;
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  TrendingUp,
  Star,
  Activity,
  Target,
  Award,
  Briefcase,
  DollarSign,
  BarChart3,
  Plus,
  ArrowRight,
  Bell,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Building,
  User,
  ChevronRight,
  Phone,
  Mail,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { useState, useEffect } from &quot;react&quot;;



export default function FieldManagerDashboard() {
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch team performance data
        const teamResponse = await fetch('/api/users?role=brand_agent&includeMetrics=true');
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamPerformance(teamData.data || []);
        }

        // Fetch upcoming events
        const eventsResponse = await fetch('/api/bookings?status=upcoming&limit=10');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setUpcomingEvents(eventsData.data || []);
        }

        // Fetch pending requests
        const requestsResponse = await fetch('/api/requests?status=pending&limit=10');
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setPendingRequests(requestsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className=&quot;min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center&quot;>
        <div className=&quot;text-center&quot;>
          <div className=&quot;animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4&quot;></div>
          <p className=&quot;text-gray-600&quot;>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50&quot;>
      <div className=&quot;container mx-auto p-6 space-y-8&quot;>
        {/* Stunning Header with Gradient */}
        <div className=&quot;relative bg-gradient-to-r from-purple-600 via-purple-700 to-teal-600 rounded-3xl p-8 text-white overflow-hidden&quot;>
          <div className=&quot;absolute inset-0 bg-black/10 backdrop-blur-sm&quot;></div>
          <div className=&quot;relative z-10&quot;>
            <div className=&quot;flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0&quot;>
              <div>
                <h1 className=&quot;text-4xl font-bold mb-2&quot;>
                  Field Manager Dashboard
                </h1>
                <p className=&quot;text-purple-100 text-lg&quot;>
                  Coordinate teams and optimize operational excellence
                </p>
              </div>
              <div className=&quot;flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3&quot;>
                <Button
                  size=&quot;lg&quot;
                  className=&quot;bg-white text-purple-600 hover:bg-purple-50 shadow-xl&quot;
                >
                  <Plus className=&quot;h-5 w-5 mr-2&quot; />
                  Assign Staff
                </Button>
                <Button
                  variant=&quot;outline&quot;
                  size=&quot;lg&quot;
                  className=&quot;border-white text-white hover:bg-white/10&quot;
                >
                  <Bell className=&quot;h-5 w-5 mr-2&quot; />
                  Requests (3)
                </Button>
              </div>
            </div>
          </div>
          <div className=&quot;absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl&quot;></div>
          <div className=&quot;absolute -bottom-10 -left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl&quot;></div>
        </div>

        {/* Performance Metrics Dashboard */}
        <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-6&quot;>
          <Card className=&quot;bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-emerald-100 font-medium&quot;>
                    Team Performance
                  </p>
                  <p className=&quot;text-3xl font-bold&quot;>94%</p>
                </div>
                <TrendingUp className=&quot;h-8 w-8 text-emerald-200&quot; />
              </div>
            </CardContent>
          </Card>

          <Card className=&quot;bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-blue-100 font-medium&quot;>Active Events</p>
                  <p className=&quot;text-3xl font-bold&quot;>12</p>
                </div>
                <Activity className=&quot;h-8 w-8 text-blue-200&quot; />
              </div>
            </CardContent>
          </Card>

          <Card className=&quot;bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-purple-100 font-medium&quot;>Team Size</p>
                  <p className=&quot;text-3xl font-bold&quot;>24</p>
                </div>
                <Users className=&quot;h-8 w-8 text-purple-200&quot; />
              </div>
            </CardContent>
          </Card>

          <Card className=&quot;bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-orange-100 font-medium&quot;>Avg Rating</p>
                  <p className=&quot;text-3xl font-bold&quot;>4.7</p>
                </div>
                <Star className=&quot;h-8 w-8 text-orange-200&quot; />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-8&quot;>
          {/* Upcoming Events Management */}
          <div className=&quot;lg:col-span-2&quot;>
            <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20&quot;>
                <div className=&quot;flex justify-between items-center&quot;>
                  <div>
                    <CardTitle className=&quot;flex items-center&quot;>
                      <Calendar className=&quot;h-5 w-5 mr-2 text-blue-600&quot; />
                      Event Management
                    </CardTitle>
                    <CardDescription>
                      Monitor staffing and event readiness
                    </CardDescription>
                  </div>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                    <ArrowRight className=&quot;h-4 w-4 mr-2&quot; />
                    View Calendar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className=&quot;p-6&quot;>
                <div className=&quot;space-y-4&quot;>
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className=&quot;group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100 rounded-xl p-4&quot;
                    >
                      <div className=&quot;flex justify-between items-start mb-3&quot;>
                        <div className=&quot;flex-1&quot;>
                          <h3 className=&quot;font-semibold text-gray-900 group-hover:text-blue-600 transition-colors&quot;>
                            {event.title}
                          </h3>
                          <div className=&quot;flex items-center mt-1 space-x-2&quot;>
                            <Building className=&quot;h-4 w-4 text-gray-500&quot; />
                            <span className=&quot;text-sm text-gray-600&quot;>
                              {event.client}
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={`${
                            event.status === &quot;fully_staffed&quot;
                              ? &quot;bg-green-100 text-green-800 border-green-200&quot;
                              : event.status === &quot;understaffed&quot;
                                ? &quot;bg-red-100 text-red-800 border-red-200&quot;
                                : &quot;bg-yellow-100 text-yellow-800 border-yellow-200&quot;
                          } px-3 py-1`}
                        >
                          {event.status === &quot;fully_staffed&quot;
                            ? &quot;FULLY STAFFED&quot;
                            : event.status === &quot;understaffed&quot;
                              ? &quot;UNDERSTAFFED&quot;
                              : &quot;PENDING&quot;}
                        </Badge>
                      </div>

                      <div className=&quot;grid grid-cols-2 md:grid-cols-3 gap-3 mb-4&quot;>
                        <div className=&quot;flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2&quot;>
                          <Calendar className=&quot;h-4 w-4 mr-2 text-blue-500&quot; />
                          <span className=&quot;font-medium&quot;>{event.date}</span>
                        </div>
                        <div className=&quot;flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2&quot;>
                          <Clock className=&quot;h-4 w-4 mr-2 text-purple-500&quot; />
                          <span className=&quot;font-medium&quot;>{event.time}</span>
                        </div>
                        <div className=&quot;flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2&quot;>
                          <MapPin className=&quot;h-4 w-4 mr-2 text-red-500&quot; />
                          <span className=&quot;font-medium truncate&quot;>
                            {event.location}
                          </span>
                        </div>
                      </div>

                      {/* Staff Assignment Progress */}
                      <div className=&quot;bg-blue-50 rounded-lg p-3&quot;>
                        <div className=&quot;flex items-center justify-between mb-2&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <Users className=&quot;h-4 w-4 mr-2 text-blue-600&quot; />
                            <span className=&quot;text-sm font-medium text-blue-800&quot;>
                              Staff Assignment
                            </span>
                          </div>
                          <span className=&quot;text-sm font-bold text-blue-800&quot;>
                            {event.staffAssigned}/{event.staffRequired}
                          </span>
                        </div>
                        <div className=&quot;w-full bg-blue-200 rounded-full h-2&quot;>
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              event.status === &quot;fully_staffed&quot;
                                ? &quot;bg-gradient-to-r from-green-500 to-emerald-500&quot;
                                : event.status === &quot;understaffed&quot;
                                  ? &quot;bg-gradient-to-r from-red-500 to-orange-500&quot;
                                  : &quot;bg-gradient-to-r from-yellow-500 to-orange-500&quot;
                            }`}
                            style={{
                              width: `${(event.staffAssigned / event.staffRequired) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Overview & Requests */}
          <div className=&quot;space-y-6&quot;>
            {/* Team Performance Overview */}
            <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20&quot;>
                <div className=&quot;flex justify-between items-center&quot;>
                  <CardTitle className=&quot;flex items-center&quot;>
                    <Users className=&quot;h-5 w-5 mr-2 text-emerald-600&quot; />
                    Team Overview
                  </CardTitle>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                    <ArrowRight className=&quot;h-4 w-4&quot; />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className=&quot;p-6&quot;>
                <div className=&quot;space-y-4&quot;>
                  {teamPerformance.map((member) => (
                    <div
                      key={member.id}
                      className=&quot;flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors&quot;
                    >
                      <div className=&quot;flex items-center space-x-3&quot;>
                        <div className=&quot;w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold&quot;>
                          {member.name
                            .split(&quot; &quot;)
                            .map((n) => n[0])
                            .join("&quot;)}
                        </div>
                        <div>
                          <p className=&quot;font-medium text-gray-900&quot;>
                            {member.name}
                          </p>
                          <div className=&quot;flex items-center space-x-2&quot;>
                            <Badge variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                              {member.eventsThisWeek} events
                            </Badge>
                            <div className=&quot;flex items-center&quot;>
                              <Star className=&quot;h-3 w-3 text-yellow-500 fill-current mr-1&quot; />
                              <span className=&quot;text-xs text-gray-600&quot;>
                                {member.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          member.status === &quot;active&quot;
                            ? &quot;bg-green-100 text-green-800&quot;
                            : member.status === &quot;on_event&quot;
                              ? &quot;bg-blue-100 text-blue-800&quot;
                              : &quot;bg-gray-100 text-gray-800&quot;
                        } text-xs`}
                      >
                        {member.availability}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <AlertCircle className=&quot;h-5 w-5 mr-2 text-orange-600&quot; />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent className=&quot;p-6&quot;>
                <div className=&quot;space-y-3&quot;>
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className=&quot;flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors&quot;
                    >
                      <div className=&quot;flex items-start space-x-3&quot;>
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            request.priority === &quot;high&quot;
                              ? &quot;bg-red-500&quot;
                              : request.priority === &quot;medium&quot;
                                ? &quot;bg-orange-500&quot;
                                : &quot;bg-blue-500&quot;
                          }`}
                        />
                        <div className=&quot;flex-1 min-w-0&quot;>
                          <p className=&quot;text-sm font-medium text-gray-900&quot;>
                            {request.type}
                          </p>
                          <p className=&quot;text-xs text-gray-600&quot;>
                            From: {request.from}
                          </p>
                          <p className=&quot;text-xs text-gray-500&quot;>
                            Date: {request.date}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className=&quot;h-4 w-4 text-gray-400&quot; />
                    </div>
                  ))}
                </div>
                <Button variant=&quot;outline&quot; className=&quot;w-full mt-4&quot;>
                  View All Requests
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions & Analytics */}
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
          <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
            <CardHeader className=&quot;bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20&quot;>
              <CardTitle className=&quot;flex items-center&quot;>
                <Briefcase className=&quot;h-5 w-5 mr-2 text-indigo-600&quot; />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className=&quot;p-6 space-y-3&quot;>
              <Button className=&quot;w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg&quot;>
                <Plus className=&quot;h-4 w-4 mr-2&quot; />
                Create Event
              </Button>
              <Button
                variant=&quot;outline&quot;
                className=&quot;w-full justify-start border-gray-200 hover:border-emerald-500 hover:text-emerald-600&quot;
              >
                <Users className=&quot;h-4 w-4 mr-2&quot; />
                Assign Staff
              </Button>
              <Button
                variant=&quot;outline&quot;
                className=&quot;w-full justify-start border-gray-200 hover:border-purple-500 hover:text-purple-600&quot;
              >
                <Calendar className=&quot;h-4 w-4 mr-2&quot; />
                Schedule Review
              </Button>
              <Button
                variant=&quot;outline&quot;
                className=&quot;w-full justify-start border-gray-200 hover:border-orange-500 hover:text-orange-600&quot;
              >
                <BarChart3 className=&quot;h-4 w-4 mr-2&quot; />
                Performance Reports
              </Button>
            </CardContent>
          </Card>

          <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
            <CardHeader className=&quot;bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20&quot;>
              <CardTitle className=&quot;flex items-center&quot;>
                <BarChart3 className=&quot;h-5 w-5 mr-2 text-purple-600&quot; />
                Team Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;space-y-4&quot;>
                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm font-medium&quot;>Team Utilization</span>
                  <span className=&quot;text-xl font-bold text-blue-600&quot;>87%</span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div
                    className=&quot;bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full&quot;
                    style={{ width: &quot;87%&quot; }}
                  ></div>
                </div>

                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm font-medium&quot;>Average Rating</span>
                  <div className=&quot;flex items-center&quot;>
                    <Star className=&quot;h-4 w-4 text-yellow-500 fill-current mr-1&quot; />
                    <span className=&quot;text-xl font-bold&quot;>4.7</span>
                  </div>
                </div>

                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm font-medium&quot;>
                    Event Success Rate
                  </span>
                  <span className=&quot;text-xl font-bold text-green-600&quot;>96%</span>
                </div>

                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm font-medium&quot;>Response Time</span>
                  <span className=&quot;text-xl font-bold text-purple-600&quot;>
                    {&quot;< 2hrs"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
