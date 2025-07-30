&quot;use client&quot;;

import { useEffect, useState } from &quot;react&quot;;
import { useRouter, usePathname } from &quot;next/navigation&quot;;
import Link from &quot;next/link&quot;;
import { canAccessAdmin } from &quot;@/lib/rbac/hasPermission&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { AlertCircle } from &quot;lucide-react&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;

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
        console.error(&quot;Error checking permissions:&quot;, error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className=&quot;container mx-auto py-8&quot;>
        <div className=&quot;text-center&quot;>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className=&quot;container mx-auto py-8&quot;>
        <Alert variant=&quot;destructive&quot;>
          <AlertCircle className=&quot;h-4 w-4&quot; />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to access this area.
          </AlertDescription>
        </Alert>
        <div className=&quot;mt-4 text-center&quot;>
          <Button onClick={() => router.push(&quot;/&quot;)}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: &quot;/admin&quot;, label: &quot;Dashboard&quot;, exact: true },
    { href: &quot;/admin/users&quot;, label: &quot;Users&quot; },
    { href: &quot;/admin/organizations&quot;, label: &quot;Organizations&quot; },
    { href: &quot;/admin/features&quot;, label: &quot;Features&quot; },
    { href: &quot;/admin/regions&quot;, label: &quot;Regions&quot; },
    { href: &quot;/admin/audit-logs&quot;, label: &quot;Audit Logs&quot; },
  ];

  return (
    <div className=&quot;container mx-auto py-4&quot;>
      <h1 className=&quot;text-3xl font-bold mb-6&quot;>Admin Panel</h1>

      <div className=&quot;flex flex-wrap gap-2 mb-6&quot;>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <Button variant={isActive ? &quot;default&quot; : &quot;outline&quot;} size=&quot;sm&quot;>
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
