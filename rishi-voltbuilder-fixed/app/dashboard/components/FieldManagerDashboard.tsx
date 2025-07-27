"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";



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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Stunning Header with Gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-teal-600 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Field Manager Dashboard
                </h1>
                <p className="text-purple-100 text-lg">
                  Coordinate teams and optimize operational excellence
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Assign Staff
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Bell className="h-5 w-5 mr-2" />
                  Requests (3)
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
        </div>

        {/* Performance Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 font-medium">
                    Team Performance
                  </p>
                  <p className="text-3xl font-bold">94%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-medium">Active Events</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <Activity className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 font-medium">Team Size</p>
                  <p className="text-3xl font-bold">24</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 font-medium">Avg Rating</p>
                  <p className="text-3xl font-bold">4.7</p>
                </div>
                <Star className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events Management */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Event Management
                    </CardTitle>
                    <CardDescription>
                      Monitor staffing and event readiness
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex items-center mt-1 space-x-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {event.client}
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={`${
                            event.status === "fully_staffed"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : event.status === "understaffed"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          } px-3 py-1`}
                        >
                          {event.status === "fully_staffed"
                            ? "FULLY STAFFED"
                            : event.status === "understaffed"
                              ? "UNDERSTAFFED"
                              : "PENDING"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">{event.date}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <Clock className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <MapPin className="h-4 w-4 mr-2 text-red-500" />
                          <span className="font-medium truncate">
                            {event.location}
                          </span>
                        </div>
                      </div>

                      {/* Staff Assignment Progress */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Staff Assignment
                            </span>
                          </div>
                          <span className="text-sm font-bold text-blue-800">
                            {event.staffAssigned}/{event.staffRequired}
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              event.status === "fully_staffed"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : event.status === "understaffed"
                                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                                  : "bg-gradient-to-r from-yellow-500 to-orange-500"
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
          <div className="space-y-6">
            {/* Team Performance Overview */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-emerald-600" />
                    Team Overview
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {teamPerformance.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {member.eventsThisWeek} events
                            </Badge>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                              <span className="text-xs text-gray-600">
                                {member.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : member.status === "on_event"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
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
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            request.priority === "high"
                              ? "bg-red-500"
                              : request.priority === "medium"
                                ? "bg-orange-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {request.type}
                          </p>
                          <p className="text-xs text-gray-600">
                            From: {request.from}
                          </p>
                          <p className="text-xs text-gray-500">
                            Date: {request.date}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Requests
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions & Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
              >
                <Users className="h-4 w-4 mr-2" />
                Assign Staff
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-200 hover:border-purple-500 hover:text-purple-600"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-200 hover:border-orange-500 hover:text-orange-600"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Performance Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Team Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Team Utilization</span>
                  <span className="text-xl font-bold text-blue-600">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: "87%" }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-xl font-bold">4.7</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Event Success Rate
                  </span>
                  <span className="text-xl font-bold text-green-600">96%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-xl font-bold text-purple-600">
                    {"< 2hrs"}
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
