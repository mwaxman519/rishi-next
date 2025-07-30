&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { Card, CardContent, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Progress } from &quot;@/components/ui/progress&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
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
} from &quot;lucide-react&quot;;

interface ReviewCycle {
  id: string;
  name: string;
  status: &quot;draft&quot; | &quot;active&quot; | &quot;completed&quot;;
  startDate: string;
  endDate: string;
  participants: number;
  completed: number;
  type: &quot;quarterly&quot; | &quot;annual&quot; | &quot;custom&quot;;
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
  const [activeTab, setActiveTab] = useState(&quot;overview&quot;);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const reviewCycles: ReviewCycle[] = [
    {
      id: &quot;1&quot;,
      name: &quot;Q1 2025 Performance Review&quot;,
      status: &quot;active&quot;,
      startDate: &quot;2025-01-15&quot;,
      endDate: &quot;2025-02-15&quot;,
      participants: 45,
      completed: 32,
      type: &quot;quarterly&quot;
    },
    {
      id: &quot;2&quot;,
      name: &quot;Annual Review 2024&quot;,
      status: &quot;completed&quot;,
      startDate: &quot;2024-12-01&quot;,
      endDate: &quot;2024-12-31&quot;,
      participants: 48,
      completed: 48,
      type: &quot;annual&quot;
    },
    {
      id: &quot;3&quot;,
      name: &quot;Mid-Year Check-in&quot;,
      status: &quot;draft&quot;,
      startDate: &quot;2025-07-01&quot;,
      endDate: &quot;2025-07-31&quot;,
      participants: 0,
      completed: 0,
      type: &quot;custom&quot;
    }
  ];

