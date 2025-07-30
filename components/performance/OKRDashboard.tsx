&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { Card, CardContent, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Progress } from &quot;@/components/ui/progress&quot;;
import { Target, Plus, Calendar, Users, TrendingUp, ArrowRight } from &quot;lucide-react&quot;;

interface OKR {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: string;
  current: string;
  owner: string;
  dueDate: string;
  status: &quot;ahead&quot; | &quot;on_track&quot; | &quot;at_risk&quot; | &quot;behind&quot;;
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
      id: &quot;1&quot;,
      title: &quot;Increase Cannabis Market Share&quot;,
      description: &quot;Expand our presence in key cannabis markets across the region&quot;,
      progress: 78,
      target: &quot;25%&quot;,
      current: &quot;19.5%&quot;,
      owner: &quot;Sales Team&quot;,
      dueDate: &quot;2025-03-31&quot;,
      status: &quot;on_track&quot;,
      keyResults: [
        {
          id: &quot;1a&quot;,
          title: &quot;New client acquisitions&quot;,
          progress: 85,
          target: &quot;50&quot;,
          current: &quot;43&quot;,
          unit: &quot;clients&quot;
        },
        {
          id: &quot;1b&quot;,
          title: &quot;Revenue growth&quot;,
          progress: 72,
          target: &quot;$2.5M&quot;,
          current: &quot;$1.8M&quot;,
          unit: &quot;revenue&quot;
        },
        {
          id: &quot;1c&quot;,
          title: &quot;Brand recognition&quot;,
          progress: 68,
          target: &quot;80%&quot;,
          current: &quot;54%&quot;,
          unit: &quot;awareness&quot;
        }
      ]
    },
    {
      id: &quot;2&quot;,
      title: &quot;Staff Performance Excellence&quot;,
      description: &quot;Achieve industry-leading performance metrics across all teams&quot;,
      progress: 92,
      target: &quot;95%&quot;,
      current: &quot;87%&quot;,
      owner: &quot;Operations Team&quot;,
      dueDate: &quot;2025-03-31&quot;,
      status: &quot;ahead&quot;,
      keyResults: [
        {
          id: &quot;2a&quot;,
          title: &quot;Customer satisfaction&quot;,
          progress: 94,
          target: &quot;95%&quot;,
          current: &quot;89%&quot;,
          unit: &quot;satisfaction&quot;
        },
        {
          id: &quot;2b&quot;,
          title: &quot;Staff retention&quot;,
          progress: 88,
          target: &quot;90%&quot;,
          current: &quot;84%&quot;,
          unit: &quot;retention&quot;
        },
        {
          id: &quot;2c&quot;,
          title: &quot;Training completion&quot;,
          progress: 95,
          target: &quot;100%&quot;,
          current: &quot;95%&quot;,
          unit: &quot;completion&quot;
        }
      ]
    },
    {
      id: &quot;3&quot;,
      title: &quot;Operational Efficiency&quot;,
      description: &quot;Streamline operations and reduce costs while maintaining quality&quot;,
      progress: 65,
      target: &quot;20%&quot;,
      current: &quot;13%&quot;,
      owner: &quot;Operations Team&quot;,
      dueDate: &quot;2025-03-31&quot;,
      status: &quot;at_risk&quot;,
      keyResults: [
        {
          id: &quot;3a&quot;,
          title: &quot;Cost reduction&quot;,
          progress: 60,
          target: &quot;20%&quot;,
          current: &quot;12%&quot;,
          unit: &quot;reduction&quot;
        },
        {
          id: &quot;3b&quot;,
          title: &quot;Process automation&quot;,
          progress: 70,
          target: &quot;80%&quot;,
          current: &quot;56%&quot;,
          unit: &quot;automation&quot;
        },
        {
          id: &quot;3c&quot;,
          title: &quot;Quality maintenance&quot;,
          progress: 85,
          target: &quot;98%&quot;,
          current: &quot;96%&quot;,
          unit: &quot;quality&quot;
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case &quot;ahead&quot;: return &quot;bg-green-100 text-green-800 border-green-200&quot;;
      case &quot;on_track&quot;: return &quot;bg-teal-100 text-teal-800 border-teal-200&quot;;
      case &quot;at_risk&quot;: return &quot;bg-yellow-100 text-yellow-800 border-yellow-200&quot;;
      case &quot;behind&quot;: return &quot;bg-red-100 text-red-800 border-red-200&quot;;
      default: return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case &quot;ahead&quot;: return &quot;🚀&quot;;
      case &quot;on_track&quot;: return &quot;✅&quot;;
      case &quot;at_risk&quot;: return &quot;⚠️&quot;;
      case &quot;behind&quot;: return &quot;🔴&quot;;
      default: return &quot;📊&quot;;
    }
  };

  return (
    <div className=&quot;space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h2 className=&quot;text-2xl font-bold text-gray-900&quot;>Objectives & Key Results</h2>
          <p className=&quot;text-gray-600&quot;>Track goals and measure success across cannabis operations</p>
        </div>
        <Button className=&quot;gap-2 bg-gradient-to-r from-teal-500 to-purple-600&quot;>
          <Plus className=&quot;w-4 h-4&quot; />
          Create OKR
        </Button>
      </div>

      {/* OKR Summary Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-6&quot;>
        {okrs.map((okr) => (
          <Card 
            key={okr.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedOKR === okr.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedOKR(selectedOKR === okr.id ? null : okr.id)}
          >
            <CardHeader className=&quot;pb-3&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <CardTitle className=&quot;text-lg&quot;>{okr.title}</CardTitle>
                <Badge className={getStatusColor(okr.status)}>
                  {getStatusIcon(okr.status)} {okr.status.replace(&quot;_&quot;, &quot; &quot;)}
                </Badge>
              </div>
              <p className=&quot;text-sm text-gray-600&quot;>{okr.description}</p>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                {/* Progress */}
                <div>
                  <div className=&quot;flex items-center justify-between mb-2&quot;>
                    <span className=&quot;text-sm font-medium&quot;>Overall Progress</span>
                    <span className=&quot;text-sm font-bold text-blue-600&quot;>{okr.progress}%</span>
                  </div>
                  <Progress value={okr.progress} className=&quot;h-2&quot; />
                </div>

                {/* Key Info */}
                <div className=&quot;grid grid-cols-2 gap-4 text-sm&quot;>
                  <div>
                    <p className=&quot;text-gray-500&quot;>Target</p>
                    <p className=&quot;font-semibold&quot;>{okr.target}</p>
                  </div>
                  <div>
                    <p className=&quot;text-gray-500&quot;>Current</p>
                    <p className=&quot;font-semibold&quot;>{okr.current}</p>
                  </div>
                </div>

                {/* Owner and Due Date */}
                <div className=&quot;flex items-center justify-between text-sm text-gray-500&quot;>
                  <div className=&quot;flex items-center gap-1&quot;>
                    <Users className=&quot;w-4 h-4&quot; />
                    {okr.owner}
                  </div>
                  <div className=&quot;flex items-center gap-1&quot;>
                    <Calendar className=&quot;w-4 h-4&quot; />
                    {okr.dueDate}
                  </div>
                </div>

                {/* Expand Button */}
                <Button 
                  variant=&quot;outline&quot; 
                  size=&quot;sm&quot; 
                  className=&quot;w-full mt-4&quot;
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOKR(selectedOKR === okr.id ? null : okr.id);
                  }}
                >
                  {selectedOKR === okr.id ? 'Collapse' : 'View Details'}
                  <ArrowRight className=&quot;w-4 h-4 ml-1&quot; />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expanded OKR Details */}
      {selectedOKR && (
        <Card className=&quot;bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200&quot;>
          <CardHeader>
            <CardTitle className=&quot;flex items-center gap-2&quot;>
              <Target className=&quot;w-5 h-5&quot; />
              Key Results Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-6&quot;>
              {okrs.find(o => o.id === selectedOKR)?.keyResults.map((kr) => (
                <div key={kr.id} className=&quot;bg-white p-4 rounded-lg border&quot;>
                  <div className=&quot;flex items-center justify-between mb-3&quot;>
                    <h4 className=&quot;font-semibold&quot;>{kr.title}</h4>
                    <Badge variant=&quot;outline&quot; className=&quot;text-sm&quot;>
                      {kr.progress}% Complete
                    </Badge>
                  </div>
                  
                  <div className=&quot;grid grid-cols-2 gap-4 mb-3&quot;>
                    <div>
                      <p className=&quot;text-sm text-gray-500&quot;>Target</p>
                      <p className=&quot;font-semibold&quot;>{kr.target}</p>
                    </div>
                    <div>
                      <p className=&quot;text-sm text-gray-500&quot;>Current</p>
                      <p className=&quot;font-semibold&quot;>{kr.current}</p>
                    </div>
                  </div>
                  
                  <div className=&quot;space-y-2&quot;>
                    <div className=&quot;flex items-center justify-between&quot;>
                      <span className=&quot;text-sm text-gray-600&quot;>Progress</span>
                      <span className=&quot;text-sm font-medium&quot;>{kr.progress}%</span>
                    </div>
                    <Progress value={kr.progress} className=&quot;h-2&quot; />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
        <Card className=&quot;bg-gradient-to-br from-green-50 to-green-100 border-green-200&quot;>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm text-green-600 mb-1&quot;>Goals on Track</p>
                <p className=&quot;text-2xl font-bold text-green-800&quot;>{okrs.filter(o => o.status === 'on_track' || o.status === 'ahead').length}</p>
              </div>
              <TrendingUp className=&quot;w-8 h-8 text-green-500&quot; />
            </div>
          </CardContent>
        </Card>

        <Card className=&quot;bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200&quot;>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm text-yellow-600 mb-1&quot;>At Risk</p>
                <p className=&quot;text-2xl font-bold text-yellow-800&quot;>{okrs.filter(o => o.status === 'at_risk').length}</p>
              </div>
              <Target className=&quot;w-8 h-8 text-yellow-500&quot; />
            </div>
          </CardContent>
        </Card>

        <Card className=&quot;bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200&quot;>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm text-blue-600 mb-1&quot;>Avg Progress</p>
                <p className=&quot;text-2xl font-bold text-blue-800&quot;>{Math.round(okrs.reduce((acc, okr) => acc + okr.progress, 0) / okrs.length)}%</p>
              </div>
              <Users className=&quot;w-8 h-8 text-blue-500&quot; />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}