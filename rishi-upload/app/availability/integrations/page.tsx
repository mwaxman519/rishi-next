"use client";

import React from "react";
import { useAuth } from "../../hooks/useAuth";

export default function IntegrationsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Calendar Integrations</h1>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            Please sign in to access your calendar integrations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Calendar Integrations</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          Calendar integration options will be available soon.
        </p>
      </div>
    </div>
  );
}
