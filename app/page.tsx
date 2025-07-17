"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import { Button } from "./components/ui/button";
import {
  ArrowRight,
  Calendar,
  Users,
  Shield,
  Clock,
  Building,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Simple redirect for authenticated users
    if (user && user.role === "super_admin") {
      console.log("Redirecting super admin to dashboard");
      router.push("/dashboard");
    }
  }, [user, router]);

  // Show loading state while authentication is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Rishi Platform...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, handle accordingly
  if (user) {
    // For super admin users, show loading while redirect happens
    if (user.role === "super_admin") {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    // For other roles, show welcome with dashboard link
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl mb-8">
            You're logged into the Rishi Workforce Management platform.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="mr-4">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg" className="mr-4">
              View Documentation
            </Button>
          </Link>
          <Link href="/dashboard/admin/infrastructure">
            <Button variant="secondary" size="lg">
              System Infrastructure
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // For non-logged in users, show the public landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Image
              src="/favicon.ico"
              alt="Rishi Logo"
              width={80}
              height={80}
              className="rounded-lg shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Rishi Workforce Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Comprehensive Rishi Platform for legal states (CO, OR, WA) featuring
            8-stage booking lifecycle and UUID architecture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="flex items-center gap-2">
                Login <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">
                Register
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <Calendar className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Booking Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              8-stage booking lifecycle with calendar views, regional filtering,
              and staff assignments.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <Users className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Team Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Complete workforce oversight with performance metrics and
              role-based access control.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <Shield className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multi-Organization</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Organization isolation with tiered service models and feature
              access control.
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <Clock className="w-12 h-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Time Tracking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive time tracking with clock-in/out, break management,
              and overtime calculations.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <Building className="w-12 h-12 text-red-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Multi-State Operations
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Designed for cannabis legal states with region-specific workflows
              and compliance tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
