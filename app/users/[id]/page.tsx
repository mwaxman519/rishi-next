&quot;use client&quot;;

import { useEffect } from &quot;react&quot;;
import { useParams, useRouter } from &quot;next/navigation&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
import SidebarLayout from &quot;@/components/SidebarLayout&quot;;
import UserDetailPanel from &quot;@/components/users/UserDetailPanel&quot;;

/**
 * This page now serves as a wrapper around the UserDetailPanel component
 * for direct URL access to a user's profile
 */
export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, loading: isAuthLoading } = useAuth();
  const { checkPermission } = useAuthorization();

  const userId = params.id as string;

  // Check permissions to see if user can view this page
  if (!isAuthLoading && !currentUser) {
    return (
      <SidebarLayout>
        <div className=&quot;p-6&quot;>
          <h1 className=&quot;text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100&quot;>
            User Details
          </h1>
          <div className=&quot;bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded&quot;>
            <p className=&quot;text-red-700 dark:text-red-300&quot;>
              You need to be logged in to view this page.
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthLoading && !checkPermission(&quot;read:users&quot;)) {
    return (
      <SidebarLayout>
        <div className=&quot;p-6&quot;>
          <h1 className=&quot;text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100&quot;>
            User Details
          </h1>
          <div className=&quot;bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded&quot;>
            <p className=&quot;text-red-700 dark:text-red-300&quot;>
              You don&apos;t have permission to view user details.
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Handle going back to users list
  const handleBack = () => {
    router.push(&quot;/users&quot;);
  };

  // Show loading state while authentication is checking
  if (isAuthLoading) {
    return (
      <SidebarLayout>
        <div className=&quot;p-6 flex justify-center items-center h-64&quot;>
          <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary&quot;></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className=&quot;p-6&quot;>
        <UserDetailPanel
          userId={userId}
          onBack={handleBack}
          showBackButton={true}
        />
      </div>
    </SidebarLayout>
  );
}
