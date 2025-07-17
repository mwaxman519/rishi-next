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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.fullName || 'User'}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Brand Agent Performance */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Brand Agent Performance</CardTitle>
                  <CardDescription>Track and analyze performance metrics</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-600">
                New
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Monitor 8 key performance metrics including manager reviews, on-time performance, 
              location compliance, and more.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-green-500" />
                <span>Manager Reviews (1-5)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>On-time Performance (%)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span>Overall Performance Score</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/performance/brand-agents">
                View Performance Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Workforce Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Workforce Management</CardTitle>
                <CardDescription>Manage staff and assignments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Oversee staff scheduling, assignments, and workforce coordination.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/workforce">
                Manage Workforce
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Scheduling</CardTitle>
                <CardDescription>Manage bookings and calendar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Schedule bookings, manage availability, and coordinate events.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/bookings">
                View Schedule
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Locations</CardTitle>
                <CardDescription>Manage venue locations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Track dispensaries, venues, and location compliance.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/locations">
                View Locations
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Package className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Inventory Management</CardTitle>
                <CardDescription>Track kits and supplies</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage kit templates, inventory, and supply tracking.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/kits">
                Manage Inventory
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Analytics & Reports</CardTitle>
                <CardDescription>View insights and metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Access detailed analytics, reports, and business insights.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/analytics">
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}