&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  BarChart,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
} from &quot;lucide-react&quot;;

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(&quot;/api/analytics/dashboard&quot;);
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error(&quot;Failed to fetch analytics:&quot;, error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className=&quot;container mx-auto p-6 max-w-7xl&quot;>
        <h1 className=&quot;text-3xl font-bold mb-6&quot;>Analytics Dashboard</h1>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6&quot;>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className=&quot;animate-pulse&quot;>
              <CardHeader className=&quot;pb-2&quot;>
                <div className=&quot;h-4 bg-muted rounded w-3/4&quot;></div>
              </CardHeader>
              <CardContent>
                <div className=&quot;h-8 bg-muted rounded w-1/2&quot;></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;container mx-auto p-6 max-w-7xl&quot;>
      <div className=&quot;mb-8&quot;>
        <h1 className=&quot;text-3xl font-bold text-foreground&quot;>
          Analytics Dashboard
        </h1>
        <p className=&quot;text-muted-foreground mt-2&quot;>
          Cannabis workforce management performance metrics and insights
        </p>
      </div>

      {analyticsData && (
        <>
          {/* Key Metrics */}
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8&quot;>
            <Card>
              <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                <CardTitle className=&quot;text-sm font-medium&quot;>
                  Total Bookings
                </CardTitle>
                <Calendar className=&quot;h-4 w-4 text-muted-foreground&quot; />
              </CardHeader>
              <CardContent>
                <div className=&quot;text-2xl font-bold&quot;>
                  {analyticsData.totalBookings}
                </div>
                <p className=&quot;text-xs text-muted-foreground&quot;>
                  Cannabis operations managed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                <CardTitle className=&quot;text-sm font-medium&quot;>
                  Active Staff
                </CardTitle>
                <Users className=&quot;h-4 w-4 text-muted-foreground&quot; />
              </CardHeader>
              <CardContent>
                <div className=&quot;text-2xl font-bold&quot;>
                  {analyticsData.activeStaff}
                </div>
                <p className=&quot;text-xs text-muted-foreground&quot;>
                  Brand agents available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                <CardTitle className=&quot;text-sm font-medium&quot;>
                  Monthly Revenue
                </CardTitle>
                <DollarSign className=&quot;h-4 w-4 text-muted-foreground&quot; />
              </CardHeader>
              <CardContent>
                <div className=&quot;text-2xl font-bold&quot;>
                  ${analyticsData.monthlyRevenue.toLocaleString()}
                </div>
                <p className=&quot;text-xs text-muted-foreground&quot;>
                  Cannabis workforce services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                <CardTitle className=&quot;text-sm font-medium&quot;>
                  Completion Rate
                </CardTitle>
                <BarChart className=&quot;h-4 w-4 text-muted-foreground&quot; />
              </CardHeader>
              <CardContent>
                <div className=&quot;text-2xl font-bold&quot;>
                  {analyticsData.completionRate}%
                </div>
                <p className=&quot;text-xs text-muted-foreground&quot;>
                  Successful operations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Locations */}
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-6&quot;>
            <Card>
              <CardHeader>
                <CardTitle className=&quot;flex items-center gap-2&quot;>
                  <MapPin className=&quot;h-5 w-5&quot; />
                  Top Cannabis Markets
                </CardTitle>
                <CardDescription>
                  Highest volume cannabis operational locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  {analyticsData.topLocations.map(
                    (location: any, index: number) => (
                      <div
                        key={location.name}
                        className=&quot;flex items-center justify-between&quot;
                      >
                        <div className=&quot;flex items-center gap-3&quot;>
                          <div className=&quot;flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium&quot;>
                            {index + 1}
                          </div>
                          <span className=&quot;font-medium&quot;>{location.name}</span>
                        </div>
                        <span className=&quot;text-muted-foreground&quot;>
                          {location.count} operations
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className=&quot;flex items-center gap-2&quot;>
                  <Clock className=&quot;h-5 w-5&quot; />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Last 24 hours operational activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  {analyticsData.recentActivity.map(
                    (activity: any, index: number) => (
                      <div
                        key={index}
                        className=&quot;flex items-center justify-between&quot;
                      >
                        <span className=&quot;capitalize&quot;>
                          {activity.type.replace(/_/g, &quot; &quot;)}
                        </span>
                        <div className=&quot;text-right&quot;>
                          <div className=&quot;font-medium&quot;>{activity.count}</div>
                          <div className=&quot;text-xs text-muted-foreground&quot;>
                            {activity.timeframe.replace(/_/g, &quot; &quot;)}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
