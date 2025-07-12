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
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";


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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Stunning Header with Gradient */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome Back, Sarah!
                </h1>
                <p className="text-emerald-100 text-lg">
                  Ready to make today's events exceptional
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Quick Check-In
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl"></div>
        </div>

        {/* Performance Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-medium">This Month</p>
                  <p className="text-3xl font-bold">$2,840</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 font-medium">
                    Events Completed
                  </p>
                  <p className="text-3xl font-bold">24</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 font-medium">Avg Rating</p>
                  <p className="text-3xl font-bold">4.8</p>
                </div>
                <Star className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 font-medium">On-Time Rate</p>
                  <p className="text-3xl font-bold">98%</p>
                </div>
                <Target className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Upcoming Events
                    </CardTitle>
                    <CardDescription>
                      Your confirmed and pending assignments
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100 rounded-xl p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                              {event.date}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1 text-purple-500" />
                              {event.time}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-1 text-red-500" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            className={`${
                              event.status === "confirmed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            } px-3 py-1`}
                          >
                            {event.status.toUpperCase()}
                          </Badge>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
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
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-emerald-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                  <Clock className="h-4 w-4 mr-2" />
                  Clock In/Out
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Submit Event Photos
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:border-purple-500 hover:text-purple-600"
                >
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:border-orange-500 hover:text-orange-600"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Update Availability
                </Button>
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardTitle className="flex items-center">
                  <ClipboardCheck className="h-5 w-5 mr-2 text-purple-600" />
                  Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          task.completed
                            ? "bg-green-500"
                            : task.priority === "urgent"
                              ? "bg-red-500"
                              : task.priority === "high"
                                ? "bg-orange-500"
                                : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {task.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Event Completion Rate
                  </span>
                  <span className="text-xl font-bold text-green-600">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: "98%" }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Customer Satisfaction
                  </span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-xl font-bold">4.8</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">On-Time Arrival</span>
                  <span className="text-xl font-bold text-blue-600">100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-rose-600" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Field Manager</p>
                    <p className="text-sm text-gray-600">
                      Great job on the Tech Hub event! Client was very
                      impressed.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Event Coordinator</p>
                    <p className="text-sm text-gray-600">
                      Tomorrow's event location has been updated. Check details.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
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
