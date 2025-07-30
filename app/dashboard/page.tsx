'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Package, 
  TrendingUp, 
  BarChart3,
  Trophy,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className=&quot;container mx-auto px-4 py-8&quot;>
      <div className=&quot;mb-8&quot;>
        <h1 className=&quot;text-3xl font-bold text-foreground mb-2&quot;>Dashboard</h1>
        <p className=&quot;text-muted-foreground&quot;>Welcome back, {user?.fullName || 'User'}!</p>
      </div>

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
        {/* Brand Agent Performance */}
        <Card className=&quot;hover:shadow-lg transition-shadow&quot;>
          <CardHeader className=&quot;pb-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div className=&quot;flex items-center gap-3&quot;>
                <div className=&quot;p-2 bg-purple-100 dark:bg-purple-900 rounded-lg&quot;>
                  <Trophy className=&quot;h-6 w-6 text-purple-600 dark:text-purple-400&quot; />
                </div>
                <div>
                  <CardTitle className=&quot;text-lg&quot;>Brand Agent Performance</CardTitle>
                  <CardDescription>Track and analyze performance metrics</CardDescription>
                </div>
              </div>
              <Badge variant=&quot;secondary&quot; className=&quot;bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400&quot;>
                New
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className=&quot;text-sm text-muted-foreground mb-4&quot;>
              Monitor 8 key performance metrics including manager reviews, on-time performance, 
              location compliance, and more.
            </p>
            <div className=&quot;space-y-2 mb-4&quot;>
              <div className=&quot;flex items-center gap-2 text-sm&quot;>
                <Target className=&quot;h-4 w-4 text-green-500&quot; />
                <span>Manager Reviews (1-5)</span>
              </div>
              <div className=&quot;flex items-center gap-2 text-sm&quot;>
                <TrendingUp className=&quot;h-4 w-4 text-blue-500&quot; />
                <span>On-time Performance (%)</span>
              </div>
              <div className=&quot;flex items-center gap-2 text-sm&quot;>
                <BarChart3 className=&quot;h-4 w-4 text-purple-500&quot; />
                <span>Overall Performance Score</span>
              </div>
            </div>
            <Button asChild className=&quot;w-full&quot;>
              <Link href=&quot;/performance/brand-agents&quot;>
                View Performance Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Workforce Management */}
        <Card className=&quot;hover:shadow-lg transition-shadow&quot;>
          <CardHeader className=&quot;pb-4&quot;>
            <div className=&quot;flex items-center gap-3&quot;>
              <div className=&quot;p-2 bg-blue-100 dark:bg-blue-900 rounded-lg&quot;>
                <Users className=&quot;h-6 w-6 text-blue-600 dark:text-blue-400&quot; />
              </div>
              <div>
                <CardTitle className=&quot;text-lg&quot;>Workforce Management</CardTitle>
                <CardDescription>Manage staff and assignments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className=&quot;text-sm text-muted-foreground mb-4&quot;>
              Oversee staff scheduling, assignments, and workforce coordination.
            </p>
            <Button asChild variant=&quot;outline&quot; className=&quot;w-full&quot;>
              <Link href=&quot;/workforce&quot;>
                Manage Workforce
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card className=&quot;hover:shadow-lg transition-shadow&quot;>
          <CardHeader className=&quot;pb-4&quot;>
            <div className=&quot;flex items-center gap-3&quot;>
              <div className=&quot;p-2 bg-green-100 dark:bg-green-900 rounded-lg&quot;>
                <Calendar className=&quot;h-6 w-6 text-green-600 dark:text-green-400&quot; />
              </div>
              <div>
                <CardTitle className=&quot;text-lg&quot;>Scheduling</CardTitle>
                <CardDescription>Manage bookings and calendar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className=&quot;text-sm text-muted-foreground mb-4&quot;>
              Schedule bookings, manage availability, and coordinate events.
            </p>
            <Button asChild variant=&quot;outline&quot; className=&quot;w-full&quot;>
              <Link href=&quot;/bookings&quot;>
                View Schedule
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card className=&quot;hover:shadow-lg transition-shadow&quot;>
          <CardHeader className=&quot;pb-4&quot;>
            <div className=&quot;flex items-center gap-3&quot;>
              <div className=&quot;p-2 bg-orange-100 dark:bg-orange-900 rounded-lg&quot;>
                <MapPin className=&quot;h-6 w-6 text-orange-600 dark:text-orange-400&quot; />
              </div>
              <div>
                <CardTitle className=&quot;text-lg&quot;>Locations</CardTitle>
                <CardDescription>Manage venue locations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className=&quot;text-sm text-muted-foreground mb-4&quot;>
              Track dispensaries, venues, and location compliance.
            </p>
            <Button asChild variant=&quot;outline&quot; className=&quot;w-full&quot;>
              <Link href=&quot;/locations&quot;>
                View Locations
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className=&quot;hover:shadow-lg transition-shadow&quot;>
          <CardHeader className=&quot;pb-4&quot;>
            <div className=&quot;flex items-center gap-3&quot;>
              <div className=&quot;p-2 bg-teal-100 dark:bg-teal-900 rounded-lg&quot;>
                <Package className=&quot;h-6 w-6 text-teal-600 dark:text-teal-400&quot; />
              </div>
              <div>
                <CardTitle className=&quot;text-lg&quot;>Inventory Management</CardTitle>
                <CardDescription>Track kits and supplies</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className=&quot;text-sm text-muted-foreground mb-4&quot;>
              Manage kit templates, inventory, and supply tracking.
            </p>
            <Button asChild variant=&quot;outline&quot; className=&quot;w-full&quot;>
              <Link href=&quot;/kits&quot;>
                Manage Inventory
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card className=&quot;hover:shadow-lg transition-shadow&quot;>
          <CardHeader className=&quot;pb-4&quot;>
            <div className=&quot;flex items-center gap-3&quot;>
              <div className=&quot;p-2 bg-purple-100 dark:bg-purple-900 rounded-lg&quot;>
                <BarChart3 className=&quot;h-6 w-6 text-purple-600 dark:text-purple-400&quot; />
              </div>
              <div>
                <CardTitle className=&quot;text-lg&quot;>Analytics & Reports</CardTitle>
                <CardDescription>View insights and metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className=&quot;text-sm text-muted-foreground mb-4&quot;>
              Access detailed analytics, reports, and business insights.
            </p>
            <Button asChild variant=&quot;outline&quot; className=&quot;w-full&quot;>
              <Link href=&quot;/analytics&quot;>
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}