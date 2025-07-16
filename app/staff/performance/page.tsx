"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download
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
}

export default function BrandAgentPerformance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sortBy, setSortBy] = useState("overallScore");
  const [filterBy, setFilterBy] = useState("all");

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
      status: "active"
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
      status: "active"
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
      status: "active"
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
      status: "active"
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
      status: "active"
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
                        <Badge className={getScoreBadge(agent.overallScore)}>
                          {agent.overallScore >= 90 ? "Excellent" : 
                           agent.overallScore >= 80 ? "Good" : 
                           agent.overallScore >= 70 ? "Fair" : "Needs Improvement"}
                        </Badge>
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