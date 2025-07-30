&quot;use client&quot;;

import { usePathname } from &quot;next/navigation&quot;;
import Link from &quot;next/link&quot;;
import { Tabs, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;

export default function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isSettings = pathname.includes(&quot;/settings&quot;);
  const isBranding = pathname.includes(&quot;/branding&quot;);
  const isUsers = pathname.includes(&quot;/users&quot;);
  const isRoles = pathname.includes(&quot;/roles&quot;);

  // If we&apos;re looking at a specific organization's feature, get the organizationId
  const organizationIdMatch = pathname.match(/organizationId=([^&]+)/);
  const organizationId = organizationIdMatch ? organizationIdMatch[1] : null;

  // Only show tabs when we&apos;re on an organization-specific page
  if (!organizationId) {
    return <>{children}</>;
  }

  // Use the correct base path for each tab
  const baseUrl = `/admin/organizations`;

  return (
    <div>
      <Tabs
        value={
          isSettings
            ? &quot;settings&quot;
            : isBranding
              ? &quot;branding&quot;
              : isUsers
                ? &quot;users&quot;
                : isRoles
                  ? &quot;roles&quot;
                  : &quot;details&quot;
        }
        className=&quot;w-full mb-6&quot;
      >
        <TabsList className=&quot;grid grid-cols-5 w-full&quot;>
          <Link href={`${baseUrl}/${organizationId}`} passHref legacyBehavior>
            <TabsTrigger value=&quot;details&quot; className=&quot;cursor-pointer&quot;>
              Details
            </TabsTrigger>
          </Link>

          <Link
            href={`${baseUrl}/settings?organizationId=${organizationId}`}
            passHref
            legacyBehavior
          >
            <TabsTrigger value=&quot;settings&quot; className=&quot;cursor-pointer&quot;>
              Settings
            </TabsTrigger>
          </Link>

          <Link
            href={`${baseUrl}/branding?organizationId=${organizationId}`}
            passHref
            legacyBehavior
          >
            <TabsTrigger value=&quot;branding&quot; className=&quot;cursor-pointer&quot;>
              Branding
            </TabsTrigger>
          </Link>

          <Link
            href={`${baseUrl}/users?organizationId=${organizationId}`}
            passHref
            legacyBehavior
          >
            <TabsTrigger value=&quot;users&quot; className=&quot;cursor-pointer&quot;>
              Users
            </TabsTrigger>
          </Link>

          <Link
            href={`${baseUrl}/roles?organizationId=${organizationId}`}
            passHref
            legacyBehavior
          >
            <TabsTrigger value=&quot;roles&quot; className=&quot;cursor-pointer&quot;>
              Roles & Permissions
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>

      <Separator className=&quot;mb-6&quot; />

      {children}
    </div>
  );
}
