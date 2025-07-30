&quot;use client&quot;;

import React from &quot;react&quot;;
import { AlertTriangle, RefreshCw, Home } from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(&quot;ErrorBoundary caught an error:&quot;, error, errorInfo);
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  retry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            {...(this.state.error ? { error: this.state.error } : {})}
            retry={this.retry}
          />
        );
      }

      return (
        <div className=&quot;min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4&quot;>
          <div className=&quot;max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center&quot;>
            <div className=&quot;mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4&quot;>
              <AlertTriangle className=&quot;w-8 h-8 text-red-600 dark:text-red-400&quot; />
            </div>

            <h1 className=&quot;text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2&quot;>
              Something went wrong
            </h1>

            <p className=&quot;text-gray-600 dark:text-gray-400 mb-6&quot;>
              The application encountered an error and needs to recover. You can
              try refreshing or return to the dashboard.
            </p>

            {process.env.NODE_ENV === &quot;development&quot; && this.state.error && (
              <div className=&quot;mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs text-left overflow-auto max-h-32&quot;>
                <div className=&quot;font-mono text-red-600 dark:text-red-400&quot;>
                  {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <pre className=&quot;mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap&quot;>
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className=&quot;flex flex-col sm:flex-row gap-3&quot;>
              <button
                onClick={this.retry}
                className=&quot;flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors&quot;
              >
                <RefreshCw className=&quot;w-4 h-4 mr-2&quot; />
                Try Again
              </button>

              <Link
                href=&quot;/&quot;
                className=&quot;flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors&quot;
              >
                <Home className=&quot;w-4 h-4 mr-2&quot; />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
