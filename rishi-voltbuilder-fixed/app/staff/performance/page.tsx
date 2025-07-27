"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Star, 
  Clock, 
  MapPin, 
  FileText, 
  Users, 
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  Eye,
  Calendar,
  Building,
  User,
  ClipboardList
} from "lucide-react";

interface BrandAgentPerformance {
  id: string;
  name: string;
  avatar: string;
  role: string;
  overallScore: number;
  metrics: {
    managerReview: number;
    onTimeRate: number;
    onLocationRate: number;
    dispensaryRating: number;
    staffRating: number;
    activityCompletion: number;
    dataFormCompletion: number;
    dataFormQuality: number;
  };
  recentBookings: number;
  totalBookings: number;
  joinDate: string;
  status: "active" | "inactive" | "on_leave";
  compositeRecords: {
    managerReviews: Array<{
      id: string;
      date: string;
      reviewer: string;
      rating: number;
      comments: string;
      bookingRef: string;
    }>;
    attendanceRecords: Array<{
      id: string;
      bookingDate: string;
      scheduledTime: string;
      actualArrival: string;
      location: string;
      status: "on_time" | "late" | "absent";
      minutesLate?: number;
    }>;
    locationRecords: Array<{
      id: string;
      bookingDate: string;
      expectedLocation: string;
      actualLocation: string;
      checkInTime: string;
      status: "correct" | "incorrect" | "missing";
      gpsCoordinates?: string;
    }>;
    dispensaryFeedback: Array<{
      id: string;
      dispensaryName: string;
      date: string;
      rating: number;
      feedback: string;
      bookingRef: string;
    }>;
    staffFeedback: Array<{
      id: string;
      staffName: string;
      role: string;
      date: string;
      rating: number;
      feedback: string;
      bookingRef: string;
    }>;
    activityRecords: Array<{
      id: string;
      activityName: string;
      dueDate: string;
      completedDate?: string;
      status: "completed" | "pending" | "overdue";
      bookingRef: string;
    }>;
    formRecords: Array<{
      id: string;
      formType: string;
      submittedDate: string;
      completionRate: number;
      qualityRating: number;
      reviewer: string;
      bookingRef: string;
    }>;
  };
}

