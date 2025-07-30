&quot;use client&quot;;

import { useAuth } from &quot;../hooks/useAuth&quot;;
import { useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(&quot;/auth/login&quot;);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className=&quot;min-h-screen flex items-center justify-center&quot;>
        <div className=&quot;text-center&quot;>
          <h2 className=&quot;text-2xl font-semibold mb-4&quot;>Loading...</h2>
          <div className=&quot;w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto&quot;></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {user ? (
        children
      ) : (
        <div className=&quot;min-h-screen flex items-center justify-center&quot;>
          <div className=&quot;text-center&quot;>
            <h2 className=&quot;text-2xl font-semibold mb-4&quot;>
              Authentication Required
            </h2>
            <p className=&quot;text-gray-600 mb-4&quot;>
              Please log in to access this page.
            </p>
            <button
              onClick={() => router.push(&quot;/auth/login&quot;)}
              className=&quot;px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors&quot;
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
