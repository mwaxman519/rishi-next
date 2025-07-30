&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { Card, CardContent, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Progress } from &quot;@/components/ui/progress&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from &quot;@/components/ui/dialog&quot;;
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
} from &quot;lucide-react&quot;;

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
  status: &quot;active&quot; | &quot;inactive&quot; | &quot;on_leave&quot;;
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
      status: &quot;on_time&quot; | &quot;late&quot; | &quot;absent&quot;;
      minutesLate?: number;
    }>;
    locationRecords: Array<{
      id: string;
      bookingDate: string;
      expectedLocation: string;
      actualLocation: string;
      checkInTime: string;
      status: &quot;correct&quot; | &quot;incorrect&quot; | &quot;missing&quot;;
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
      status: &quot;completed&quot; | &quot;pending&quot; | &quot;overdue&quot;;
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
  const [activeTab, setActiveTab] = useState(&quot;overview&quot;);
  const [sortBy, setSortBy] = useState(&quot;overallScore&quot;);
  const [filterBy, setFilterBy] = useState(&quot;all&quot;);
  const [selectedAgent, setSelectedAgent] = useState<BrandAgentPerformance | null>(null);

  const brandAgents: BrandAgentPerformance[] = [
    {
      id: &quot;1&quot;,
      name: &quot;Sarah Chen&quot;,
      avatar: &quot;/api/placeholder/40/40&quot;,
      role: &quot;Senior Brand Agent&quot;,
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
      joinDate: &quot;2023-03-15&quot;,
      status: &quot;active&quot;,
      compositeRecords: {
        managerReviews: [
          {
            id: &quot;1&quot;,
            date: &quot;2025-01-15&quot;,
            reviewer: &quot;John Smith&quot;,
            rating: 5,
            comments: &quot;Excellent performance at Green Valley Dispensary&quot;,
            bookingRef: &quot;BK-2025-001&quot;
          },
          {
            id: &quot;2&quot;, 
            date: &quot;2025-01-10&quot;,
            reviewer: &quot;Mary Johnson&quot;,
            rating: 4.5,
            comments: &quot;Great customer engagement, minor improvement on product knowledge&quot;,
            bookingRef: &quot;BK-2025-002&quot;
          }
        ],
        attendanceRecords: [
          {
            id: &quot;1&quot;,
            bookingDate: &quot;2025-01-15&quot;,
            scheduledTime: &quot;09:00&quot;,
            actualArrival: &quot;08:55&quot;,
            location: &quot;Green Valley Dispensary&quot;,
            status: &quot;on_time&quot;
          },
          {
            id: &quot;2&quot;,
            bookingDate: &quot;2025-01-12&quot;,
            scheduledTime: &quot;10:00&quot;, 
            actualArrival: &quot;10:15&quot;,
            location: &quot;Cannabis Corner&quot;,
            status: &quot;late&quot;,
            minutesLate: 15
          }
        ],
        locationRecords: [
          {
            id: &quot;1&quot;,
            bookingDate: &quot;2025-01-15&quot;,
            expectedLocation: &quot;Green Valley Dispensary&quot;,
            actualLocation: &quot;Green Valley Dispensary&quot;,
            checkInTime: &quot;08:55&quot;,
            status: &quot;correct&quot;,
            gpsCoordinates: &quot;40.7128,-74.0060&quot;
          }
        ],
        dispensaryFeedback: [
          {
            id: &quot;1&quot;,
            dispensaryName: &quot;Green Valley Dispensary&quot;,
            date: &quot;2025-01-15&quot;,
            rating: 5,
            feedback: &quot;Outstanding brand representative, customers loved the product demos&quot;,
            bookingRef: &quot;BK-2025-001&quot;
          }
        ],
        staffFeedback: [
          {
            id: &quot;1&quot;,
            staffName: &quot;Amanda Wilson&quot;,
            role: &quot;Budtender&quot;,
            date: &quot;2025-01-15&quot;,
            rating: 4.5,
            feedback: &quot;Professional and knowledgeable, worked well with our team&quot;,
            bookingRef: &quot;BK-2025-001&quot;
          }
        ],
        activityRecords: [
          {
            id: &quot;1&quot;,
            activityName: &quot;Product Demo Setup&quot;,
            dueDate: &quot;2025-01-15&quot;,
            completedDate: &quot;2025-01-15&quot;,
            status: &quot;completed&quot;,
            bookingRef: &quot;BK-2025-001&quot;
          }
        ],
        formRecords: [
          {
            id: &quot;1&quot;,
            formType: &quot;Post-Event Report&quot;,
            submittedDate: &quot;2025-01-15&quot;,
            completionRate: 100,
            qualityRating: 4.8,
            reviewer: &quot;John Smith&quot;,
            bookingRef: &quot;BK-2025-001&quot;
          }
        ]
      }
    },
    {
      id: &quot;2&quot;,
      name: &quot;Mike Rodriguez&quot;,
      avatar: &quot;/api/placeholder/40/40&quot;,
      role: &quot;Brand Agent&quot;,
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
      joinDate: &quot;2023-07-20&quot;,
      status: &quot;active&quot;,
      compositeRecords: {
        managerReviews: [
          {
            id: &quot;1&quot;,
            date: &quot;2025-01-14&quot;,
            reviewer: &quot;Sarah Davis&quot;,
            rating: 4.5,
            comments: &quot;Solid performance, good customer interaction&quot;,
            bookingRef: &quot;BK-2025-003&quot;
          }
        ],
        attendanceRecords: [
          {
            id: &quot;1&quot;,
            bookingDate: &quot;2025-01-14&quot;,
            scheduledTime: &quot;11:00&quot;,
            actualArrival: &quot;11:30&quot;,
            location: &quot;Herb Haven&quot;,
            status: &quot;late&quot;,
            minutesLate: 30
          }
        ],
        locationRecords: [
          {
            id: &quot;1&quot;,
            bookingDate: &quot;2025-01-14&quot;,
            expectedLocation: &quot;Herb Haven&quot;,
            actualLocation: &quot;Herb Haven&quot;,
            checkInTime: &quot;11:30&quot;,
            status: &quot;correct&quot;
          }
        ],
        dispensaryFeedback: [
          {
            id: &quot;1&quot;,
            dispensaryName: &quot;Herb Haven&quot;,
            date: &quot;2025-01-14&quot;,
            rating: 4.0,
            feedback: &quot;Good product knowledge, arrived late but made up for it&quot;,
            bookingRef: &quot;BK-2025-003&quot;
          }
        ],
        staffFeedback: [
          {
            id: &quot;1&quot;,
            staffName: &quot;Mike Torres&quot;,
            role: &quot;Store Manager&quot;,
            date: &quot;2025-01-14&quot;,
            rating: 4.2,
            feedback: &quot;Professional attitude, customers responded well&quot;,
            bookingRef: &quot;BK-2025-003&quot;
          }
        ],
        activityRecords: [
          {
            id: &quot;1&quot;,
            activityName: &quot;Customer Education Session&quot;,
            dueDate: &quot;2025-01-14&quot;,
            completedDate: &quot;2025-01-14&quot;,
            status: &quot;completed&quot;,
            bookingRef: &quot;BK-2025-003&quot;
          }
        ],
        formRecords: [
          {
            id: &quot;1&quot;,
            formType: &quot;Activity Summary&quot;,
            submittedDate: &quot;2025-01-14&quot;,
            completionRate: 95,
            qualityRating: 4.0,
            reviewer: &quot;Sarah Davis&quot;,
            bookingRef: &quot;BK-2025-003&quot;
          }
        ]
      }
    },
    {
      id: &quot;3&quot;,
      name: &quot;Jennifer Kim&quot;,
      avatar: &quot;/api/placeholder/40/40&quot;,
      role: &quot;Brand Agent&quot;,
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
      joinDate: &quot;2023-09-10&quot;,
      status: &quot;active&quot;,
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
      id: &quot;4&quot;,
      name: &quot;David Park&quot;,
      avatar: &quot;/api/placeholder/40/40&quot;,
      role: &quot;Brand Agent&quot;,
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
      joinDate: &quot;2023-11-05&quot;,
      status: &quot;active&quot;,
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
      id: &quot;5&quot;,
      name: &quot;Lisa Wang&quot;,
      avatar: &quot;/api/placeholder/40/40&quot;,
      role: &quot;Brand Agent&quot;,
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
      joinDate: &quot;2024-01-12&quot;,
      status: &quot;active&quot;,
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
    if (score >= 90) return &quot;text-green-600&quot;;
    if (score >= 80) return &quot;text-yellow-600&quot;;
    if (score >= 70) return &quot;text-orange-600&quot;;
    return &quot;text-red-600&quot;;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return &quot;bg-green-100 text-green-800&quot;;
    if (score >= 80) return &quot;bg-yellow-100 text-yellow-800&quot;;
    if (score >= 70) return &quot;bg-orange-100 text-orange-800&quot;;
    return &quot;bg-red-100 text-red-800&quot;;
  };

  const filteredAndSortedAgents = brandAgents
    .filter(agent => {
      if (filterBy === &quot;all&quot;) return true;
      if (filterBy === &quot;top&quot;) return agent.overallScore >= 90;
      if (filterBy === &quot;needs_improvement&quot;) return agent.overallScore < 80;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === &quot;overallScore&quot;) return b.overallScore - a.overallScore;
      if (sortBy === &quot;name&quot;) return a.name.localeCompare(b.name);
      if (sortBy === &quot;recentBookings&quot;) return b.recentBookings - a.recentBookings;
      return 0;
    });

  return (
    <div className=&quot;min-h-screen bg-background&quot;>
      {/* Header */}
      <div className=&quot;bg-card shadow-sm border-b&quot;>
        <div className=&quot;max-w-7xl mx-auto px-4 py-6&quot;>
          <div className=&quot;flex items-center justify-between&quot;>
            <div>
              <h1 className=&quot;text-2xl font-bold text-foreground&quot;>Brand Agent Performance</h1>
              <p className=&quot;text-muted-foreground&quot;>Track performance metrics for cannabis brand agents</p>
            </div>
            <div className=&quot;flex items-center gap-3&quot;>
              <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;gap-2&quot;>
                <Filter className=&quot;w-4 h-4&quot; />
                Filter
              </Button>
              <Button size=&quot;sm&quot; className=&quot;gap-2&quot;>
                <Download className=&quot;w-4 h-4&quot; />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=&quot;max-w-7xl mx-auto px-4 py-8&quot;>
        {/* Summary Cards */}
        <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4 mb-8&quot;>
          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-sm text-muted-foreground mb-1&quot;>Total Agents</p>
                  <p className=&quot;text-2xl font-bold&quot;>{brandAgents.length}</p>
                </div>
                <Users className=&quot;w-8 h-8 text-blue-500&quot; />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-sm text-muted-foreground mb-1&quot;>Top Performers</p>
                  <p className=&quot;text-2xl font-bold&quot;>{brandAgents.filter(a => a.overallScore >= 90).length}</p>
                </div>
                <Award className=&quot;w-8 h-8 text-green-500&quot; />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-sm text-muted-foreground mb-1&quot;>Avg Score</p>
                  <p className=&quot;text-2xl font-bold&quot;>{Math.round(brandAgents.reduce((acc, agent) => acc + agent.overallScore, 0) / brandAgents.length)}</p>
                </div>
                <TrendingUp className=&quot;w-8 h-8 text-purple-500&quot; />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className=&quot;p-4&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-sm text-muted-foreground mb-1&quot;>Active Bookings</p>
                  <p className=&quot;text-2xl font-bold&quot;>{brandAgents.reduce((acc, agent) => acc + agent.recentBookings, 0)}</p>
                </div>
                <CheckCircle className=&quot;w-8 h-8 text-teal-500&quot; />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className=&quot;space-y-6&quot;>
          <TabsList className=&quot;grid w-full grid-cols-3&quot;>
            <TabsTrigger value=&quot;overview&quot;>Overview</TabsTrigger>
            <TabsTrigger value=&quot;detailed&quot;>Detailed Metrics</TabsTrigger>
            <TabsTrigger value=&quot;rankings&quot;>Rankings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value=&quot;overview&quot; className=&quot;space-y-6&quot;>
            <div className=&quot;space-y-4&quot;>
              {filteredAndSortedAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className=&quot;p-6&quot;>
                    <div className=&quot;flex items-center justify-between&quot;>
                      <div className=&quot;flex items-center gap-4&quot;>
                        <Avatar className=&quot;w-12 h-12&quot;>
                          <AvatarImage src={agent.avatar} alt={agent.name} />
                          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className=&quot;font-semibold text-lg&quot;>{agent.name}</h3>
                          <p className=&quot;text-muted-foreground&quot;>{agent.role}</p>
                        </div>
                      </div>
                      <div className=&quot;flex items-center gap-6&quot;>
                        <div className=&quot;text-right&quot;>
                          <p className=&quot;text-sm text-muted-foreground&quot;>Overall Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(agent.overallScore)}`}>
                            {agent.overallScore}%
                          </p>
                        </div>
                        <div className=&quot;flex items-center gap-2&quot;>
                          <Badge className={getScoreBadge(agent.overallScore)}>
                            {agent.overallScore >= 90 ? &quot;Excellent&quot; : 
                             agent.overallScore >= 80 ? &quot;Good&quot; : 
                             agent.overallScore >= 70 ? &quot;Fair&quot; : &quot;Needs Improvement&quot;}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;gap-1&quot;>
                                <Eye className=&quot;w-3 h-3&quot; />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className=&quot;max-w-4xl max-h-[80vh] overflow-y-auto&quot;>
                              <DialogHeader>
                                <DialogTitle className=&quot;flex items-center gap-3&quot;>
                                  <Avatar className=&quot;w-8 h-8&quot;>
                                    <AvatarImage src={agent.avatar} alt={agent.name} />
                                    <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  {agent.name} - Performance Details
                                </DialogTitle>
                              </DialogHeader>
                              
                              <div className=&quot;space-y-6&quot;>
                                {/* Manager Reviews */}
                                <div>
                                  <h3 className=&quot;font-semibold mb-3 flex items-center gap-2&quot;>
                                    <Star className=&quot;w-4 h-4 text-yellow-500&quot; />
                                    Manager Reviews ({agent.metrics.managerReview}/5)
                                  </h3>
                                  <div className=&quot;space-y-2&quot;>
                                    {agent.compositeRecords.managerReviews.length > 0 ? (
                                      agent.compositeRecords.managerReviews.map((review) => (
                                        <Card key={review.id} className=&quot;p-3&quot;>
                                          <div className=&quot;flex justify-between items-start mb-2&quot;>
                                            <div>
                                              <p className=&quot;font-medium&quot;>{review.reviewer}</p>
                                              <p className=&quot;text-sm text-muted-foreground&quot;>{review.date}</p>
                                            </div>
                                            <div className=&quot;flex items-center gap-1&quot;>
                                              <Star className=&quot;w-4 h-4 text-yellow-500&quot; />
                                              <span className=&quot;font-bold&quot;>{review.rating}</span>
                                            </div>
                                          </div>
                                          <p className=&quot;text-sm&quot;>{review.comments}</p>
                                          <p className=&quot;text-xs text-muted-foreground mt-1&quot;>Booking: {review.bookingRef}</p>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className=&quot;text-sm text-muted-foreground&quot;>No manager reviews available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Attendance Records */}
                                <div>
                                  <h3 className=&quot;font-semibold mb-3 flex items-center gap-2&quot;>
                                    <Clock className=&quot;w-4 h-4 text-blue-500&quot; />
                                    Attendance Records ({agent.metrics.onTimeRate}% on time)
                                  </h3>
                                  <div className=&quot;space-y-2&quot;>
                                    {agent.compositeRecords.attendanceRecords.length > 0 ? (
                                      agent.compositeRecords.attendanceRecords.map((record) => (
                                        <Card key={record.id} className=&quot;p-3&quot;>
                                          <div className=&quot;flex justify-between items-center&quot;>
                                            <div>
                                              <p className=&quot;font-medium&quot;>{record.location}</p>
                                              <p className=&quot;text-sm text-muted-foreground&quot;>{record.bookingDate}</p>
                                            </div>
                                            <div className=&quot;text-right&quot;>
                                              <p className=&quot;text-sm&quot;>
                                                Scheduled: {record.scheduledTime} | Arrived: {record.actualArrival}
                                              </p>
                                              <Badge variant={record.status === &quot;on_time&quot; ? &quot;default&quot; : &quot;destructive&quot;}>
                                                {record.status === &quot;on_time&quot; ? &quot;On Time&quot; : 
                                                 record.status === &quot;late&quot; ? `Late (${record.minutesLate}min)` : &quot;Absent&quot;}
                                              </Badge>
                                            </div>
                                          </div>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className=&quot;text-sm text-muted-foreground&quot;>No attendance records available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Location Records */}
                                <div>
                                  <h3 className=&quot;font-semibold mb-3 flex items-center gap-2&quot;>
                                    <MapPin className=&quot;w-4 h-4 text-green-500&quot; />
                                    Location Check-ins ({agent.metrics.onLocationRate}% correct)
                                  </h3>
                                  <div className=&quot;space-y-2&quot;>
                                    {agent.compositeRecords.locationRecords.length > 0 ? (
                                      agent.compositeRecords.locationRecords.map((record) => (
                                        <Card key={record.id} className=&quot;p-3&quot;>
                                          <div className=&quot;flex justify-between items-center&quot;>
                                            <div>
                                              <p className=&quot;font-medium&quot;>Expected: {record.expectedLocation}</p>
                                              <p className=&quot;text-sm text-muted-foreground&quot;>
                                                Actual: {record.actualLocation} | Check-in: {record.checkInTime}
                                              </p>
                                            </div>
                                            <Badge variant={record.status === &quot;correct&quot; ? &quot;default&quot; : &quot;destructive&quot;}>
                                              {record.status === &quot;correct&quot; ? &quot;Correct Location&quot; : 
                                               record.status === &quot;incorrect&quot; ? &quot;Wrong Location&quot; : &quot;No Check-in&quot;}
                                            </Badge>
                                          </div>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className=&quot;text-sm text-muted-foreground&quot;>No location records available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Dispensary Feedback */}
                                <div>
                                  <h3 className=&quot;font-semibold mb-3 flex items-center gap-2&quot;>
                                    <Building className=&quot;w-4 h-4 text-purple-500&quot; />
                                    Dispensary Feedback ({agent.metrics.dispensaryRating}/5)
                                  </h3>
                                  <div className=&quot;space-y-2&quot;>
                                    {agent.compositeRecords.dispensaryFeedback.length > 0 ? (
                                      agent.compositeRecords.dispensaryFeedback.map((feedback) => (
                                        <Card key={feedback.id} className=&quot;p-3&quot;>
                                          <div className=&quot;flex justify-between items-start mb-2&quot;>
                                            <div>
                                              <p className=&quot;font-medium&quot;>{feedback.dispensaryName}</p>
                                              <p className=&quot;text-sm text-muted-foreground&quot;>{feedback.date}</p>
                                            </div>
                                            <div className=&quot;flex items-center gap-1&quot;>
                                              <Star className=&quot;w-4 h-4 text-yellow-500&quot; />
                                              <span className=&quot;font-bold&quot;>{feedback.rating}</span>
                                            </div>
                                          </div>
                                          <p className=&quot;text-sm&quot;>{feedback.feedback}</p>
                                          <p className=&quot;text-xs text-muted-foreground mt-1&quot;>Booking: {feedback.bookingRef}</p>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className=&quot;text-sm text-muted-foreground&quot;>No dispensary feedback available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Staff Feedback */}
                                <div>
                                  <h3 className=&quot;font-semibold mb-3 flex items-center gap-2&quot;>
                                    <User className=&quot;w-4 h-4 text-teal-500&quot; />
                                    Staff Feedback ({agent.metrics.staffRating}/5)
                                  </h3>
                                  <div className=&quot;space-y-2&quot;>
                                    {agent.compositeRecords.staffFeedback.length > 0 ? (
                                      agent.compositeRecords.staffFeedback.map((feedback) => (
                                        <Card key={feedback.id} className=&quot;p-3&quot;>
                                          <div className=&quot;flex justify-between items-start mb-2&quot;>
                                            <div>
                                              <p className=&quot;font-medium&quot;>{feedback.staffName}</p>
                                              <p className=&quot;text-sm text-muted-foreground&quot;>{feedback.role} | {feedback.date}</p>
                                            </div>
                                            <div className=&quot;flex items-center gap-1&quot;>
                                              <Star className=&quot;w-4 h-4 text-yellow-500&quot; />
                                              <span className=&quot;font-bold&quot;>{feedback.rating}</span>
                                            </div>
                                          </div>
                                          <p className=&quot;text-sm&quot;>{feedback.feedback}</p>
                                          <p className=&quot;text-xs text-muted-foreground mt-1&quot;>Booking: {feedback.bookingRef}</p>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className=&quot;text-sm text-muted-foreground&quot;>No staff feedback available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Activity Records */}
                                <div>
                                  <h3 className=&quot;font-semibold mb-3 flex items-center gap-2&quot;>
                                    <ClipboardList className=&quot;w-4 h-4 text-orange-500&quot; />
                                    Activity Completion ({agent.metrics.activityCompletion}%)
                                  </h3>
                                  <div className=&quot;space-y-2&quot;>
                                    {agent.compositeRecords.activityRecords.length > 0 ? (
                                      agent.compositeRecords.activityRecords.map((activity) => (
                                        <Card key={activity.id} className=&quot;p-3&quot;>
                                          <div className=&quot;flex justify-between items-center&quot;>
                                            <div>
                                              <p className=&quot;font-medium&quot;>{activity.activityName}</p>
                                              <p className=&quot;text-sm text-muted-foreground&quot;>
                                                Due: {activity.dueDate} 
                                                {activity.completedDate && ` | Completed: ${activity.completedDate}`}
                                              </p>
                                            </div>
                                            <Badge variant={activity.status === &quot;completed&quot; ? &quot;default&quot; : 
                                                           activity.status === &quot;pending&quot; ? &quot;secondary&quot; : &quot;destructive&quot;}>
                                              {activity.status === &quot;completed&quot; ? &quot;Completed&quot; : 
                                               activity.status === &quot;pending&quot; ? &quot;Pending&quot; : &quot;Overdue&quot;}
                                            </Badge>
                                          </div>
                                          <p className=&quot;text-xs text-muted-foreground mt-1&quot;>Booking: {activity.bookingRef}</p>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className=&quot;text-sm text-muted-foreground&quot;>No activity records available</p>
                                    )}
                                  </div>
                                </div>

                                {/* Form Records */}
                                <div>
                                  <h3 className=&quot;font-semibold mb-3 flex items-center gap-2&quot;>
                                    <FileText className=&quot;w-4 h-4 text-red-500&quot; />
                                    Form Records ({agent.metrics.dataFormCompletion}% completion, {agent.metrics.dataFormQuality}/5 quality)
                                  </h3>
                                  <div className=&quot;space-y-2&quot;>
                                    {agent.compositeRecords.formRecords.length > 0 ? (
                                      agent.compositeRecords.formRecords.map((form) => (
                                        <Card key={form.id} className=&quot;p-3&quot;>
                                          <div className=&quot;flex justify-between items-start mb-2&quot;>
                                            <div>
                                              <p className=&quot;font-medium&quot;>{form.formType}</p>
                                              <p className=&quot;text-sm text-muted-foreground&quot;>
                                                Submitted: {form.submittedDate} | Reviewed by: {form.reviewer}
                                              </p>
                                            </div>
                                            <div className=&quot;text-right&quot;>
                                              <p className=&quot;text-sm&quot;>Completion: {form.completionRate}%</p>
                                              <div className=&quot;flex items-center gap-1&quot;>
                                                <Star className=&quot;w-4 h-4 text-yellow-500&quot; />
                                                <span className=&quot;font-bold&quot;>{form.qualityRating}</span>
                                              </div>
                                            </div>
                                          </div>
                                          <p className=&quot;text-xs text-muted-foreground&quot;>Booking: {form.bookingRef}</p>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className=&quot;text-sm text-muted-foreground&quot;>No form records available</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                    
                    <div className=&quot;grid grid-cols-2 md:grid-cols-4 gap-4 mt-4&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Star className=&quot;w-4 h-4 text-yellow-500&quot; />
                        <span className=&quot;text-sm&quot;>Manager: {agent.metrics.managerReview}/5</span>
                      </div>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Clock className=&quot;w-4 h-4 text-blue-500&quot; />
                        <span className=&quot;text-sm&quot;>On Time: {agent.metrics.onTimeRate}%</span>
                      </div>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <MapPin className=&quot;w-4 h-4 text-green-500&quot; />
                        <span className=&quot;text-sm&quot;>On Location: {agent.metrics.onLocationRate}%</span>
                      </div>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <FileText className=&quot;w-4 h-4 text-purple-500&quot; />
                        <span className=&quot;text-sm&quot;>Activities: {agent.metrics.activityCompletion}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Detailed Metrics Tab */}
          <TabsContent value=&quot;detailed&quot; className=&quot;space-y-6&quot;>
            <div className=&quot;space-y-6&quot;>
              {filteredAndSortedAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className=&quot;flex items-center gap-4&quot;>
                      <Avatar className=&quot;w-10 h-10&quot;>
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className=&quot;text-lg&quot;>{agent.name}</CardTitle>
                        <p className=&quot;text-sm text-muted-foreground&quot;>{agent.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                      <div className=&quot;space-y-4&quot;>
                        <div>
                          <div className=&quot;flex justify-between mb-2&quot;>
                            <span className=&quot;text-sm font-medium&quot;>Manager Review</span>
                            <span className=&quot;text-sm font-bold&quot;>{agent.metrics.managerReview}/5</span>
                          </div>
                          <Progress value={(agent.metrics.managerReview / 5) * 100} className=&quot;h-2&quot; />
                        </div>
                        <div>
                          <div className=&quot;flex justify-between mb-2&quot;>
                            <span className=&quot;text-sm font-medium&quot;>On-Time Rate</span>
                            <span className=&quot;text-sm font-bold&quot;>{agent.metrics.onTimeRate}%</span>
                          </div>
                          <Progress value={agent.metrics.onTimeRate} className=&quot;h-2&quot; />
                        </div>
                        <div>
                          <div className=&quot;flex justify-between mb-2&quot;>
                            <span className=&quot;text-sm font-medium&quot;>On-Location Rate</span>
                            <span className=&quot;text-sm font-bold&quot;>{agent.metrics.onLocationRate}%</span>
                          </div>
                          <Progress value={agent.metrics.onLocationRate} className=&quot;h-2&quot; />
                        </div>
                        <div>
                          <div className=&quot;flex justify-between mb-2&quot;>
                            <span className=&quot;text-sm font-medium&quot;>Dispensary Rating</span>
                            <span className=&quot;text-sm font-bold&quot;>{agent.metrics.dispensaryRating}/5</span>
                          </div>
                          <Progress value={(agent.metrics.dispensaryRating / 5) * 100} className=&quot;h-2&quot; />
                        </div>
                      </div>
                      <div className=&quot;space-y-4&quot;>
                        <div>
                          <div className=&quot;flex justify-between mb-2&quot;>
                            <span className=&quot;text-sm font-medium&quot;>Staff Rating</span>
                            <span className=&quot;text-sm font-bold&quot;>{agent.metrics.staffRating}/5</span>
                          </div>
                          <Progress value={(agent.metrics.staffRating / 5) * 100} className=&quot;h-2&quot; />
                        </div>
                        <div>
                          <div className=&quot;flex justify-between mb-2&quot;>
                            <span className=&quot;text-sm font-medium&quot;>Activity Completion</span>
                            <span className=&quot;text-sm font-bold&quot;>{agent.metrics.activityCompletion}%</span>
                          </div>
                          <Progress value={agent.metrics.activityCompletion} className=&quot;h-2&quot; />
                        </div>
                        <div>
                          <div className=&quot;flex justify-between mb-2&quot;>
                            <span className=&quot;text-sm font-medium&quot;>Data Form Completion</span>
                            <span className=&quot;text-sm font-bold&quot;>{agent.metrics.dataFormCompletion}%</span>
                          </div>
                          <Progress value={agent.metrics.dataFormCompletion} className=&quot;h-2&quot; />
                        </div>
                        <div>
                          <div className=&quot;flex justify-between mb-2&quot;>
                            <span className=&quot;text-sm font-medium&quot;>Data Form Quality</span>
                            <span className=&quot;text-sm font-bold&quot;>{agent.metrics.dataFormQuality}/5</span>
                          </div>
                          <Progress value={(agent.metrics.dataFormQuality / 5) * 100} className=&quot;h-2&quot; />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rankings Tab */}
          <TabsContent value=&quot;rankings&quot; className=&quot;space-y-6&quot;>
            <Card>
              <CardHeader>
                <CardTitle>Performance Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  {filteredAndSortedAgents.map((agent, index) => (
                    <div key={agent.id} className=&quot;flex items-center justify-between p-4 bg-muted rounded-lg&quot;>
                      <div className=&quot;flex items-center gap-4&quot;>
                        <div className=&quot;w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold&quot;>
                          {index + 1}
                        </div>
                        <Avatar className=&quot;w-10 h-10&quot;>
                          <AvatarImage src={agent.avatar} alt={agent.name} />
                          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className=&quot;font-semibold&quot;>{agent.name}</p>
                          <p className=&quot;text-sm text-muted-foreground&quot;>{agent.role}</p>
                        </div>
                      </div>
                      <div className=&quot;flex items-center gap-4&quot;>
                        <div className=&quot;text-right&quot;>
                          <p className=&quot;text-sm text-muted-foreground&quot;>Bookings</p>
                          <p className=&quot;font-bold&quot;>{agent.recentBookings}</p>
                        </div>
                        <div className=&quot;text-right&quot;>
                          <p className=&quot;text-sm text-muted-foreground&quot;>Score</p>
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