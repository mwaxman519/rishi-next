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
  ClipboardCheck,
  Clock,
  MapPin,
  Image as ImageIcon,
  FileBarChart,
  Calendar as CalendarIcon,
  CheckCircle,
  TrendingUp,
  Star,
  Activity,
  Users,
  Target,
  Award,
  Briefcase,
  DollarSign,
  BarChart3,
  Plus,
  ArrowRight,
  Bell,
  MessageSquare,
  Phone,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { useState, useEffect } from &quot;react&quot;;


export default function BrandAgentDashboard() {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's assigned bookings/events
        const eventsResponse = await fetch('/api/bookings?assignedToMe=true');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.data || []);
        }

        // Fetch user's tasks
        const tasksResponse = await fetch('/api/tasks?assignedToMe=true');
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.data || []);
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
      <div className=&quot;min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center&quot;>
        <div className=&quot;text-center&quot;>
          <div className=&quot;animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4&quot;></div>
          <p className=&quot;text-gray-600&quot;>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50&quot;>
      <div className=&quot;container mx-auto p-6 space-y-8&quot;>
        {/* Stunning Header with Gradient */}
        <div className=&quot;relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white overflow-hidden&quot;>
          <div className=&quot;absolute inset-0 bg-black/10 backdrop-blur-sm&quot;></div>
          <div className=&quot;relative z-10&quot;>
            <div className=&quot;flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0&quot;>
              <div>
                <h1 className=&quot;text-4xl font-bold mb-2&quot;>
                  Welcome Back, Sarah!
                </h1>
                <p className=&quot;text-emerald-100 text-lg&quot;>
                  Ready to make today's events exceptional
                </p>
              </div>
              <div className=&quot;flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3&quot;>
                <Button
                  size=&quot;lg&quot;
                  className=&quot;bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl&quot;
                >
                  <Plus className=&quot;h-5 w-5 mr-2&quot; />
                  Quick Check-In
                </Button>
                <Button
                  variant=&quot;outline&quot;
                  size=&quot;lg&quot;
                  className=&quot;border-white text-white hover:bg-white/10&quot;
                >
                  <Bell className=&quot;h-5 w-5 mr-2&quot; />
                  Notifications
                </Button>
              </div>
            </div>
          </div>
          <div className=&quot;absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl&quot;></div>
          <div className=&quot;absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl&quot;></div>
        </div>

        {/* Performance Metrics Dashboard */}
        <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-6&quot;>
          <Card className=&quot;bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-blue-100 font-medium&quot;>This Month</p>
                  <p className=&quot;text-3xl font-bold&quot;>$2,840</p>
                </div>
                <DollarSign className=&quot;h-8 w-8 text-blue-200&quot; />
              </div>
            </CardContent>
          </Card>

          <Card className=&quot;bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-emerald-100 font-medium&quot;>
                    Events Completed
                  </p>
                  <p className=&quot;text-3xl font-bold&quot;>24</p>
                </div>
                <CheckCircle className=&quot;h-8 w-8 text-emerald-200&quot; />
              </div>
            </CardContent>
          </Card>

          <Card className=&quot;bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-purple-100 font-medium&quot;>Avg Rating</p>
                  <p className=&quot;text-3xl font-bold&quot;>4.8</p>
                </div>
                <Star className=&quot;h-8 w-8 text-purple-200&quot; />
              </div>
            </CardContent>
          </Card>

          <Card className=&quot;bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-orange-100 font-medium&quot;>On-Time Rate</p>
                  <p className=&quot;text-3xl font-bold&quot;>98%</p>
                </div>
                <Target className=&quot;h-8 w-8 text-orange-200&quot; />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-8&quot;>
          {/* Upcoming Events */}
          <div className=&quot;lg:col-span-2&quot;>
            <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20&quot;>
                <div className=&quot;flex justify-between items-center&quot;>
                  <div>
                    <CardTitle className=&quot;flex items-center&quot;>
                      <Calendar className=&quot;h-5 w-5 mr-2 text-blue-600&quot; />
                      Upcoming Events
                    </CardTitle>
                    <CardDescription>
                      Your confirmed and pending assignments
                    </CardDescription>
                  </div>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                    <ArrowRight className=&quot;h-4 w-4 mr-2&quot; />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className=&quot;p-6&quot;>
                <div className=&quot;space-y-4&quot;>
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className=&quot;group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100 rounded-xl p-4&quot;
                    >
                      <div className=&quot;flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0&quot;>
                        <div className=&quot;flex-1&quot;>
                          <h3 className=&quot;font-semibold text-gray-900 group-hover:text-blue-600 transition-colors&quot;>
                            {event.title}
                          </h3>
                          <div className=&quot;flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2&quot;>
                            <div className=&quot;flex items-center text-sm text-gray-600&quot;>
                              <Calendar className=&quot;h-4 w-4 mr-1 text-blue-500&quot; />
                              {event.date}
                            </div>
                            <div className=&quot;flex items-center text-sm text-gray-600&quot;>
                              <Clock className=&quot;h-4 w-4 mr-1 text-purple-500&quot; />
                              {event.time}
                            </div>
                            <div className=&quot;flex items-center text-sm text-gray-600&quot;>
                              <MapPin className=&quot;h-4 w-4 mr-1 text-red-500&quot; />
                              {event.location}
                            </div>
                          </div>
                        </div>
                        <div className=&quot;flex items-center space-x-3&quot;>
                          <Badge
                            className={`${
                              event.status === &quot;confirmed&quot;
                                ? &quot;bg-green-100 text-green-800 border-green-200&quot;
                                : &quot;bg-yellow-100 text-yellow-800 border-yellow-200&quot;
                            } px-3 py-1`}
                          >
                            {event.status.toUpperCase()}
                          </Badge>
                          <div className=&quot;text-right&quot;>
                            <p className=&quot;text-lg font-bold text-green-600&quot;>
                              {event.pay}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Tasks */}
          <div className=&quot;space-y-6&quot;>
            {/* Quick Actions */}
            <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Activity className=&quot;h-5 w-5 mr-2 text-emerald-600&quot; />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className=&quot;p-6 space-y-3&quot;>
                <Button className=&quot;w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg&quot;>
                  <Clock className=&quot;h-4 w-4 mr-2&quot; />
                  Clock In/Out
                </Button>
                <Button
                  variant=&quot;outline&quot;
                  className=&quot;w-full justify-start border-gray-200 hover:border-emerald-500 hover:text-emerald-600&quot;
                >
                  <ImageIcon className=&quot;h-4 w-4 mr-2&quot; />
                  Submit Event Photos
                </Button>
                <Button
                  variant=&quot;outline&quot;
                  className=&quot;w-full justify-start border-gray-200 hover:border-purple-500 hover:text-purple-600&quot;
                >
                  <FileBarChart className=&quot;h-4 w-4 mr-2&quot; />
                  Submit Report
                </Button>
                <Button
                  variant=&quot;outline&quot;
                  className=&quot;w-full justify-start border-gray-200 hover:border-orange-500 hover:text-orange-600&quot;
                >
                  <CalendarIcon className=&quot;h-4 w-4 mr-2&quot; />
                  Update Availability
                </Button>
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
              <CardHeader className=&quot;bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <ClipboardCheck className=&quot;h-5 w-5 mr-2 text-purple-600&quot; />
                  Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className=&quot;p-6&quot;>
                <div className=&quot;space-y-3&quot;>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className=&quot;flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors&quot;
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          task.completed
                            ? &quot;bg-green-500&quot;
                            : task.priority === &quot;urgent&quot;
                              ? &quot;bg-red-500&quot;
                              : task.priority === &quot;high&quot;
                                ? &quot;bg-orange-500&quot;
                                : &quot;bg-blue-500&quot;
                        }`}
                      />
                      <div className=&quot;flex-1 min-w-0&quot;>
                        <p
                          className={`text-sm font-medium ${task.completed ? &quot;line-through text-gray-500&quot; : &quot;text-gray-900&quot;}`}
                        >
                          {task.title}
                        </p>
                        <div className=&quot;flex items-center space-x-2 mt-1&quot;>
                          <Badge variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                            {task.type}
                          </Badge>
                          <span className=&quot;text-xs text-gray-500&quot;>
                            Due: {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Performance & Communication */}
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
          <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
            <CardHeader className=&quot;bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20&quot;>
              <CardTitle className=&quot;flex items-center&quot;>
                <BarChart3 className=&quot;h-5 w-5 mr-2 text-indigo-600&quot; />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;space-y-4&quot;>
                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm font-medium&quot;>
                    Event Completion Rate
                  </span>
                  <span className=&quot;text-xl font-bold text-green-600&quot;>98%</span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div
                    className=&quot;bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full&quot;
                    style={{ width: &quot;98%&quot; }}
                  ></div>
                </div>

                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm font-medium&quot;>
                    Customer Satisfaction
                  </span>
                  <div className=&quot;flex items-center&quot;>
                    <Star className=&quot;h-4 w-4 text-yellow-500 fill-current mr-1&quot; />
                    <span className=&quot;text-xl font-bold&quot;>4.8</span>
                  </div>
                </div>

                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm font-medium&quot;>On-Time Arrival</span>
                  <span className=&quot;text-xl font-bold text-blue-600&quot;>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
            <CardHeader className=&quot;bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20&quot;>
              <CardTitle className=&quot;flex items-center&quot;>
                <MessageSquare className=&quot;h-5 w-5 mr-2 text-rose-600&quot; />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;space-y-4&quot;>
                <div className=&quot;flex items-start space-x-3&quot;>
                  <div className=&quot;w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center&quot;>
                    <Users className=&quot;h-4 w-4 text-blue-600&quot; />
                  </div>
                  <div className=&quot;flex-1&quot;>
                    <p className=&quot;text-sm font-medium&quot;>Field Manager</p>
                    <p className=&quot;text-sm text-gray-600&quot;>
                      Great job on the Tech Hub event! Client was very
                      impressed.
                    </p>
                    <p className=&quot;text-xs text-gray-500 mt-1&quot;>2 hours ago</p>
                  </div>
                </div>

                <div className=&quot;flex items-start space-x-3&quot;>
                  <div className=&quot;w-8 h-8 bg-green-100 rounded-full flex items-center justify-center&quot;>
                    <Briefcase className=&quot;h-4 w-4 text-green-600&quot; />
                  </div>
                  <div className=&quot;flex-1&quot;>
                    <p className=&quot;text-sm font-medium&quot;>Event Coordinator</p>
                    <p className=&quot;text-sm text-gray-600&quot;>
                      Tomorrow's event location has been updated. Check details.
                    </p>
                    <p className=&quot;text-xs text-gray-500 mt-1&quot;>5 hours ago</p>
                  </div>
                </div>

                <Button variant=&quot;outline&quot; className=&quot;w-full&quot;>
                  <MessageSquare className=&quot;h-4 w-4 mr-2&quot; />
                  View All Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