export default function BrandAgentPerformance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sortBy, setSortBy] = useState("overallScore");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState<BrandAgentPerformance | null>(null);

  const brandAgents: BrandAgentPerformance[] = [
    {
      id: "1",
      name: "Sarah Chen",
      avatar: "/api/placeholder/40/40",
      role: "Senior Brand Agent",
      overallScore: 94,
      metrics: {
        managerReview: 4.8,
        onTimeRate: 98,
        onLocationRate: 96,
        dispensaryRating: 4.6,
        staffRating: 4.5,
        activityCompletion: 95,
        dataFormCompletion: 100,
        dataFormQuality: 4.7
      },
      recentBookings: 12,
      totalBookings: 156,
      joinDate: "2023-03-15",
      status: "active",
      compositeRecords: {
        managerReviews: [
          {
            id: "1",
            date: "2025-01-15",
            reviewer: "John Smith",
            rating: 5,
            comments: "Excellent performance at Green Valley Dispensary",
            bookingRef: "BK-2025-001"
          },
          {
            id: "2", 
            date: "2025-01-10",
            reviewer: "Mary Johnson",
            rating: 4.5,
            comments: "Great customer engagement, minor improvement on product knowledge",
            bookingRef: "BK-2025-002"
          }
        ],
        attendanceRecords: [
          {
            id: "1",
            bookingDate: "2025-01-15",
            scheduledTime: "09:00",
            actualArrival: "08:55",
            location: "Green Valley Dispensary",
            status: "on_time"
          },
          {
            id: "2",
            bookingDate: "2025-01-12",
            scheduledTime: "10:00", 
            actualArrival: "10:15",
            location: "Cannabis Corner",
            status: "late",
            minutesLate: 15
          }
        ],
        locationRecords: [
          {
            id: "1",
            bookingDate: "2025-01-15",
            expectedLocation: "Green Valley Dispensary",
            actualLocation: "Green Valley Dispensary",
            checkInTime: "08:55",
            status: "correct",
            gpsCoordinates: "40.7128,-74.0060"
          }
        ],
        dispensaryFeedback: [
          {
            id: "1",
            dispensaryName: "Green Valley Dispensary",
            date: "2025-01-15",
            rating: 5,
            feedback: "Outstanding brand representative, customers loved the product demos",
            bookingRef: "BK-2025-001"
          }
        ],
        staffFeedback: [
          {
            id: "1",
            staffName: "Amanda Wilson",
            role: "Budtender",
            date: "2025-01-15",
            rating: 4.5,
            feedback: "Professional and knowledgeable, worked well with our team",
            bookingRef: "BK-2025-001"
          }
        ],
        activityRecords: [
          {
            id: "1",
            activityName: "Product Demo Setup",
            dueDate: "2025-01-15",
            completedDate: "2025-01-15",
            status: "completed",
            bookingRef: "BK-2025-001"
          }
        ],
        formRecords: [
          {
            id: "1",
            formType: "Post-Event Report",
            submittedDate: "2025-01-15",
            completionRate: 100,
            qualityRating: 4.8,
            reviewer: "John Smith",
            bookingRef: "BK-2025-001"
          }
        ]
      }
    },
    {
      id: "2",
      name: "Mike Rodriguez",
      avatar: "/api/placeholder/40/40",
      role: "Brand Agent",
      overallScore: 89,
      metrics: {
        managerReview: 4.5,
        onTimeRate: 92,
        onLocationRate: 94,
        dispensaryRating: 4.3,
        staffRating: 4.4,
        activityCompletion: 88,
        dataFormCompletion: 95,
        dataFormQuality: 4.2
      },
      recentBookings: 8,
      totalBookings: 89,
      joinDate: "2023-07-20",
      status: "active",
      compositeRecords: {
        managerReviews: [
          {
            id: "1",
            date: "2025-01-14",
            reviewer: "Sarah Davis",
            rating: 4.5,
            comments: "Solid performance, good customer interaction",
            bookingRef: "BK-2025-003"
          }
        ],
        attendanceRecords: [
          {
            id: "1",
            bookingDate: "2025-01-14",
            scheduledTime: "11:00",
            actualArrival: "11:30",
            location: "Herb Haven",
            status: "late",
            minutesLate: 30
          }
        ],
        locationRecords: [
          {
            id: "1",
            bookingDate: "2025-01-14",
            expectedLocation: "Herb Haven",
            actualLocation: "Herb Haven",
            checkInTime: "11:30",
            status: "correct"
          }
        ],
        dispensaryFeedback: [
          {
            id: "1",
            dispensaryName: "Herb Haven",
            date: "2025-01-14",
            rating: 4.0,
            feedback: "Good product knowledge, arrived late but made up for it",
            bookingRef: "BK-2025-003"
          }
        ],
        staffFeedback: [
          {
            id: "1",
            staffName: "Mike Torres",
            role: "Store Manager",
            date: "2025-01-14",
            rating: 4.2,
            feedback: "Professional attitude, customers responded well",
            bookingRef: "BK-2025-003"
          }
        ],
        activityRecords: [
          {
            id: "1",
            activityName: "Customer Education Session",
            dueDate: "2025-01-14",
            completedDate: "2025-01-14",
            status: "completed",
            bookingRef: "BK-2025-003"
          }
        ],
        formRecords: [
          {
            id: "1",
            formType: "Activity Summary",
            submittedDate: "2025-01-14",
            completionRate: 95,
            qualityRating: 4.0,
            reviewer: "Sarah Davis",
            bookingRef: "BK-2025-003"
          }
        ]
      }
    },
    {
      id: "3",
      name: "Jennifer Kim",
      avatar: "/api/placeholder/40/40",
      role: "Brand Agent",
      overallScore: 87,
      metrics: {
        managerReview: 4.6,
        onTimeRate: 95,
        onLocationRate: 89,
        dispensaryRating: 4.1,
        staffRating: 4.3,
        activityCompletion: 92,
        dataFormCompletion: 88,
        dataFormQuality: 4.4
      },
      recentBookings: 10,
      totalBookings: 67,
      joinDate: "2023-09-10",
      status: "active",
      compositeRecords: {
        managerReviews: [],
        attendanceRecords: [],
        locationRecords: [],
        dispensaryFeedback: [],
        staffFeedback: [],
        activityRecords: [],
        formRecords: []
      }
    },
    {
      id: "4",
      name: "David Park",
      avatar: "/api/placeholder/40/40",
      role: "Brand Agent",
      overallScore: 82,
      metrics: {
        managerReview: 4.2,
        onTimeRate: 88,
        onLocationRate: 85,
        dispensaryRating: 4.0,
        staffRating: 4.1,
        activityCompletion: 85,
        dataFormCompletion: 78,
        dataFormQuality: 3.9
      },
      recentBookings: 6,
      totalBookings: 45,
      joinDate: "2023-11-05",
      status: "active",
      compositeRecords: {
        managerReviews: [],
        attendanceRecords: [],
        locationRecords: [],
        dispensaryFeedback: [],
        staffFeedback: [],
        activityRecords: [],
        formRecords: []
      }
    },
    {
      id: "5",
      name: "Lisa Wang",
      avatar: "/api/placeholder/40/40",
      role: "Brand Agent",
      overallScore: 76,
      metrics: {
        managerReview: 3.8,
        onTimeRate: 82,
        onLocationRate: 78,
        dispensaryRating: 3.7,
        staffRating: 3.9,
        activityCompletion: 75,
        dataFormCompletion: 72,
        dataFormQuality: 3.6
      },
      recentBookings: 4,
      totalBookings: 23,
      joinDate: "2024-01-12",
      status: "active",
      compositeRecords: {
        managerReviews: [],
        attendanceRecords: [],
        locationRecords: [],
        dispensaryFeedback: [],
        staffFeedback: [],
        activityRecords: [],
        formRecords: []
      }
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-yellow-100 text-yellow-800";
    if (score >= 70) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const filteredAndSortedAgents = brandAgents
    .filter(agent => {
      if (filterBy === "all") return true;
      if (filterBy === "top") return agent.overallScore >= 90;
      if (filterBy === "needs_improvement") return agent.overallScore < 80;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "overallScore") return b.overallScore - a.overallScore;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "recentBookings") return b.recentBookings - a.recentBookings;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Brand Agent Performance</h1>
              <p className="text-muted-foreground">Track performance metrics for cannabis brand agents</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Agents</p>
                  <p className="text-2xl font-bold">{brandAgents.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Top Performers</p>
                  <p className="text-2xl font-bold">{brandAgents.filter(a => a.overallScore >= 90).length}</p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
                  <p className="text-2xl font-bold">{Math.round(brandAgents.reduce((acc, agent) => acc + agent.overallScore, 0) / brandAgents.length)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Bookings</p>
                  <p className="text-2xl font-bold">{brandAgents.reduce((acc, agent) => acc + agent.recentBookings, 0)}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-4">
              {filteredAndSortedAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={agent.avatar} alt={agent.name} />
                          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{agent.name}</h3>
                          <p className="text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Overall Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(agent.overallScore)}`}>
                            {agent.overallScore}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getScoreBadge(agent.overallScore)}>
                            {agent.overallScore >= 90 ? "Excellent" : 
                             agent.overallScore >= 80 ? "Good" : 
                             agent.overallScore >= 70 ? "Fair" : "Needs Improvement"}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Eye className="w-3 h-3" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={agent.avatar} alt={agent.name} />
                                    <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  {agent.name} - Performance Details
                                </DialogTitle>
                              </DialogHeader>
                              
                              <div className="space-y-6">
                                {/* Manager Reviews */}
                                <div>
                                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    Manager Reviews ({agent.metrics.managerReview}/5)
                                  </h3>
                                  <div className="space-y-2">
                                    {agent.compositeRecords.managerReviews.length > 0 ? (
                                      agent.compositeRecords.managerReviews.map((review) => (
                                        <Card key={review.id} className="p-3">
                                          <div className="flex justify-between items-start mb-2">
                                            <div>
                                              <p className="font-medium">{review.reviewer}</p>
                                              <p className="text-sm text-muted-foreground">{review.date}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Star className="w-4 h-4 text-yellow-500" />
                                              <span className="font-bold">{review.rating}</span>
                                            </div>
                                          </div>
                                          <p className="text-sm">{review.comments}</p>
                                          <p className="text-xs text-muted-foreground mt-1">Booking: {review.bookingRef}</p>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No manager reviews available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Attendance Records */}
                                <div>
                                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    Attendance Records ({agent.metrics.onTimeRate}% on time)
                                  </h3>
                                  <div className="space-y-2">
                                    {agent.compositeRecords.attendanceRecords.length > 0 ? (
                                      agent.compositeRecords.attendanceRecords.map((record) => (
                                        <Card key={record.id} className="p-3">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <p className="font-medium">{record.location}</p>
                                              <p className="text-sm text-muted-foreground">{record.bookingDate}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-sm">
                                                Scheduled: {record.scheduledTime} | Arrived: {record.actualArrival}
                                              </p>
                                              <Badge variant={record.status === "on_time" ? "default" : "destructive"}>
                                                {record.status === "on_time" ? "On Time" : 
                                                 record.status === "late" ? `Late (${record.minutesLate}min)` : "Absent"}
                                              </Badge>
                                            </div>
                                          </div>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No attendance records available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Location Records */}
                                <div>
                                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-green-500" />
                                    Location Check-ins ({agent.metrics.onLocationRate}% correct)
                                  </h3>
                                  <div className="space-y-2">
                                    {agent.compositeRecords.locationRecords.length > 0 ? (
                                      agent.compositeRecords.locationRecords.map((record) => (
                                        <Card key={record.id} className="p-3">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <p className="font-medium">Expected: {record.expectedLocation}</p>
                                              <p className="text-sm text-muted-foreground">
                                                Actual: {record.actualLocation} | Check-in: {record.checkInTime}
                                              </p>
                                            </div>
                                            <Badge variant={record.status === "correct" ? "default" : "destructive"}>
                                              {record.status === "correct" ? "Correct Location" : 
                                               record.status === "incorrect" ? "Wrong Location" : "No Check-in"}
                                            </Badge>
                                          </div>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No location records available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Dispensary Feedback */}
                                <div>
                                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-purple-500" />
                                    Dispensary Feedback ({agent.metrics.dispensaryRating}/5)
                                  </h3>
                                  <div className="space-y-2">
                                    {agent.compositeRecords.dispensaryFeedback.length > 0 ? (
                                      agent.compositeRecords.dispensaryFeedback.map((feedback) => (
                                        <Card key={feedback.id} className="p-3">
                                          <div className="flex justify-between items-start mb-2">
                                            <div>
                                              <p className="font-medium">{feedback.dispensaryName}</p>
                                              <p className="text-sm text-muted-foreground">{feedback.date}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Star className="w-4 h-4 text-yellow-500" />
                                              <span className="font-bold">{feedback.rating}</span>
                                            </div>
                                          </div>
                                          <p className="text-sm">{feedback.feedback}</p>
                                          <p className="text-xs text-muted-foreground mt-1">Booking: {feedback.bookingRef}</p>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No dispensary feedback available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Staff Feedback */}
                                <div>
                                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4 text-teal-500" />
                                    Staff Feedback ({agent.metrics.staffRating}/5)
                                  </h3>
                                  <div className="space-y-2">
                                    {agent.compositeRecords.staffFeedback.length > 0 ? (
                                      agent.compositeRecords.staffFeedback.map((feedback) => (
                                        <Card key={feedback.id} className="p-3">
                                          <div className="flex justify-between items-start mb-2">
                                            <div>
                                              <p className="font-medium">{feedback.staffName}</p>
                                              <p className="text-sm text-muted-foreground">{feedback.role} | {feedback.date}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Star className="w-4 h-4 text-yellow-500" />
                                              <span className="font-bold">{feedback.rating}</span>
                                            </div>
                                          </div>
                                          <p className="text-sm">{feedback.feedback}</p>
                                          <p className="text-xs text-muted-foreground mt-1">Booking: {feedback.bookingRef}</p>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No staff feedback available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Activity Records */}
                                <div>
                                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-orange-500" />
                                    Activity Completion ({agent.metrics.activityCompletion}%)
                                  </h3>
                                  <div className="space-y-2">
                                    {agent.compositeRecords.activityRecords.length > 0 ? (
                                      agent.compositeRecords.activityRecords.map((activity) => (
                                        <Card key={activity.id} className="p-3">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <p className="font-medium">{activity.activityName}</p>
                                              <p className="text-sm text-muted-foreground">
                                                Due: {activity.dueDate} 
                                                {activity.completedDate && ` | Completed: ${activity.completedDate}`}
                                              </p>
                                            </div>
                                            <Badge variant={activity.status === "completed" ? "default" : 
                                                           activity.status === "pending" ? "secondary" : "destructive"}>
                                              {activity.status === "completed" ? "Completed" : 
                                               activity.status === "pending" ? "Pending" : "Overdue"}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-1">Booking: {activity.bookingRef}</p>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No activity records available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Form Records */}
                                <div>
                                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-red-500" />
                                    Form Records ({agent.metrics.dataFormCompletion}% completion, {agent.metrics.dataFormQuality}/5 quality)
                                  </h3>
                                  <div className="space-y-2">
                                    {agent.compositeRecords.formRecords.length > 0 ? (
                                      agent.compositeRecords.formRecords.map((form) => (
                                        <Card key={form.id} className="p-3">
                                          <div className="flex justify-between items-start mb-2">
                                            <div>
                                              <p className="font-medium">{form.formType}</p>
                                              <p className="text-sm text-muted-foreground">
                                                Submitted: {form.submittedDate} | Reviewed by: {form.reviewer}
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-sm">Completion: {form.completionRate}%</p>
                                              <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                <span className="font-bold">{form.qualityRating}</span>
                                              </div>
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground">Booking: {form.bookingRef}</p>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No form records available</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Manager: {agent.metrics.managerReview}/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">On Time: {agent.metrics.onTimeRate}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="text-sm">On Location: {agent.metrics.onLocationRate}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Activities: {agent.metrics.activityCompletion}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Detailed Metrics Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <div className="space-y-6">
              {filteredAndSortedAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{agent.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Manager Review</span>
                            <span className="text-sm font-bold">{agent.metrics.managerReview}/5</span>
                          </div>
                          <Progress value={(agent.metrics.managerReview / 5) * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">On-Time Rate</span>
                            <span className="text-sm font-bold">{agent.metrics.onTimeRate}%</span>
                          </div>
                          <Progress value={agent.metrics.onTimeRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">On-Location Rate</span>
                            <span className="text-sm font-bold">{agent.metrics.onLocationRate}%</span>
                          </div>
                          <Progress value={agent.metrics.onLocationRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Dispensary Rating</span>
                            <span className="text-sm font-bold">{agent.metrics.dispensaryRating}/5</span>
                          </div>
                          <Progress value={(agent.metrics.dispensaryRating / 5) * 100} className="h-2" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Staff Rating</span>
                            <span className="text-sm font-bold">{agent.metrics.staffRating}/5</span>
                          </div>
                          <Progress value={(agent.metrics.staffRating / 5) * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Activity Completion</span>
                            <span className="text-sm font-bold">{agent.metrics.activityCompletion}%</span>
                          </div>
                          <Progress value={agent.metrics.activityCompletion} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Data Form Completion</span>
                            <span className="text-sm font-bold">{agent.metrics.dataFormCompletion}%</span>
                          </div>
                          <Progress value={agent.metrics.dataFormCompletion} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Data Form Quality</span>
                            <span className="text-sm font-bold">{agent.metrics.dataFormQuality}/5</span>
                          </div>
                          <Progress value={(agent.metrics.dataFormQuality / 5) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rankings Tab */}
          <TabsContent value="rankings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAndSortedAgents.map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={agent.avatar} alt={agent.name} />
                          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Bookings</p>
                          <p className="font-bold">{agent.recentBookings}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className={`text-lg font-bold ${getScoreColor(agent.overallScore)}`}>
                            {agent.overallScore}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}