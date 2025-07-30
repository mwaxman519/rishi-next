&quot;use client&quot;;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from &quot;../../components/ui/card&quot;;
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
  CreditCard,
  FileText,
  Zap,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { useState, useEffect } from &quot;react&quot;;

// Production implementation - all data fetched from real APIs

export default function ClientUserDashboard() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch upcoming events
        const eventsResponse = await fetch('/api/bookings?status=upcoming&limit=10');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setUpcomingEvents(eventsData.data || []);
        }

        // Fetch recent bookings
        const bookingsResponse = await fetch('/api/bookings?limit=5&sortBy=createdAt&order=desc');
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setRecentBookings(bookingsData.data || []);
        }

        // Fetch team members
        const teamResponse = await fetch('/api/users?role=brand_agent&organizationId=current');
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamMembers(teamData.data || []);
        }

        // Fetch pending requests
        const requestsResponse = await fetch('/api/requests?status=pending&limit=5');
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
      <div className=&quot;min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center&quot;>
        <div className=&quot;text-center&quot;>
          <div className=&quot;animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4&quot;></div>
          <p className=&quot;text-gray-600&quot;>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50&quot;>
      <div className=&quot;container mx-auto p-6 space-y-8&quot;>
        {/* Header */}
        <div className=&quot;relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white overflow-hidden&quot;>
          <div className=&quot;absolute inset-0 bg-black/10 backdrop-blur-sm&quot;></div>
          <div className=&quot;relative z-10&quot;>
            <div className=&quot;flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0&quot;>
              <div>
                <h1 className=&quot;text-4xl font-bold mb-2&quot;>Client Dashboard</h1>
                <p className=&quot;text-blue-100 text-lg&quot;>Manage your events and team performance</p>
              </div>
              <div className=&quot;flex flex-wrap gap-3&quot;>
                <Button variant=&quot;outline&quot; size=&quot;lg&quot; className=&quot;border-white text-white hover:bg-white/10&quot;>
                  <Plus className=&quot;h-5 w-5 mr-2&quot; />
                  Request Event
                </Button>
                <Button variant=&quot;outline&quot; size=&quot;lg&quot; className=&quot;border-white text-white hover:bg-white/10&quot;>
                  <Bell className=&quot;h-5 w-5 mr-2&quot; />
                  Notifications
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-6&quot;>
          <Card className=&quot;bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-emerald-100 font-medium&quot;>Total Events</p>
                  <p className=&quot;text-3xl font-bold&quot;>{upcomingEvents.length}</p>
                </div>
                <Calendar className=&quot;h-8 w-8 text-emerald-200&quot; />
              </div>
            </CardContent>
          </Card>

          <Card className=&quot;bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-blue-100 font-medium&quot;>Team Members</p>
                  <p className=&quot;text-3xl font-bold&quot;>{teamMembers.length}</p>
                </div>
                <Users className=&quot;h-8 w-8 text-blue-200&quot; />
              </div>
            </CardContent>
          </Card>

          <Card className=&quot;bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-purple-100 font-medium&quot;>Completed</p>
                  <p className=&quot;text-3xl font-bold&quot;>{recentBookings.length}</p>
                </div>
                <CheckCircle className=&quot;h-8 w-8 text-purple-200&quot; />
              </div>
            </CardContent>
          </Card>

          <Card className=&quot;bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-xl&quot;>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-orange-100 font-medium&quot;>Pending</p>
                  <p className=&quot;text-3xl font-bold&quot;>{pendingRequests.length}</p>
                </div>
                <AlertCircle className=&quot;h-8 w-8 text-orange-200&quot; />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-8&quot;>
          {/* Upcoming Events */}
          <div className=&quot;lg:col-span-2&quot;>
            <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
              <CardHeader>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Calendar className=&quot;h-5 w-5 mr-2 text-blue-600&quot; />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className=&quot;p-4 bg-gray-50 rounded-lg&quot;>
                      <h3 className=&quot;font-semibold text-gray-900&quot;>{event.title}</h3>
                      <p className=&quot;text-sm text-gray-600&quot;>{event.date} • {event.location}</p>
                      <Badge variant=&quot;outline&quot; className=&quot;mt-2&quot;>
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <p className=&quot;text-gray-500 text-center py-8&quot;>No upcoming events</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <div>
            <Card className=&quot;shadow-xl border-0 bg-white/80 backdrop-blur-sm&quot;>
              <CardHeader>
                <CardTitle className=&quot;flex items-center&quot;>
                  <CheckCircle className=&quot;h-5 w-5 mr-2 text-green-600&quot; />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-3&quot;>
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className=&quot;p-3 bg-gray-50 rounded-lg&quot;>
                      <p className=&quot;font-medium text-gray-900&quot;>{booking.eventName}</p>
                      <p className=&quot;text-sm text-gray-600&quot;>{booking.date}</p>
                      <Badge variant=&quot;outline&quot; className=&quot;mt-1&quot;>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                  {recentBookings.length === 0 && (
                    <p className=&quot;text-gray-500 text-center py-8&quot;>No recent bookings</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}