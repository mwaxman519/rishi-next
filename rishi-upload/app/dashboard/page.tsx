"use client";

import React from "react";
import { AppLayout } from "../components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import {
  BarChart3,
  Calendar,
  Clock,
  MapPin,
  Users,
  Database,
  Server,
  Globe,
  Shield,
  BadgeAlert,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome to the Rishi Workforce Management platform.
            </p>
          </div>
        </header>

        {/* Key Metrics Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[rgb(var(--card))] border-[rgb(var(--border))]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[rgb(var(--card-foreground))]">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[rgb(var(--card-foreground))]">
                24
              </div>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                +10% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[rgb(var(--card))] border-[rgb(var(--border))]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[rgb(var(--card-foreground))]">
                Upcoming Events
              </CardTitle>
              <Clock className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[rgb(var(--card-foreground))]">
                16
              </div>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                3 events this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[rgb(var(--card))] border-[rgb(var(--border))]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[rgb(var(--card-foreground))]">
                Active Locations
              </CardTitle>
              <MapPin className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[rgb(var(--card-foreground))]">
                12
              </div>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Across 5 regions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[rgb(var(--card))] border-[rgb(var(--border))]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[rgb(var(--card-foreground))]">
                Staff Assigned
              </CardTitle>
              <Users className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[rgb(var(--card-foreground))]">
                48
              </div>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                92% availability rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts & Security Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--foreground))]">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* System Alerts Card */}
            <Card className="bg-[rgb(var(--card))] border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center text-[rgb(var(--card-foreground))]">
                    <BadgeAlert className="mr-2 h-5 w-5 text-red-500" />
                    System Alerts
                  </CardTitle>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    2 Alerts
                  </span>
                </div>
                <CardDescription className="text-[rgb(var(--muted-foreground))]">
                  Alerts requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[rgb(var(--border))] pb-2">
                    <div>
                      <div className="font-medium text-[rgb(var(--card-foreground))]">
                        Database Performance
                      </div>
                      <div className="text-sm text-[rgb(var(--muted-foreground))]">
                        Slow query performance detected • 15 minutes ago
                      </div>
                    </div>
                    <Link
                      href="/admin/alerts/1"
                      className="text-xs font-medium text-[rgb(var(--primary))] hover:underline self-center"
                    >
                      Investigate →
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium text-[rgb(var(--card-foreground))]">
                        API Rate Limiting
                      </div>
                      <div className="text-sm text-[rgb(var(--muted-foreground))]">
                        Rate limit threshold reached • 42 minutes ago
                      </div>
                    </div>
                    <Link
                      href="/admin/alerts/2"
                      className="text-xs font-medium text-[rgb(var(--primary))] hover:underline self-center"
                    >
                      Investigate →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Monitoring Card */}
            <Card className="bg-[rgb(var(--card))] border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center text-[rgb(var(--card-foreground))]">
                    <Shield className="mr-2 h-5 w-5 text-amber-500" />
                    Security Monitoring
                  </CardTitle>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    12 Events
                  </span>
                </div>
                <CardDescription className="text-[rgb(var(--muted-foreground))]">
                  Recent security activity on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[rgb(var(--border))] pb-2">
                    <div>
                      <div className="font-medium text-[rgb(var(--card-foreground))]">
                        Failed Login Attempts
                      </div>
                      <div className="text-sm text-[rgb(var(--muted-foreground))]">
                        5 attempts from IP 192.168.1.25 • 30 minutes ago
                      </div>
                    </div>
                    <Link
                      href="/admin/security/login-attempts"
                      className="text-xs font-medium text-[rgb(var(--primary))] hover:underline self-center"
                    >
                      Details →
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium text-[rgb(var(--card-foreground))]">
                        Permission Escalation
                      </div>
                      <div className="text-sm text-[rgb(var(--muted-foreground))]">
                        User role modified by super admin • 2 hours ago
                      </div>
                    </div>
                    <Link
                      href="/admin/security/permissions"
                      className="text-xs font-medium text-[rgb(var(--primary))] hover:underline self-center"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Performance Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[rgb(var(--card))] border-[rgb(var(--border))]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base text-[rgb(var(--card-foreground))]">
                  <Database className="mr-2 h-5 w-5 text-[rgb(var(--primary))]" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--card-foreground))]">
                      Query Performance
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      92%
                    </span>
                  </div>
                  <div className="w-full bg-[rgb(var(--muted))] rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "92%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--card-foreground))]">
                      Storage Usage
                    </span>
                    <span className="text-sm font-medium text-amber-600">
                      68%
                    </span>
                  </div>
                  <div className="w-full bg-[rgb(var(--muted))] rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full"
                      style={{ width: "68%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[rgb(var(--card))] border-[rgb(var(--border))]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base text-[rgb(var(--card-foreground))]">
                  <Server className="mr-2 h-5 w-5 text-[rgb(var(--primary))]" />
                  Server
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--card-foreground))]">
                      CPU Usage
                    </span>
                    <span className="text-sm font-medium text-amber-600">
                      72%
                    </span>
                  </div>
                  <div className="w-full bg-[rgb(var(--muted))] rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full"
                      style={{ width: "72%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--card-foreground))]">
                      Memory Usage
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      45%
                    </span>
                  </div>
                  <div className="w-full bg-[rgb(var(--muted))] rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[rgb(var(--card))] border-[rgb(var(--border))]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base text-[rgb(var(--card-foreground))]">
                  <Globe className="mr-2 h-5 w-5 text-[rgb(var(--primary))]" />
                  API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--card-foreground))]">
                      Response Time
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      86%
                    </span>
                  </div>
                  <div className="w-full bg-[rgb(var(--muted))] rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "86%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--card-foreground))]">
                      Error Rate
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      2%
                    </span>
                  </div>
                  <div className="w-full bg-[rgb(var(--muted))] rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "2%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Bookings Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2 bg-[rgb(var(--card))] border-[rgb(var(--border))]">
            <CardHeader>
              <CardTitle className="text-[rgb(var(--card-foreground))]">
                Recent Bookings
              </CardTitle>
              <CardDescription className="text-[rgb(var(--muted-foreground))]">
                Overview of your most recent booking activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="mr-4 rounded-md bg-[rgba(var(--primary),0.1)] p-2">
                      <Calendar className="h-4 w-4 text-[rgb(var(--primary))]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-[rgb(var(--card-foreground))]">
                        Staff Training Event {i}
                      </p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        {new Date(2024, 4, i + 10).toLocaleDateString()} •
                        Corporate HQ
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-[rgb(var(--card-foreground))]">
                      {["Confirmed", "Pending", "Completed"][i - 1]}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Updated just now
              </p>
            </CardFooter>
          </Card>

          <Card className="bg-[rgb(var(--card))] border-[rgb(var(--border))]">
            <CardHeader>
              <CardTitle className="text-[rgb(var(--card-foreground))]">
                Upcoming Deadlines
              </CardTitle>
              <CardDescription className="text-[rgb(var(--muted-foreground))]">
                Important dates to remember
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="mr-4 rounded-full bg-[rgba(var(--primary),0.1)] p-2">
                      <div className="h-5 w-5 rounded-full bg-[rgb(var(--primary))] text-center text-xs font-bold text-[rgb(var(--primary-foreground))] flex items-center justify-center">
                        {i}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-[rgb(var(--card-foreground))]">
                        {
                          [
                            "Budget Approval",
                            "Staff Allocation",
                            "Kit Preparation",
                          ][i - 1]
                        }
                      </p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        Due in {i * 3} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