  const mockReviews: Review360Data[] = [
    {
      employee: {
        id: &quot;1&quot;,
        name: &quot;Sarah Chen&quot;,
        role: &quot;Senior Brand Agent&quot;,
        department: &quot;Field Operations&quot;,
        avatar: &quot;/api/placeholder/40/40&quot;
      },
      overallScore: 4.3,
      reviewers: {
        self: 4.1,
        manager: 4.5,
        peers: 4.2,
        subordinates: 4.4
      },
      competencies: [
        { name: &quot;Cannabis Knowledge&quot;, score: 4.8, feedback: &quot;Exceptional product knowledge and industry expertise&quot;, category: &quot;Technical&quot; },
        { name: &quot;Customer Service&quot;, score: 4.2, feedback: &quot;Consistently delivers excellent customer experiences&quot;, category: &quot;Service&quot; },
        { name: &quot;Team Collaboration&quot;, score: 4.0, feedback: &quot;Good team player, could improve communication&quot;, category: &quot;Collaboration&quot; },
        { name: &quot;Problem Solving&quot;, score: 4.4, feedback: &quot;Quick to identify and resolve issues&quot;, category: &quot;Technical&quot; },
        { name: &quot;Leadership&quot;, score: 3.9, feedback: &quot;Shows potential, needs more confidence&quot;, category: &quot;Leadership&quot; }
      ],
      strengths: [
        &quot;Deep cannabis industry knowledge&quot;,
        &quot;Strong customer relationship building&quot;,
        &quot;Reliable and consistent performance&quot;,
        &quot;Excellent problem-solving abilities&quot;
      ],
      areasForImprovement: [
        &quot;Public speaking and presentation skills&quot;,
        &quot;Delegation and team leadership&quot;,
        &quot;Strategic thinking and planning&quot;
      ],
      goals: [
        &quot;Complete advanced leadership training&quot;,
        &quot;Increase customer satisfaction scores by 5%&quot;,
        &quot;Mentor 2 junior team members&quot;
      ]
    },
    {
      employee: {
        id: &quot;2&quot;,
        name: &quot;Mike Rodriguez&quot;,
        role: &quot;Field Manager&quot;,
        department: &quot;Operations&quot;,
        avatar: &quot;/api/placeholder/40/40&quot;
      },
      overallScore: 4.6,
      reviewers: {
        self: 4.3,
        manager: 4.8,
        peers: 4.5,
        subordinates: 4.7
      },
      competencies: [
        { name: &quot;Team Management&quot;, score: 4.7, feedback: &quot;Excellent at motivating and developing team members&quot;, category: &quot;Leadership&quot; },
        { name: &quot;Operational Excellence&quot;, score: 4.5, feedback: &quot;Consistently meets operational targets&quot;, category: &quot;Operations&quot; },
        { name: &quot;Communication&quot;, score: 4.6, feedback: &quot;Clear and effective communicator&quot;, category: &quot;Communication&quot; },
        { name: &quot;Strategic Planning&quot;, score: 4.2, feedback: &quot;Good strategic thinking with room for improvement&quot;, category: &quot;Strategic&quot; },
        { name: &quot;Cannabis Compliance&quot;, score: 4.8, feedback: &quot;Expert knowledge of cannabis regulations&quot;, category: &quot;Compliance&quot; }
      ],
      strengths: [
        &quot;Outstanding team leadership&quot;,
        &quot;Strong operational management&quot;,
        &quot;Excellent communication skills&quot;,
        &quot;Deep compliance knowledge&quot;
      ],
      areasForImprovement: [
        &quot;Long-term strategic planning&quot;,
        &quot;Cross-functional collaboration&quot;,
        &quot;Technology adoption&quot;
      ],
      goals: [
        &quot;Implement team productivity improvements&quot;,
        &quot;Complete strategic management certification&quot;,
        &quot;Improve cross-departmental partnerships&quot;
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case &quot;active&quot;: return &quot;bg-green-100 text-green-800&quot;;
      case &quot;completed&quot;: return &quot;bg-teal-100 text-teal-800&quot;;
      case &quot;draft&quot;: return &quot;bg-gray-100 text-gray-800&quot;;
      default: return &quot;bg-gray-100 text-gray-800&quot;;
    }
  };

  const getCompetencyColor = (score: number) => {
    if (score >= 4.5) return &quot;text-green-600&quot;;
    if (score >= 4.0) return &quot;text-teal-600&quot;;
    if (score >= 3.5) return &quot;text-yellow-600&quot;;
    return &quot;text-red-600&quot;;
  };

  const renderRadarChart = (data: Review360Data) => {
    const reviewerTypes = Object.keys(data.reviewers);
    const maxScore = 5;
    
    return (
      <div className=&quot;relative w-48 h-48 mx-auto&quot;>
        {/* Radar chart visualization would go here */}
        <div className=&quot;absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-teal-50 rounded-full&quot;>
          <div className=&quot;text-center&quot;>
            <div className=&quot;text-3xl font-bold text-purple-600&quot;>{data.overallScore}</div>
            <div className=&quot;text-sm text-gray-600&quot;>Overall Score</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=&quot;space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h2 className=&quot;text-2xl font-bold text-gray-900&quot;>360° Performance Reviews</h2>
          <p className=&quot;text-gray-600&quot;>Comprehensive multi-perspective performance evaluations</p>
        </div>
        <Button className=&quot;gap-2 bg-gradient-to-r from-blue-500 to-purple-600&quot;>
          <Radar className=&quot;w-4 h-4&quot; />
          New Review Cycle
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className=&quot;space-y-6&quot;>
        <TabsList className=&quot;grid w-full grid-cols-4&quot;>
          <TabsTrigger value=&quot;overview&quot;>Overview</TabsTrigger>
          <TabsTrigger value=&quot;cycles&quot;>Review Cycles</TabsTrigger>
          <TabsTrigger value=&quot;reviews&quot;>Individual Reviews</TabsTrigger>
          <TabsTrigger value=&quot;analytics&quot;>Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value=&quot;overview&quot; className=&quot;space-y-6&quot;>
          {/* Summary Statistics */}
          <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
            <Card className=&quot;bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200&quot;>
              <CardContent className=&quot;p-4&quot;>
                <div className=&quot;flex items-center justify-between&quot;>
                  <div>
                    <p className=&quot;text-sm text-blue-600 mb-1&quot;>Active Reviews</p>
                    <p className=&quot;text-2xl font-bold text-blue-800&quot;>32</p>
                  </div>
                  <Eye className=&quot;w-8 h-8 text-blue-500&quot; />
                </div>
              </CardContent>
            </Card>
            
            <Card className=&quot;bg-gradient-to-br from-green-50 to-green-100 border-green-200&quot;>
              <CardContent className=&quot;p-4&quot;>
                <div className=&quot;flex items-center justify-between&quot;>
                  <div>
                    <p className=&quot;text-sm text-green-600 mb-1&quot;>Completed</p>
                    <p className=&quot;text-2xl font-bold text-green-800&quot;>48</p>
                  </div>
                  <CheckCircle className=&quot;w-8 h-8 text-green-500&quot; />
                </div>
              </CardContent>
            </Card>
            
            <Card className=&quot;bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200&quot;>
              <CardContent className=&quot;p-4&quot;>
                <div className=&quot;flex items-center justify-between&quot;>
                  <div>
                    <p className=&quot;text-sm text-purple-600 mb-1&quot;>Avg Score</p>
                    <p className=&quot;text-2xl font-bold text-purple-800&quot;>4.2</p>
                  </div>
                  <Star className=&quot;w-8 h-8 text-purple-500&quot; />
                </div>
              </CardContent>
            </Card>
            
            <Card className=&quot;bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200&quot;>
              <CardContent className=&quot;p-4&quot;>
                <div className=&quot;flex items-center justify-between&quot;>
                  <div>
                    <p className=&quot;text-sm text-yellow-600 mb-1&quot;>Pending</p>
                    <p className=&quot;text-2xl font-bold text-yellow-800&quot;>13</p>
                  </div>
                  <Clock className=&quot;w-8 h-8 text-yellow-500&quot; />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center gap-2&quot;>
                <UserCheck className=&quot;w-5 h-5&quot; />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                {mockReviews.map((review) => (
                  <div key={review.employee.id} className=&quot;flex items-center justify-between p-4 bg-gray-50 rounded-lg&quot;>
                    <div className=&quot;flex items-center gap-3&quot;>
                      <Avatar className=&quot;w-12 h-12&quot;>
                        <AvatarImage src={review.employee.avatar} alt={review.employee.name} />
                        <AvatarFallback>{review.employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className=&quot;font-semibold&quot;>{review.employee.name}</p>
                        <p className=&quot;text-sm text-gray-600&quot;>{review.employee.role}</p>
                        <p className=&quot;text-sm text-gray-500&quot;>{review.employee.department}</p>
                      </div>
                    </div>
                    <div className=&quot;text-right&quot;>
                      <div className=&quot;flex items-center gap-2 mb-1&quot;>
                        <Star className=&quot;w-4 h-4 text-yellow-500 fill-current&quot; />
                        <span className=&quot;font-bold text-lg&quot;>{review.overallScore}</span>
                      </div>
                      <Badge variant=&quot;secondary&quot;>Completed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Cycles Tab */}
        <TabsContent value=&quot;cycles&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center gap-2&quot;>
                <Calendar className=&quot;w-5 h-5&quot; />
                Review Cycles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                {reviewCycles.map((cycle) => (
                  <div key={cycle.id} className=&quot;p-4 border rounded-lg&quot;>
                    <div className=&quot;flex items-center justify-between mb-3&quot;>
                      <div>
                        <h3 className=&quot;font-semibold&quot;>{cycle.name}</h3>
                        <p className=&quot;text-sm text-gray-600&quot;>
                          {cycle.startDate} - {cycle.endDate}
                        </p>
                      </div>
                      <Badge className={getStatusColor(cycle.status)}>
                        {cycle.status}
                      </Badge>
                    </div>
                    
                    <div className=&quot;grid grid-cols-2 gap-4 mb-4&quot;>
                      <div>
                        <p className=&quot;text-sm text-gray-600&quot;>Participants</p>
                        <p className=&quot;font-semibold&quot;>{cycle.participants}</p>
                      </div>
                      <div>
                        <p className=&quot;text-sm text-gray-600&quot;>Completed</p>
                        <p className=&quot;font-semibold&quot;>{cycle.completed}</p>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-2&quot;>
                      <div className=&quot;flex justify-between&quot;>
                        <span className=&quot;text-sm&quot;>Progress</span>
                        <span className=&quot;text-sm font-medium&quot;>
                          {cycle.participants > 0 ? Math.round((cycle.completed / cycle.participants) * 100) : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={cycle.participants > 0 ? (cycle.completed / cycle.participants) * 100 : 0} 
                        className=&quot;h-2&quot;
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Reviews Tab */}
        <TabsContent value=&quot;reviews&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-6&quot;>
            {mockReviews.map((review) => (
              <Card key={review.employee.id} className=&quot;cursor-pointer hover:shadow-lg transition-shadow&quot;>
                <CardHeader>
                  <div className=&quot;flex items-center gap-3&quot;>
                    <Avatar className=&quot;w-12 h-12&quot;>
                      <AvatarImage src={review.employee.avatar} alt={review.employee.name} />
                      <AvatarFallback>{review.employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className=&quot;text-lg&quot;>{review.employee.name}</CardTitle>
                      <p className=&quot;text-sm text-gray-600&quot;>{review.employee.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className=&quot;space-y-6&quot;>
                    {/* Overall Score */}
                    <div className=&quot;text-center&quot;>
                      <div className=&quot;text-3xl font-bold text-blue-600 mb-1&quot;>{review.overallScore}</div>
                      <p className=&quot;text-sm text-gray-600&quot;>Overall Score</p>
                    </div>

                    {/* Reviewer Breakdown */}
                    <div className=&quot;grid grid-cols-2 gap-4&quot;>
                      <div className=&quot;space-y-3&quot;>
                        <div className=&quot;flex justify-between&quot;>
                          <span className=&quot;text-sm&quot;>Self</span>
                          <span className=&quot;font-medium&quot;>{review.reviewers.self}</span>
                        </div>
                        <div className=&quot;flex justify-between&quot;>
                          <span className=&quot;text-sm&quot;>Manager</span>
                          <span className=&quot;font-medium&quot;>{review.reviewers.manager}</span>
                        </div>
                      </div>
                      <div className=&quot;space-y-3&quot;>
                        <div className=&quot;flex justify-between&quot;>
                          <span className=&quot;text-sm&quot;>Peers</span>
                          <span className=&quot;font-medium&quot;>{review.reviewers.peers}</span>
                        </div>
                        <div className=&quot;flex justify-between&quot;>
                          <span className=&quot;text-sm&quot;>Subordinates</span>
                          <span className=&quot;font-medium&quot;>{review.reviewers.subordinates}</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Competencies */}
                    <div>
                      <h4 className=&quot;font-semibold mb-3&quot;>Top Competencies</h4>
                      <div className=&quot;space-y-2&quot;>
                        {review.competencies.slice(0, 3).map((comp, index) => (
                          <div key={index} className=&quot;flex items-center justify-between&quot;>
                            <span className=&quot;text-sm&quot;>{comp.name}</span>
                            <span className={`font-medium ${getCompetencyColor(comp.score)}`}>
                              {comp.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button variant=&quot;outline&quot; className=&quot;w-full&quot;>
                      View Full Review
                      <ArrowRight className=&quot;w-4 h-4 ml-2&quot; />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value=&quot;analytics&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center gap-2&quot;>
                <BarChart3 className=&quot;w-5 h-5&quot; />
                Review Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;text-center py-12&quot;>
                <div className=&quot;w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4&quot;>
                  <BarChart3 className=&quot;w-12 h-12 text-white&quot; />
                </div>
                <h3 className=&quot;text-xl font-semibold mb-2&quot;>Advanced Analytics</h3>
                <p className=&quot;text-gray-600 mb-6&quot;>Performance trends and insights coming soon</p>
                <Button className=&quot;bg-gradient-to-r from-purple-500 to-pink-600&quot;>
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