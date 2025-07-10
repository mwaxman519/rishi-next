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
  CreditCard,
  FileText,
  Zap,
} from "lucide-react";
import Link from "next/link";

const upcomingEvents = [
  {
    id: "n4o5p6q7-r8s9-0123-nopq-456789012345",
    title: "Product Launch Campaign",
    date: "2025-06-20",
    time: "10:00 AM - 6:00 PM",
    location: "Downtown Mall, Floor 2",
    status: "confirmed",
    staffAssigned: 4,
    staffRequired: 5,
    budget: "$15,000",
    category: "Product Launch",
  },
  {
    id: "o5p6q7r8-s9t0-1234-opqr-567890123456",
    title: "Summer Brand Activation",
    date: "2025-06-22",
    time: "12:00 PM - 8:00 PM",
    location: "Central Plaza",
    status: "pending_approval",
    staffAssigned: 2,
    staffRequired: 6,
    budget: "$22,000",
    category: "Brand Activation",
  },
  {
    id: "p6q7r8s9-t0u1-2345-pqrs-678901234567",
    title: "Corporate Trade Show",
    date: "2025-06-25",
    time: "9:00 AM - 5:00 PM",
    location: "Convention Center Hall A",
    status: "in_planning",
    staffAssigned: 0,
    staffRequired: 8,
    budget: "$35,000",
    category: "Trade Show",
  },
];

const recentBookings = [
  {
    id: "q7r8s9t0-u1v2-3456-qrst-789012345678",
    eventName: "Tech Workshop Series",
    date: "2025-06-15",
    status: "completed",
    staffCount: 3,
    feedback: "Excellent performance",
    rating: 4.9,
  },
  {
    id: "r8s9t0u1-v2w3-4567-rstu-890123456789",
    eventName: "Retail Pop-up Experience",
    date: "2025-06-18",
    status: "completed",
    staffCount: 4,
    feedback: "Great customer engagement",
    rating: 4.7,
  },
  {
    id: "s9t0u1v2-w3x4-5678-stuv-901234567890",
    eventName: "Product Demo Day",
    date: "2025-06-12",
    status: "completed",
    staffCount: 2,
    feedback: "Professional presentation",
    rating: 4.8,
  },
];

const teamMembers = [
  {
    id: "t0u1v2w3-x4y5-6789-tuvw-012345678901",
    name: "Sarah Johnson",
    role: "Lead Brand Agent",
    status: "available",
    rating: 4.8,
    eventsCompleted: 24,
    specialties: ["Product Demo", "Customer Engagement"],
  },
  {
    id: "u1v2w3x4-y5z6-7890-uvwx-123456789012",
    name: "Michael Chen",
    role: "Brand Agent",
    status: "on_event",
    rating: 4.6,
    eventsCompleted: 18,
    specialties: ["Tech Products", "B2B Sales"],
  },
  {
    id: "v2w3x4y5-z6a7-8901-vwxy-234567890123",
    name: "Emily Rodriguez",
    role: "Brand Agent",
    status: "available",
    rating: 4.9,
    eventsCompleted: 31,
    specialties: ["Retail Experience", "Training"],
  },
];

const pendingRequests = [
  {
    id: "w3x4y5z6-a7b8-9012-wxyz-345678901234",
    type: "Event Booking",
    title: "Holiday Campaign Launch",
    requestDate: "2025-06-16",
    eventDate: "2025-07-15",
    status: "pending_approval",
    priority: "high",
  },
  {
    id: "x4y5z6a7-b8c9-0123-xyza-456789012345",
    type: "Staff Request",
    title: "Additional Team Members",
    requestDate: "2025-06-15",
    eventDate: "2025-06-22",
    status: "under_review",
    priority: "medium",
  },
];

export default function ClientUserDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Stunning Header with Gradient */}
        <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-4xl font-bold mb-2">Client Dashboard</h1>
                <p className="text-green-100 text-lg">
                  Manage your events and workforce with confidence
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-green-50 shadow-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Book Event
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-300/20 rounded-full blur-2xl"></div>
        </div>

        {/* Performance Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-medium">Total Spend</p>
                  <p className="text-3xl font-bold">$84,500</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-200" />
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
                  <p className="text-3xl font-bold">18</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 font-medium">
                    Satisfaction Rate
                  </p>
                  <p className="text-3xl font-bold">96%</p>
                </div>
                <Star className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 font-medium">ROI</p>
                  <p className="text-3xl font-bold">285%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
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
                      Your planned marketing activations
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
                            <Badge variant="outline" className="text-xs">
                              {event.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          className={`${
                            event.status === "confirmed"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : event.status === "pending_approval"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                          } px-3 py-1`}
                        >
                          {event.status === "confirmed"
                            ? "CONFIRMED"
                            : event.status === "pending_approval"
                              ? "PENDING"
                              : "PLANNING"}
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

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-gray-600">Budget: </span>
                            <span className="font-semibold text-green-600">
                              {event.budget}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Staff: </span>
                            <span className="font-semibold">
                              {event.staffAssigned}/{event.staffRequired}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Requests */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-emerald-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Book New Event
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Request Staff
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:border-purple-500 hover:text-purple-600"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:border-orange-500 hover:text-orange-600"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Reports
                </Button>
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
                            {request.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {request.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            Requested: {request.requestDate}
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

        {/* Recent Activity & Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                Recent Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {booking.eventName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.date} • {booking.staffCount} staff
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                          <span className="text-xs text-gray-600">
                            {booking.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {booking.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Event History
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Your Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {teamMembers.map((member) => (
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
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {member.eventsCompleted} events
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
                        member.status === "available"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      } text-xs`}
                    >
                      {member.status === "available" ? "Available" : "Working"}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <ArrowRight className="h-4 w-4 mr-2" />
                Manage Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
