'use client';

import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

interface AuthErrorBannerProps {
  error: Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function AuthErrorBanner({ error, onRetry, onDismiss }: AuthErrorBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!error || isDismissed) {
    return null;
  }

  const isNetworkError = error.message.includes('Network connection failed') || 
                        error.message.includes('Failed to fetch');

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="fixed top-32 right-4 left-4 md:left-auto md:w-96 z-50 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-red-800">
            {isNetworkError ? 'Connection Problem' : 'Authentication Error'}
          </h4>
          <p className="text-sm text-red-700 mt-1">
            {isNetworkError 
              ? 'Unable to connect to the authentication service. Please check your internet connection.'
              : error.message
            }
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-2 text-sm text-red-700 hover:text-red-800 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-red-400 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}