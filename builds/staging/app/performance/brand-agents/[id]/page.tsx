'use client';

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  FileText, 
  Trophy,
  TrendingUp,
  Calendar,
  ArrowLeft,
  BarChart3,
  Activity,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface BrandAgentDetails {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string;
  // Performance metrics
  avgManagerReview?: number;
  onTimePercentage?: number;
  locationCompliancePercentage?: number;
  avgDispensaryRating?: number;
  avgStaffRating?: number;
  activityCompletionPercentage?: number;
  dataFormCompletionPercentage?: number;
  avgDataFormQualityRating?: number;
  overallPerformanceScore?: number;
  calculatedAt?: string;
  // Additional details
  totalBookings?: number;
  totalActivitiesCompleted?: number;
  totalDataFormsSubmitted?: number;
  recentBookings?: Array<{
    id: string;
    locationName: string;
    scheduledAt: string;
    status: string;
    onTime: boolean;
  }>;
  recentActivities?: Array<{
    id: string;
    name: string;
    completedAt: string;
    status: string;
  }>;
  performanceHistory?: Array<{
    period: string;
    score: number;
    calculatedAt: string;
  }>;
}

export default function BrandAgentDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [agentDetails, setAgentDetails] = useState<BrandAgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id && user?.organizationId) {
      fetchAgentDetails();
    }
  }, [params.id, user?.organizationId]);

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/performance/brand-agents/${params.id}?organizationId=${user?.organizationId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch agent details');
      }

      const data = await response.json();
      setAgentDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent details');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score?: number) => {
    if (!score) return 'bg-gray-500';
    if (score >= 4.5) return 'bg-green-500';
    if (score >= 4.0) return 'bg-lime-500';
    if (score >= 3.5) return 'bg-yellow-500';
    if (score >= 3.0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPerformanceBadge = (score?: number) => {
    if (!score) return { label: 'No Data', variant: 'secondary' as const };
    if (score >= 4.5) return { label: 'Excellent', variant: 'success' as const };
    if (score >= 4.0) return { label: 'Good', variant: 'default' as const };
    if (score >= 3.5) return { label: 'Average', variant: 'secondary' as const };
    if (score >= 3.0) return { label: 'Below Average', variant: 'warning' as const };
    return { label: 'Poor', variant: 'destructive' as const };
  };

  const formatPercentage = (value?: number) => {
    return value ? `${Math.round(value)}%` : 'N/A';
  };

  const formatRating = (value?: number) => {
    return value ? value.toFixed(1) : 'N/A';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={fetchAgentDetails} variant="outline">
                Try Again
              </Button>
              <Button asChild variant="outline">
                <Link href="/performance/brand-agents">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Performance
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agentDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Brand Agent Not Found</h3>
              <p className="text-gray-600 mb-4">
                The requested brand agent could not be found or you don't have permission to view their details.
              </p>
              <Button asChild variant="outline">
                <Link href="/performance/brand-agents">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Performance
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const badge = getPerformanceBadge(agentDetails.overallPerformanceScore);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/performance/brand-agents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Agent Performance</h1>
          <p className="text-gray-600 mt-1">Detailed performance metrics and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={agentDetails.profileImageUrl} alt={agentDetails.fullName} />
                  <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold text-lg">
                    {agentDetails.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{agentDetails.fullName}</CardTitle>
                  <CardDescription className="text-base">{agentDetails.email}</CardDescription>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{formatRating(agentDetails.overallPerformanceScore)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Performance Metrics */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">Manager Reviews</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={agentDetails.avgManagerReview ? (agentDetails.avgManagerReview / 5) * 100 : 0} 
                          className="h-3 flex-1"
                        />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {formatRating(agentDetails.avgManagerReview)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">On-Time Performance</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={agentDetails.onTimePercentage || 0} 
                          className="h-3 flex-1"
                        />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {formatPercentage(agentDetails.onTimePercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Location Compliance</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={agentDetails.locationCompliancePercentage || 0} 
                          className="h-3 flex-1"
                        />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {formatPercentage(agentDetails.locationCompliancePercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Dispensary Ratings</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={agentDetails.avgDispensaryRating ? (agentDetails.avgDispensaryRating / 5) * 100 : 0} 
                          className="h-3 flex-1"
                        />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {formatRating(agentDetails.avgDispensaryRating)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">Staff Ratings</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={agentDetails.avgStaffRating ? (agentDetails.avgStaffRating / 5) * 100 : 0} 
                          className="h-3 flex-1"
                        />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {formatRating(agentDetails.avgStaffRating)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500" />
                        <span className="font-medium">Activity Completion</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={agentDetails.activityCompletionPercentage || 0} 
                          className="h-3 flex-1"
                        />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {formatPercentage(agentDetails.activityCompletionPercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">Data Form Completion</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={agentDetails.dataFormCompletionPercentage || 0} 
                          className="h-3 flex-1"
                        />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {formatPercentage(agentDetails.dataFormCompletionPercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-pink-500" />
                        <span className="font-medium">Data Form Quality</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={agentDetails.avgDataFormQualityRating ? (agentDetails.avgDataFormQualityRating / 5) * 100 : 0} 
                          className="h-3 flex-1"
                        />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {formatRating(agentDetails.avgDataFormQualityRating)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {agentDetails.recentActivities?.length ? (
                    <div className="space-y-4">
                      {agentDetails.recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{activity.name}</h4>
                            <p className="text-sm text-gray-600">
                              Completed: {formatDate(activity.completedAt)}
                            </p>
                          </div>
                          <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No recent activities found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {agentDetails.performanceHistory?.length ? (
                    <div className="space-y-4">
                      {agentDetails.performanceHistory.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{entry.period}</h4>
                            <p className="text-sm text-gray-600">
                              Calculated: {formatDate(entry.calculatedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getPerformanceColor(entry.score)}`}></div>
                            <span className="font-medium">{formatRating(entry.score)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No performance history available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <span className="font-medium">{agentDetails.totalBookings || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Activities Completed</span>
                <span className="font-medium">{agentDetails.totalActivitiesCompleted || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Forms Submitted</span>
                <span className="font-medium">{agentDetails.totalDataFormsSubmitted || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="font-medium">{formatDate(agentDetails.calculatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {agentDetails.recentBookings?.length ? (
                <div className="space-y-4">
                  {agentDetails.recentBookings.map((booking) => (
                    <div key={booking.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{booking.locationName}</h4>
                        <Badge variant={booking.onTime ? 'default' : 'destructive'} className="text-xs">
                          {booking.onTime ? 'On Time' : 'Late'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{formatDate(booking.scheduledAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4 text-sm">No recent bookings</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}