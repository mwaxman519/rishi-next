"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Calendar, Users, TrendingUp, ArrowRight } from "lucide-react";

interface OKR {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: string;
  current: string;
  owner: string;
  dueDate: string;
  status: "ahead" | "on_track" | "at_risk" | "behind";
  keyResults: KeyResult[];
}

interface KeyResult {
  id: string;
  title: string;
  progress: number;
  target: string;
  current: string;
  unit: string;
}

export default function OKRDashboard() {
  const [selectedOKR, setSelectedOKR] = useState<string | null>(null);

  const okrs: OKR[] = [
    {
      id: "1",
      title: "Increase Cannabis Market Share",
      description: "Expand our presence in key cannabis markets across the region",
      progress: 78,
      target: "25%",
      current: "19.5%",
      owner: "Sales Team",
      dueDate: "2025-03-31",
      status: "on_track",
      keyResults: [
        {
          id: "1a",
          title: "New client acquisitions",
          progress: 85,
          target: "50",
          current: "43",
          unit: "clients"
        },
        {
          id: "1b",
          title: "Revenue growth",
          progress: 72,
          target: "$2.5M",
          current: "$1.8M",
          unit: "revenue"
        },
        {
          id: "1c",
          title: "Brand recognition",
          progress: 68,
          target: "80%",
          current: "54%",
          unit: "awareness"
        }
      ]
    },
    {
      id: "2",
      title: "Staff Performance Excellence",
      description: "Achieve industry-leading performance metrics across all teams",
      progress: 92,
      target: "95%",
      current: "87%",
      owner: "Operations Team",
      dueDate: "2025-03-31",
      status: "ahead",
      keyResults: [
        {
          id: "2a",
          title: "Customer satisfaction",
          progress: 94,
          target: "95%",
          current: "89%",
          unit: "satisfaction"
        },
        {
          id: "2b",
          title: "Staff retention",
          progress: 88,
          target: "90%",
          current: "84%",
          unit: "retention"
        },
        {
          id: "2c",
          title: "Training completion",
          progress: 95,
          target: "100%",
          current: "95%",
          unit: "completion"
        }
      ]
    },
    {
      id: "3",
      title: "Operational Efficiency",
      description: "Streamline operations and reduce costs while maintaining quality",
      progress: 65,
      target: "20%",
      current: "13%",
      owner: "Operations Team",
      dueDate: "2025-03-31",
      status: "at_risk",
      keyResults: [
        {
          id: "3a",
          title: "Cost reduction",
          progress: 60,
          target: "20%",
          current: "12%",
          unit: "reduction"
        },
        {
          id: "3b",
          title: "Process automation",
          progress: 70,
          target: "80%",
          current: "56%",
          unit: "automation"
        },
        {
          id: "3c",
          title: "Quality maintenance",
          progress: 85,
          target: "98%",
          current: "96%",
          unit: "quality"
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ahead": return "bg-green-100 text-green-800 border-green-200";
      case "on_track": return "bg-teal-100 text-teal-800 border-teal-200";
      case "at_risk": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "behind": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ahead": return "🚀";
      case "on_track": return "✅";
      case "at_risk": return "⚠️";
      case "behind": return "🔴";
      default: return "📊";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Objectives & Key Results</h2>
          <p className="text-gray-600">Track goals and measure success across cannabis operations</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-teal-500 to-purple-600">
          <Plus className="w-4 h-4" />
          Create OKR
        </Button>
      </div>

      {/* OKR Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {okrs.map((okr) => (
          <Card 
            key={okr.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedOKR === okr.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedOKR(selectedOKR === okr.id ? null : okr.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{okr.title}</CardTitle>
                <Badge className={getStatusColor(okr.status)}>
                  {getStatusIcon(okr.status)} {okr.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{okr.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-bold text-blue-600">{okr.progress}%</span>
                  </div>
                  <Progress value={okr.progress} className="h-2" />
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Target</p>
                    <p className="font-semibold">{okr.target}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Current</p>
                    <p className="font-semibold">{okr.current}</p>
                  </div>
                </div>

                {/* Owner and Due Date */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {okr.owner}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {okr.dueDate}
                  </div>
                </div>

                {/* Expand Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOKR(selectedOKR === okr.id ? null : okr.id);
                  }}
                >
                  {selectedOKR === okr.id ? 'Collapse' : 'View Details'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expanded OKR Details */}
      {selectedOKR && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Key Results Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {okrs.find(o => o.id === selectedOKR)?.keyResults.map((kr) => (
                <div key={kr.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{kr.title}</h4>
                    <Badge variant="outline" className="text-sm">
                      {kr.progress}% Complete
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Target</p>
                      <p className="font-semibold">{kr.target}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current</p>
                      <p className="font-semibold">{kr.current}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{kr.progress}%</span>
                    </div>
                    <Progress value={kr.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Goals on Track</p>
                <p className="text-2xl font-bold text-green-800">{okrs.filter(o => o.status === 'on_track' || o.status === 'ahead').length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 mb-1">At Risk</p>
                <p className="text-2xl font-bold text-yellow-800">{okrs.filter(o => o.status === 'at_risk').length}</p>
              </div>
              <Target className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Avg Progress</p>
                <p className="text-2xl font-bold text-blue-800">{Math.round(okrs.reduce((acc, okr) => acc + okr.progress, 0) / okrs.length)}%</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}