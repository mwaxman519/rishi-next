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
    if (user?.organizationId) {
      fetchPerformanceData();
    }
  }, [user?.organizationId, selectedPeriod, selectedPeriodValue]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/performance/brand-agents?organizationId=${user?.organizationId}&period=${selectedPeriod}&periodValue=${selectedPeriodValue}`
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
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
            <Button 
              onClick={fetchPerformanceData} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Agent Performance</h1>
          <p className="text-gray-600 mt-2">
            Track and analyze performance metrics for brand agents
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <input
            type="month"
            value={selectedPeriodValue}
            onChange={(e) => setSelectedPeriodValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          <Button onClick={fetchPerformanceData} variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {performanceData?.brandAgents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Brand Agents Found</h3>
              <p className="text-gray-600">
                No brand agents found for the selected period. Check your filters or try a different time period.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performanceData?.brandAgents.map((agent) => {
            const badge = getPerformanceBadge(agent.overallPerformanceScore);
            
            return (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={agent.profileImageUrl} alt={agent.fullName} />
                      <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                        {agent.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{agent.fullName}</CardTitle>
                      <CardDescription className="text-sm">{agent.email}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {formatRating(agent.overallPerformanceScore)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Manager Review</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={agent.avgManagerReview ? (agent.avgManagerReview / 5) * 100 : 0} 
                          className="h-2 flex-1"
                        />
                        <span className="text-sm text-gray-600 min-w-[3rem]">
                          {formatRating(agent.avgManagerReview)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">On-Time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={agent.onTimePercentage || 0} 
                          className="h-2 flex-1"
                        />
                        <span className="text-sm text-gray-600 min-w-[3rem]">
                          {formatPercentage(agent.onTimePercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Location</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={agent.locationCompliancePercentage || 0} 
                          className="h-2 flex-1"
                        />
                        <span className="text-sm text-gray-600 min-w-[3rem]">
                          {formatPercentage(agent.locationCompliancePercentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Activities</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={agent.activityCompletionPercentage || 0} 
                          className="h-2 flex-1"
                        />
                        <span className="text-sm text-gray-600 min-w-[3rem]">
                          {formatPercentage(agent.activityCompletionPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(`/performance/brand-agents/${agent.id}`, '_blank')}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
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