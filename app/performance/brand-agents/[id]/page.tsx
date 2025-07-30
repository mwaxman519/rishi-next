'use client';

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
      <div className=&quot;container mx-auto px-4 py-8&quot;>
        <div className=&quot;animate-pulse&quot;>
          <div className=&quot;h-8 bg-gray-200 rounded w-1/4 mb-6&quot;></div>
          <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-6&quot;>
            <div className=&quot;lg:col-span-2 space-y-6&quot;>
              <div className=&quot;h-64 bg-gray-200 rounded-lg&quot;></div>
              <div className=&quot;h-96 bg-gray-200 rounded-lg&quot;></div>
            </div>
            <div className=&quot;space-y-6&quot;>
              <div className=&quot;h-32 bg-gray-200 rounded-lg&quot;></div>
              <div className=&quot;h-64 bg-gray-200 rounded-lg&quot;></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=&quot;container mx-auto px-4 py-8&quot;>
        <Card className=&quot;border-red-200 bg-red-50&quot;>
          <CardContent className=&quot;pt-6&quot;>
            <div className=&quot;flex items-center gap-2 text-red-600&quot;>
              <span className=&quot;font-medium&quot;>Error:</span>
              <span>{error}</span>
            </div>
            <div className=&quot;flex gap-2 mt-4&quot;>
              <Button onClick={fetchAgentDetails} variant=&quot;outline&quot;>
                Try Again
              </Button>
              <Button asChild variant=&quot;outline&quot;>
                <Link href=&quot;/performance/brand-agents&quot;>
                  <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
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
      <div className=&quot;container mx-auto px-4 py-8&quot;>
        <Card>
          <CardContent className=&quot;pt-6&quot;>
            <div className=&quot;text-center py-8&quot;>
              <Users className=&quot;h-16 w-16 text-gray-400 mx-auto mb-4&quot; />
              <h3 className=&quot;text-lg font-medium text-gray-900 mb-2&quot;>Brand Agent Not Found</h3>
              <p className=&quot;text-gray-600 mb-4&quot;>
                The requested brand agent could not be found or you don&apos;t have permission to view their details.
              </p>
              <Button asChild variant=&quot;outline&quot;>
                <Link href=&quot;/performance/brand-agents&quot;>
                  <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
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
    <div className=&quot;container mx-auto px-4 py-8&quot;>
      <div className=&quot;flex items-center gap-4 mb-8&quot;>
        <Button asChild variant=&quot;outline&quot; size=&quot;sm&quot;>
          <Link href=&quot;/performance/brand-agents&quot;>
            <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
            Back
          </Link>
        </Button>
        <div>
          <h1 className=&quot;text-3xl font-bold text-gray-900&quot;>Brand Agent Performance</h1>
          <p className=&quot;text-gray-600 mt-1&quot;>Detailed performance metrics and analytics</p>
        </div>
      </div>

      <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-8&quot;>
        {/* Main Content */}
        <div className=&quot;lg:col-span-2 space-y-6&quot;>
          {/* Agent Profile */}
          <Card>
            <CardHeader>
              <div className=&quot;flex items-center gap-4&quot;>
                <Avatar className=&quot;h-16 w-16&quot;>
                  <AvatarImage src={agentDetails.profileImageUrl} alt={agentDetails.fullName} />
                  <AvatarFallback className=&quot;bg-purple-100 text-purple-600 font-semibold text-lg&quot;>
                    {agentDetails.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className=&quot;flex-1&quot;>
                  <CardTitle className=&quot;text-2xl&quot;>{agentDetails.fullName}</CardTitle>
                  <CardDescription className=&quot;text-base&quot;>{agentDetails.email}</CardDescription>
                  <div className=&quot;flex items-center gap-4 mt-3&quot;>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <div className=&quot;flex items-center gap-2&quot;>
                      <Trophy className=&quot;h-4 w-4 text-yellow-500&quot; />
                      <span className=&quot;font-medium&quot;>{formatRating(agentDetails.overallPerformanceScore)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Performance Metrics */}
          <Tabs defaultValue=&quot;overview&quot; className=&quot;w-full&quot;>
            <TabsList className=&quot;grid w-full grid-cols-3&quot;>
              <TabsTrigger value=&quot;overview&quot;>Overview</TabsTrigger>
              <TabsTrigger value=&quot;activities&quot;>Activities</TabsTrigger>
              <TabsTrigger value=&quot;history&quot;>History</TabsTrigger>
            </TabsList>
            
            <TabsContent value=&quot;overview&quot; className=&quot;space-y-6&quot;>
              <Card>
                <CardHeader>
                  <CardTitle className=&quot;flex items-center gap-2&quot;>
                    <BarChart3 className=&quot;h-5 w-5&quot; />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className=&quot;space-y-6&quot;>
                  <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                    <div className=&quot;space-y-3&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Star className=&quot;h-4 w-4 text-yellow-500&quot; />
                        <span className=&quot;font-medium&quot;>Manager Reviews</span>
                      </div>
                      <div className=&quot;flex items-center gap-3&quot;>
                        <Progress 
                          value={agentDetails.avgManagerReview ? (agentDetails.avgManagerReview / 5) * 100 : 0} 
                          className=&quot;h-3 flex-1&quot;
                        />
                        <span className=&quot;text-sm font-medium min-w-[3rem]&quot;>
                          {formatRating(agentDetails.avgManagerReview)}
                        </span>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-3&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Clock className=&quot;h-4 w-4 text-blue-500&quot; />
                        <span className=&quot;font-medium&quot;>On-Time Performance</span>
                      </div>
                      <div className=&quot;flex items-center gap-3&quot;>
                        <Progress 
                          value={agentDetails.onTimePercentage || 0} 
                          className=&quot;h-3 flex-1&quot;
                        />
                        <span className=&quot;text-sm font-medium min-w-[3rem]&quot;>
                          {formatPercentage(agentDetails.onTimePercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-3&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <MapPin className=&quot;h-4 w-4 text-green-500&quot; />
                        <span className=&quot;font-medium&quot;>Location Compliance</span>
                      </div>
                      <div className=&quot;flex items-center gap-3&quot;>
                        <Progress 
                          value={agentDetails.locationCompliancePercentage || 0} 
                          className=&quot;h-3 flex-1&quot;
                        />
                        <span className=&quot;text-sm font-medium min-w-[3rem]&quot;>
                          {formatPercentage(agentDetails.locationCompliancePercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-3&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Star className=&quot;h-4 w-4 text-purple-500&quot; />
                        <span className=&quot;font-medium&quot;>Dispensary Ratings</span>
                      </div>
                      <div className=&quot;flex items-center gap-3&quot;>
                        <Progress 
                          value={agentDetails.avgDispensaryRating ? (agentDetails.avgDispensaryRating / 5) * 100 : 0} 
                          className=&quot;h-3 flex-1&quot;
                        />
                        <span className=&quot;text-sm font-medium min-w-[3rem]&quot;>
                          {formatRating(agentDetails.avgDispensaryRating)}
                        </span>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-3&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Users className=&quot;h-4 w-4 text-orange-500&quot; />
                        <span className=&quot;font-medium&quot;>Staff Ratings</span>
                      </div>
                      <div className=&quot;flex items-center gap-3&quot;>
                        <Progress 
                          value={agentDetails.avgStaffRating ? (agentDetails.avgStaffRating / 5) * 100 : 0} 
                          className=&quot;h-3 flex-1&quot;
                        />
                        <span className=&quot;text-sm font-medium min-w-[3rem]&quot;>
                          {formatRating(agentDetails.avgStaffRating)}
                        </span>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-3&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <CheckCircle className=&quot;h-4 w-4 text-teal-500&quot; />
                        <span className=&quot;font-medium&quot;>Activity Completion</span>
                      </div>
                      <div className=&quot;flex items-center gap-3&quot;>
                        <Progress 
                          value={agentDetails.activityCompletionPercentage || 0} 
                          className=&quot;h-3 flex-1&quot;
                        />
                        <span className=&quot;text-sm font-medium min-w-[3rem]&quot;>
                          {formatPercentage(agentDetails.activityCompletionPercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-3&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <FileText className=&quot;h-4 w-4 text-indigo-500&quot; />
                        <span className=&quot;font-medium&quot;>Data Form Completion</span>
                      </div>
                      <div className=&quot;flex items-center gap-3&quot;>
                        <Progress 
                          value={agentDetails.dataFormCompletionPercentage || 0} 
                          className=&quot;h-3 flex-1&quot;
                        />
                        <span className=&quot;text-sm font-medium min-w-[3rem]&quot;>
                          {formatPercentage(agentDetails.dataFormCompletionPercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-3&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Target className=&quot;h-4 w-4 text-pink-500&quot; />
                        <span className=&quot;font-medium&quot;>Data Form Quality</span>
                      </div>
                      <div className=&quot;flex items-center gap-3&quot;>
                        <Progress 
                          value={agentDetails.avgDataFormQualityRating ? (agentDetails.avgDataFormQualityRating / 5) * 100 : 0} 
                          className=&quot;h-3 flex-1&quot;
                        />
                        <span className=&quot;text-sm font-medium min-w-[3rem]&quot;>
                          {formatRating(agentDetails.avgDataFormQualityRating)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value=&quot;activities&quot; className=&quot;space-y-6&quot;>
              <Card>
                <CardHeader>
                  <CardTitle className=&quot;flex items-center gap-2&quot;>
                    <Activity className=&quot;h-5 w-5&quot; />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {agentDetails.recentActivities?.length ? (
                    <div className=&quot;space-y-4&quot;>
                      {agentDetails.recentActivities.map((activity) => (
                        <div key={activity.id} className=&quot;flex items-center justify-between p-4 bg-gray-50 rounded-lg&quot;>
                          <div>
                            <h4 className=&quot;font-medium&quot;>{activity.name}</h4>
                            <p className=&quot;text-sm text-gray-600&quot;>
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
                    <p className=&quot;text-gray-600 text-center py-8&quot;>No recent activities found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value=&quot;history&quot; className=&quot;space-y-6&quot;>
              <Card>
                <CardHeader>
                  <CardTitle className=&quot;flex items-center gap-2&quot;>
                    <TrendingUp className=&quot;h-5 w-5&quot; />
                    Performance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {agentDetails.performanceHistory?.length ? (
                    <div className=&quot;space-y-4&quot;>
                      {agentDetails.performanceHistory.map((entry, index) => (
                        <div key={index} className=&quot;flex items-center justify-between p-4 bg-gray-50 rounded-lg&quot;>
                          <div>
                            <h4 className=&quot;font-medium&quot;>{entry.period}</h4>
                            <p className=&quot;text-sm text-gray-600&quot;>
                              Calculated: {formatDate(entry.calculatedAt)}
                            </p>
                          </div>
                          <div className=&quot;flex items-center gap-2&quot;>
                            <div className={`w-3 h-3 rounded-full ${getPerformanceColor(entry.score)}`}></div>
                            <span className=&quot;font-medium&quot;>{formatRating(entry.score)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className=&quot;text-gray-600 text-center py-8&quot;>No performance history available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className=&quot;space-y-6&quot;>
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <span className=&quot;text-sm text-gray-600&quot;>Total Bookings</span>
                <span className=&quot;font-medium&quot;>{agentDetails.totalBookings || 0}</span>
              </div>
              <div className=&quot;flex items-center justify-between&quot;>
                <span className=&quot;text-sm text-gray-600&quot;>Activities Completed</span>
                <span className=&quot;font-medium&quot;>{agentDetails.totalActivitiesCompleted || 0}</span>
              </div>
              <div className=&quot;flex items-center justify-between&quot;>
                <span className=&quot;text-sm text-gray-600&quot;>Data Forms Submitted</span>
                <span className=&quot;font-medium&quot;>{agentDetails.totalDataFormsSubmitted || 0}</span>
              </div>
              <div className=&quot;flex items-center justify-between&quot;>
                <span className=&quot;text-sm text-gray-600&quot;>Last Updated</span>
                <span className=&quot;font-medium&quot;>{formatDate(agentDetails.calculatedAt)}</span>
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
                <div className=&quot;space-y-4&quot;>
                  {agentDetails.recentBookings.map((booking) => (
                    <div key={booking.id} className=&quot;space-y-2&quot;>
                      <div className=&quot;flex items-center justify-between&quot;>
                        <h4 className=&quot;font-medium text-sm&quot;>{booking.locationName}</h4>
                        <Badge variant={booking.onTime ? 'default' : 'destructive'} className=&quot;text-xs&quot;>
                          {booking.onTime ? 'On Time' : 'Late'}
                        </Badge>
                      </div>
                      <p className=&quot;text-xs text-gray-600&quot;>{formatDate(booking.scheduledAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className=&quot;text-gray-600 text-center py-4 text-sm&quot;>No recent bookings</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}