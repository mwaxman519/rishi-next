"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
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
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

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
        const eventsResponse = await apiFetch('/api/bookings?status=upcoming&limit=10');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setUpcomingEvents(eventsData.data || []);
        }

        // Fetch recent bookings
        const bookingsResponse = await apiFetch('/api/bookings?limit=5&sortBy=createdAt&order=desc');
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setRecentBookings(bookingsData.data || []);
        }

        // Fetch team members
        const teamResponse = await apiFetch('/api/users?role=brand_agent&organizationId=current');
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamMembers(teamData.data || []);
        }

        // Fetch pending requests
        const requestsResponse = await apiFetch('/api/requests?status=pending&limit=5');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-4xl font-bold mb-2">Client Dashboard</h1>
                <p className="text-blue-100 text-lg">Manage your events and team performance</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Plus className="h-5 w-5 mr-2" />
                  Request Event
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 font-medium">Total Events</p>
                  <p className="text-3xl font-bold">{upcomingEvents.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-medium">Team Members</p>
                  <p className="text-3xl font-bold">{teamMembers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 font-medium">Completed</p>
                  <p className="text-3xl font-bold">{recentBookings.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 font-medium">Pending</p>
                  <p className="text-3xl font-bold">{pendingRequests.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.date} • {event.location}</p>
                      <Badge variant="outline" className="mt-2">
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No upcoming events</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <div>
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{booking.eventName}</p>
                      <p className="text-sm text-gray-600">{booking.date}</p>
                      <Badge variant="outline" className="mt-1">
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                  {recentBookings.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No recent bookings</p>
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