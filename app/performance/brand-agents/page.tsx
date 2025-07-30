'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface BrandAgent {
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
}

interface PerformanceData {
  brandAgents: BrandAgent[];
  period: string;
  periodValue: string;
  organizationId: string;
}

export default function BrandAgentPerformancePage() {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedPeriodValue, setSelectedPeriodValue] = useState(
    new Date().toISOString().substring(0, 7)
  );

  useEffect(() => {
    if (user) {
      fetchPerformanceData();
    }
  }, [user, selectedPeriod, selectedPeriodValue]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/performance/brand-agents?organizationId=f2983bcc-5e0f-4253-8560-6647c958fc0f&period=${selectedPeriod}&periodValue=${selectedPeriodValue}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }

      const data = await response.json();
      setPerformanceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
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

  if (loading) {
    return (
      <div className=&quot;container mx-auto px-4 py-8&quot;>
        <div className=&quot;animate-pulse&quot;>
          <div className=&quot;h-8 bg-gray-200 rounded w-1/4 mb-6&quot;></div>
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className=&quot;h-64 bg-gray-200 rounded-lg&quot;></div>
            ))}
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
            <Button 
              onClick={fetchPerformanceData} 
              className=&quot;mt-4&quot;
              variant=&quot;outline&quot;
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=&quot;container mx-auto px-4 py-8&quot;>
      <div className=&quot;flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold text-gray-900&quot;>Brand Agent Performance</h1>
          <p className=&quot;text-gray-600 mt-2&quot;>
            Track and analyze performance metrics for brand agents
          </p>
        </div>
        
        <div className=&quot;flex items-center gap-4&quot;>
          <div className=&quot;flex items-center gap-2&quot;>
            <Calendar className=&quot;h-4 w-4 text-gray-500&quot; />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className=&quot;w-32&quot;>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;monthly&quot;>Monthly</SelectItem>
                <SelectItem value=&quot;quarterly&quot;>Quarterly</SelectItem>
                <SelectItem value=&quot;yearly&quot;>Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <input
            type=&quot;month&quot;
            value={selectedPeriodValue}
            onChange={(e) => setSelectedPeriodValue(e.target.value)}
            className=&quot;px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500&quot;
          />
          
          <Button onClick={fetchPerformanceData} variant=&quot;outline&quot; size=&quot;sm&quot;>
            <Filter className=&quot;h-4 w-4 mr-2&quot; />
            Refresh
          </Button>
        </div>
      </div>

      {performanceData?.brandAgents.length === 0 ? (
        <Card>
          <CardContent className=&quot;pt-6&quot;>
            <div className=&quot;text-center py-8&quot;>
              <Users className=&quot;h-16 w-16 text-gray-400 mx-auto mb-4&quot; />
              <h3 className=&quot;text-lg font-medium text-gray-900 mb-2&quot;>No Brand Agents Found</h3>
              <p className=&quot;text-gray-600&quot;>
                No brand agents found for the selected period. Check your filters or try a different time period.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
          {performanceData?.brandAgents.map((agent) => {
            const badge = getPerformanceBadge(agent.overallPerformanceScore);
            
            return (
              <Card key={agent.id} className=&quot;hover:shadow-lg transition-shadow&quot;>
                <CardHeader className=&quot;pb-4&quot;>
                  <div className=&quot;flex items-center gap-3&quot;>
                    <Avatar className=&quot;h-12 w-12&quot;>
                      <AvatarImage src={agent.profileImageUrl} alt={agent.fullName} />
                      <AvatarFallback className=&quot;bg-purple-100 text-purple-600 font-semibold&quot;>
                        {agent.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className=&quot;flex-1&quot;>
                      <CardTitle className=&quot;text-lg&quot;>{agent.fullName}</CardTitle>
                      <CardDescription className=&quot;text-sm&quot;>{agent.email}</CardDescription>
                    </div>
                  </div>
                  
                  <div className=&quot;flex items-center justify-between mt-4&quot;>
                    <Badge variant={badge.variant} className=&quot;text-xs&quot;>
                      {badge.label}
                    </Badge>
                    <div className=&quot;flex items-center gap-1&quot;>
                      <Trophy className=&quot;h-4 w-4 text-yellow-500&quot; />
                      <span className=&quot;text-sm font-medium&quot;>
                        {formatRating(agent.overallPerformanceScore)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className=&quot;space-y-4&quot;>
                  {/* Performance Metrics */}
                  <div className=&quot;grid grid-cols-2 gap-4&quot;>
                    <div className=&quot;space-y-2&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Star className=&quot;h-4 w-4 text-yellow-500&quot; />
                        <span className=&quot;text-sm font-medium&quot;>Manager Review</span>
                      </div>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Progress 
                          value={agent.avgManagerReview ? (agent.avgManagerReview / 5) * 100 : 0} 
                          className=&quot;h-2 flex-1&quot;
                        />
                        <span className=&quot;text-sm text-gray-600 min-w-[3rem]&quot;>
                          {formatRating(agent.avgManagerReview)}
                        </span>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-2&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Clock className=&quot;h-4 w-4 text-blue-500&quot; />
                        <span className=&quot;text-sm font-medium&quot;>On-Time</span>
                      </div>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Progress 
                          value={agent.onTimePercentage || 0} 
                          className=&quot;h-2 flex-1&quot;
                        />
                        <span className=&quot;text-sm text-gray-600 min-w-[3rem]&quot;>
                          {formatPercentage(agent.onTimePercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-2&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <MapPin className=&quot;h-4 w-4 text-green-500&quot; />
                        <span className=&quot;text-sm font-medium&quot;>Location</span>
                      </div>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Progress 
                          value={agent.locationCompliancePercentage || 0} 
                          className=&quot;h-2 flex-1&quot;
                        />
                        <span className=&quot;text-sm text-gray-600 min-w-[3rem]&quot;>
                          {formatPercentage(agent.locationCompliancePercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className=&quot;space-y-2&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <CheckCircle className=&quot;h-4 w-4 text-purple-500&quot; />
                        <span className=&quot;text-sm font-medium&quot;>Activities</span>
                      </div>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Progress 
                          value={agent.activityCompletionPercentage || 0} 
                          className=&quot;h-2 flex-1&quot;
                        />
                        <span className=&quot;text-sm text-gray-600 min-w-[3rem]&quot;>
                          {formatPercentage(agent.activityCompletionPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className=&quot;flex gap-2 pt-4 border-t&quot;>
                    <Button 
                      variant=&quot;outline&quot; 
                      size=&quot;sm&quot; 
                      className=&quot;flex-1&quot;
                      onClick={() => window.open(`/performance/brand-agents/${agent.id}`, '_blank')}
                    >
                      <TrendingUp className=&quot;h-4 w-4 mr-2&quot; />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}