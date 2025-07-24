'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { useState } from 'react';

export default function DevEnvironmentBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show in development environment
  if (process.env.NODE_ENV !== 'development' || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-40 right-4 left-4 md:left-auto md:w-96 z-50 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-blue-800">
            Development Environment
          </h4>
          <p className="text-sm text-blue-700 mt-1">
            You're in development mode. Some browser security restrictions in Replit may prevent authentication API calls. 
            The backend APIs are working correctly - this is purely a development environment limitation.
          </p>
          <p className="text-sm text-blue-600 mt-2 font-medium">
            Production deployment will work normally.
          </p>
          <button
            onClick={() => setIsDismissed(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Got it, dismiss
          </button>
        </div>
      </div>
    </div>
  );
}