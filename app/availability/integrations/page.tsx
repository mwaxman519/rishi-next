&quot;use client&quot;;

import React from &quot;react&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;

export default function IntegrationsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className=&quot;container mx-auto py-8&quot;>
        <h1 className=&quot;text-3xl font-bold mb-6&quot;>Calendar Integrations</h1>
        <div className=&quot;p-4 bg-yellow-50 border border-yellow-200 rounded-md&quot;>
          <p className=&quot;text-yellow-800&quot;>
            Please sign in to access your calendar integrations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;container mx-auto py-8&quot;>
      <h1 className=&quot;text-3xl font-bold mb-6&quot;>Calendar Integrations</h1>

      <div className=&quot;bg-white rounded-lg shadow p-6&quot;>
        <h2 className=&quot;text-2xl font-bold mb-4&quot;>Coming Soon</h2>
        <p className=&quot;text-gray-600&quot;>
          Calendar integration options will be available soon.
        </p>
      </div>
    </div>
  );
}
