&quot;use client&quot;;

import React from &quot;react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { AlertTriangle, RefreshCw, Home } from &quot;lucide-react&quot;;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(&quot;ErrorBoundary caught an error:&quot;, error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <div className=&quot;min-h-screen flex items-center justify-center p-4&quot;>
          <Card className=&quot;w-full max-w-md&quot;>
            <CardHeader className=&quot;text-center&quot;>
              <div className=&quot;mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4&quot;>
                <AlertTriangle className=&quot;w-6 h-6 text-red-600 dark:text-red-400&quot; />
              </div>
              <CardTitle className=&quot;text-xl&quot;>Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              {this.state.error && (
                <div className=&quot;p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm&quot;>
                  <code className=&quot;text-red-600 dark:text-red-400&quot;>
                    {this.state.error.message}
                  </code>
                </div>
              )}
              <div className=&quot;flex gap-2&quot;>
                <Button onClick={this.resetError} className=&quot;flex-1&quot;>
                  <RefreshCw className=&quot;w-4 h-4 mr-2&quot; />
                  Try Again
                </Button>
                <Button
                  variant=&quot;outline&quot;
                  onClick={() => (window.location.href = &quot;/&quot;)}
                  className=&quot;flex-1&quot;
                >
                  <Home className=&quot;w-4 h-4 mr-2&quot; />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
