"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Radar, 
  Users, 
  Star, 
  MessageCircle, 
  TrendingUp, 
  Eye,
  UserCheck,
  Clock,
  CheckCircle,
  ArrowRight,
  Filter,
  Calendar,
  BarChart3
} from "lucide-react";

interface ReviewCycle {
  id: string;
  name: string;
  status: "draft" | "active" | "completed";
  startDate: string;
  endDate: string;
  participants: number;
  completed: number;
  type: "quarterly" | "annual" | "custom";
}

interface Review360Data {
  employee: {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar: string;
  };
  overallScore: number;
  reviewers: {
    self: number;
    manager: number;
    peers: number;
    subordinates: number;
  };
  competencies: {
    name: string;
    score: number;
    feedback: string;
    category: string;
  }[];
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
}

export default function Review360() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const reviewCycles: ReviewCycle[] = [
    {
      id: "1",
      name: "Q1 2025 Performance Review",
      status: "active",
      startDate: "2025-01-15",
      endDate: "2025-02-15",
      participants: 45,
      completed: 32,
      type: "quarterly"
    },
    {
      id: "2",
      name: "Annual Review 2024",
      status: "completed",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      participants: 48,
      completed: 48,
      type: "annual"
    },
    {
      id: "3",
      name: "Mid-Year Check-in",
      status: "draft",
      startDate: "2025-07-01",
      endDate: "2025-07-31",
      participants: 0,
      completed: 0,
      type: "custom"
    }
  ];

  const mockReviews: Review360Data[] = [
    {
      employee: {
        id: "1",
        name: "Sarah Chen",
        role: "Senior Brand Agent",
        department: "Field Operations",
        avatar: "/api/placeholder/40/40"
      },
      overallScore: 4.3,
      reviewers: {
        self: 4.1,
        manager: 4.5,
        peers: 4.2,
        subordinates: 4.4
      },
      competencies: [
        { name: "Cannabis Knowledge", score: 4.8, feedback: "Exceptional product knowledge and industry expertise", category: "Technical" },
        { name: "Customer Service", score: 4.2, feedback: "Consistently delivers excellent customer experiences", category: "Service" },
        { name: "Team Collaboration", score: 4.0, feedback: "Good team player, could improve communication", category: "Collaboration" },
        { name: "Problem Solving", score: 4.4, feedback: "Quick to identify and resolve issues", category: "Technical" },
        { name: "Leadership", score: 3.9, feedback: "Shows potential, needs more confidence", category: "Leadership" }
      ],
      strengths: [
        "Deep cannabis industry knowledge",
        "Strong customer relationship building",
        "Reliable and consistent performance",
        "Excellent problem-solving abilities"
      ],
      areasForImprovement: [
        "Public speaking and presentation skills",
        "Delegation and team leadership",
        "Strategic thinking and planning"
      ],
      goals: [
        "Complete advanced leadership training",
        "Increase customer satisfaction scores by 5%",
        "Mentor 2 junior team members"
      ]
    },
    {
      employee: {
        id: "2",
        name: "Mike Rodriguez",
        role: "Field Manager",
        department: "Operations",
        avatar: "/api/placeholder/40/40"
      },
      overallScore: 4.6,
      reviewers: {
        self: 4.3,
        manager: 4.8,
        peers: 4.5,
        subordinates: 4.7
      },
      competencies: [
        { name: "Team Management", score: 4.7, feedback: "Excellent at motivating and developing team members", category: "Leadership" },
        { name: "Operational Excellence", score: 4.5, feedback: "Consistently meets operational targets", category: "Operations" },
        { name: "Communication", score: 4.6, feedback: "Clear and effective communicator", category: "Communication" },
        { name: "Strategic Planning", score: 4.2, feedback: "Good strategic thinking with room for improvement", category: "Strategic" },
        { name: "Cannabis Compliance", score: 4.8, feedback: "Expert knowledge of cannabis regulations", category: "Compliance" }
      ],
      strengths: [
        "Outstanding team leadership",
        "Strong operational management",
        "Excellent communication skills",
        "Deep compliance knowledge"
      ],
      areasForImprovement: [
        "Long-term strategic planning",
        "Cross-functional collaboration",
        "Technology adoption"
      ],
      goals: [
        "Implement team productivity improvements",
        "Complete strategic management certification",
        "Improve cross-departmental partnerships"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCompetencyColor = (score: number) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 4.0) return "text-blue-600";
    if (score >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const renderRadarChart = (data: Review360Data) => {
    const reviewerTypes = Object.keys(data.reviewers);
    const maxScore = 5;
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        {/* Radar chart visualization would go here */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-full">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{data.overallScore}</div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">360° Performance Reviews</h2>
          <p className="text-gray-600">Comprehensive multi-perspective performance evaluations</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600">
          <Radar className="w-4 h-4" />
          New Review Cycle
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cycles">Review Cycles</TabsTrigger>
          <TabsTrigger value="reviews">Individual Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Active Reviews</p>
                    <p className="text-2xl font-bold text-blue-800">32</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-800">48</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 mb-1">Avg Score</p>
                    <p className="text-2xl font-bold text-purple-800">4.2</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-800">13</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={review.employee.avatar} alt={review.employee.name} />
                        <AvatarFallback>{review.employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{review.employee.name}</p>
                        <p className="text-sm text-gray-600">{review.employee.role}</p>
                        <p className="text-sm text-gray-500">{review.employee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-bold text-lg">{review.overallScore}</span>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Cycles Tab */}
        <TabsContent value="cycles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Review Cycles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewCycles.map((cycle) => (
                  <div key={cycle.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{cycle.name}</h3>
                        <p className="text-sm text-gray-600">
                          {cycle.startDate} - {cycle.endDate}
                        </p>
                      </div>
                      <Badge className={getStatusColor(cycle.status)}>
                        {cycle.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Participants</p>
                        <p className="font-semibold">{cycle.participants}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="font-semibold">{cycle.completed}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-medium">
                          {cycle.participants > 0 ? Math.round((cycle.completed / cycle.participants) * 100) : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={cycle.participants > 0 ? (cycle.completed / cycle.participants) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockReviews.map((review) => (
              <Card key={review.employee.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={review.employee.avatar} alt={review.employee.name} />
                      <AvatarFallback>{review.employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{review.employee.name}</CardTitle>
                      <p className="text-sm text-gray-600">{review.employee.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{review.overallScore}</div>
                      <p className="text-sm text-gray-600">Overall Score</p>
                    </div>

                    {/* Reviewer Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Self</span>
                          <span className="font-medium">{review.reviewers.self}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Manager</span>
                          <span className="font-medium">{review.reviewers.manager}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Peers</span>
                          <span className="font-medium">{review.reviewers.peers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Subordinates</span>
                          <span className="font-medium">{review.reviewers.subordinates}</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Competencies */}
                    <div>
                      <h4 className="font-semibold mb-3">Top Competencies</h4>
                      <div className="space-y-2">
                        {review.competencies.slice(0, 3).map((comp, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{comp.name}</span>
                            <span className={`font-medium ${getCompetencyColor(comp.score)}`}>
                              {comp.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      View Full Review
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Review Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-gray-600 mb-6">Performance trends and insights coming soon</p>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}