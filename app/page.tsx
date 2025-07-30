&quot;use client&quot;;

import React, { useEffect, useState } from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import Image from &quot;next/image&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useAuth } from &quot;./hooks/useAuth&quot;;
import { Button } from &quot;./components/ui/button&quot;;
import {
  ArrowRight,
  Calendar,
  Users,
  Shield,
  Clock,
  Building,
} from &quot;lucide-react&quot;;

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Simple redirect for authenticated users
    if (!loading && user && user.role === &quot;super_admin&quot;) {
      console.log(&quot;Redirecting super admin to dashboard&quot;);
      setRedirecting(true);
      // Use a small delay to ensure hydration is complete before redirecting
      setTimeout(() => {
        router.replace(&quot;/dashboard&quot;);
      }, 100);
    }
  }, [user, loading, router]);

  // Show loading state while authentication is initializing
  if (loading) {
    return (
      <div className=&quot;flex items-center justify-center h-screen&quot;>
        <div className=&quot;text-center&quot;>
          <div className=&quot;animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4&quot;></div>
          <p className=&quot;text-muted-foreground&quot;>Loading Rishi Platform...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, handle accordingly
  if (user) {
    // For super admin users, show loading while redirect happens
    if (user.role === &quot;super_admin&quot;) {
      return (
        <div className=&quot;flex items-center justify-center h-screen&quot;>
          <div className=&quot;text-center&quot;>
            <div className=&quot;animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4&quot;></div>
            <p className=&quot;text-muted-foreground&quot;>
              {redirecting ? &quot;Redirecting to dashboard...&quot; : &quot;Loading dashboard...&quot;}
            </p>
            {/* Add a fallback button in case redirect fails */}
            <div className=&quot;mt-4&quot;>
              <Link href=&quot;/dashboard&quot;>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                  Go to Dashboard Manually
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // For other roles, show welcome with dashboard link
    return (
      <div className=&quot;container mx-auto py-12 px-4&quot;>
        <div className=&quot;text-center&quot;>
          <h1 className=&quot;text-4xl font-bold mb-6&quot;>
            Welcome back, {user.name}!
          </h1>
          <p className=&quot;text-xl mb-8&quot;>
            You're logged into the Rishi Workforce Management platform.
          </p>
          <Link href=&quot;/dashboard&quot;>
            <Button size=&quot;lg&quot; className=&quot;mr-4&quot;>
              Go to Dashboard <ArrowRight className=&quot;ml-2 h-4 w-4&quot; />
            </Button>
          </Link>
          <Link href=&quot;/docs&quot;>
            <Button variant=&quot;outline&quot; size=&quot;lg&quot; className=&quot;mr-4&quot;>
              View Documentation
            </Button>
          </Link>
          <Link href=&quot;/dashboard/admin/infrastructure&quot;>
            <Button variant=&quot;secondary&quot; size=&quot;lg&quot;>
              System Infrastructure
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // For non-logged in users, show the public landing page
  return (
    <div className=&quot;min-h-screen bg-gradient-to-br from-purple-50 to-teal-50 dark:from-gray-900 dark:to-gray-800&quot;>
      {/* Hero Section */}
      <div className=&quot;container mx-auto px-4 py-16&quot;>
        <div className=&quot;text-center mb-16&quot;>
          <div className=&quot;flex justify-center mb-6&quot;>
            <img
              src=&quot;/assets/logos/rishi-logo-main.png&quot;
              alt=&quot;Rishi Platform&quot;
              className=&quot;w-64 h-auto shadow-lg&quot;
              onError={(e) => {
                console.log('Main logo failed on homepage, trying icon');
                e.currentTarget.src = '/assets/logos/rishi-logo-icon.png';
                e.currentTarget.className = 'w-20 h-20 shadow-lg';
              }}
            />
          </div>
          <h1 className=&quot;text-5xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent mb-6&quot;>
            Rishi Workforce Management
          </h1>
          <p className=&quot;text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto&quot;>
            Comprehensive Rishi Platform for legal states (CO, OR, WA) featuring
            8-stage booking lifecycle and UUID architecture.
          </p>
          <div className=&quot;flex flex-col sm:flex-row gap-4 justify-center&quot;>
            <Link href=&quot;/auth/login&quot;>
              <Button size=&quot;lg&quot; className=&quot;flex items-center gap-2 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200&quot;>
                Login <ArrowRight className=&quot;w-4 h-4&quot; />
              </Button>
            </Link>
            <Link href=&quot;/auth/register&quot;>
              <Button variant=&quot;outline&quot; size=&quot;lg&quot; className=&quot;border-purple-600 text-purple-600 hover:bg-purple-50 hover:border-purple-700&quot;>
                Register
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className=&quot;grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16&quot;>
          <div className=&quot;bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg&quot;>
            <Calendar className=&quot;w-12 h-12 text-purple-600 mb-4&quot; />
            <h3 className=&quot;text-xl font-semibold mb-2&quot;>Booking Management</h3>
            <p className=&quot;text-gray-600 dark:text-gray-300&quot;>
              8-stage booking lifecycle with calendar views, regional filtering,
              and staff assignments.
            </p>
          </div>

          <div className=&quot;bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg&quot;>
            <Users className=&quot;w-12 h-12 text-teal-600 mb-4&quot; />
            <h3 className=&quot;text-xl font-semibold mb-2&quot;>Team Management</h3>
            <p className=&quot;text-gray-600 dark:text-gray-300&quot;>
              Complete workforce oversight with performance metrics and
              role-based access control.
            </p>
          </div>

          <div className=&quot;bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg&quot;>
            <Shield className=&quot;w-12 h-12 text-purple-600 mb-4&quot; />
            <h3 className=&quot;text-xl font-semibold mb-2&quot;>Multi-Organization</h3>
            <p className=&quot;text-gray-600 dark:text-gray-300&quot;>
              Organization isolation with tiered service models and feature
              access control.
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className=&quot;grid md:grid-cols-2 gap-8 max-w-4xl mx-auto&quot;>
          <div className=&quot;bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg&quot;>
            <Clock className=&quot;w-12 h-12 text-teal-600 mb-4&quot; />
            <h3 className=&quot;text-xl font-semibold mb-2&quot;>Time Tracking</h3>
            <p className=&quot;text-gray-600 dark:text-gray-300&quot;>
              Comprehensive time tracking with clock-in/out, break management,
              and overtime calculations.
            </p>
          </div>

          <div className=&quot;bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg&quot;>
            <Building className=&quot;w-12 h-12 text-purple-600 mb-4&quot; />
            <h3 className=&quot;text-xl font-semibold mb-2&quot;>
              Multi-State Operations
            </h3>
            <p className=&quot;text-gray-600 dark:text-gray-300&quot;>
              Designed for cannabis legal states with region-specific workflows
              and compliance tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
