"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { canAccessAdmin } from "@/lib/rbac/hasPermission";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const hasAccess = canAccessAdmin(user.role);
        setAuthorized(hasAccess);
      } catch (error) {
        console.error("Error checking permissions:", error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to access this area.
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/organizations", label: "Organizations" },
    { href: "/admin/features", label: "Features" },
    { href: "/admin/regions", label: "Regions" },
    { href: "/admin/audit-logs", label: "Audit Logs" },
  ];

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <Button variant={isActive ? "default" : "outline"} size="sm">
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
