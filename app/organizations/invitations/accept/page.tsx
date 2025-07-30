&quot;use client&quot;;

import { useState, useEffect, Suspense } from &quot;react&quot;;
import { useSearchParams, useRouter } from &quot;next/navigation&quot;;
import { useMutation } from &quot;@tanstack/react-query&quot;;
import { Loader2, Check, X, AlertTriangle } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { toast } from &quot;@/hooks/use-toast&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { apiRequest } from &quot;@/lib/queryClient&quot;;

// Wrapper with suspense boundary
export default function AcceptInvitationPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className=&quot;flex items-center justify-center min-h-screen&quot;>
          <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
        </div>
      }
    >
      <AcceptInvitationPage />
    </Suspense>
  );
}

// Main component that uses useSearchParams
function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<
    &quot;loading&quot; | &quot;accepting&quot; | &quot;success&quot; | &quot;error&quot;
  >(&quot;loading&quot;);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get(&quot;token&quot;);
    if (urlToken) {
      setToken(urlToken);
    } else {
      setStatus(&quot;error&quot;);
      setErrorMessage(&quot;Invalid invitation link. No token provided.&quot;);
    }
  }, [searchParams]);

  // Mutation for accepting the invitation
  const acceptInvitationMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest(&quot;POST&quot;, &quot;/api/organizations/invitations/accept&quot;, {
        token,
      });
    },
    onSuccess: () => {
      setStatus(&quot;success&quot;);
      toast({
        title: &quot;Invitation Accepted&quot;,
        description: &quot;You have successfully joined the organization.&quot;,
      });
    },
    onError: (error: Error) => {
      setStatus(&quot;error&quot;);
      setErrorMessage(
        error.message || &quot;There was an error accepting the invitation.&quot;,
      );
      toast({
        title: &quot;Error&quot;,
        description:
          error.message || &quot;There was an error accepting the invitation.&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Mutation for rejecting the invitation
  const rejectInvitationMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest(&quot;POST&quot;, &quot;/api/organizations/invitations/reject&quot;, {
        token,
      });
    },
    onSuccess: () => {
      toast({
        title: &quot;Invitation Rejected&quot;,
        description:
          &quot;You have declined the invitation to join the organization.&quot;,
      });
      router.push(&quot;/&quot;);
    },
    onError: (error: Error) => {
      toast({
        title: &quot;Error&quot;,
        description:
          error.message || &quot;There was an error rejecting the invitation.&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Handle accepting the invitation
  const handleAccept = () => {
    if (token) {
      setStatus(&quot;accepting&quot;);
      acceptInvitationMutation.mutate(token);
    }
  };

  // Handle rejecting the invitation
  const handleReject = () => {
    if (token) {
      rejectInvitationMutation.mutate(token);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push(
        `/auth/login?redirectUrl=${encodeURIComponent(window.location.href)}`,
      );
    }
  }, [user, isAuthLoading, router]);

  // If still loading authentication status
  if (isAuthLoading) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
      </div>
    );
  }

  // If not authenticated, show a loading indicator (will redirect via useEffect)
  if (!user) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
      </div>
    );
  }

  return (
    <div className=&quot;flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900&quot;>
      <div className=&quot;w-full max-w-md p-4&quot;>
        <Card>
          <CardHeader>
            <CardTitle>Organization Invitation</CardTitle>
            <CardDescription>
              You have been invited to join an organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === &quot;loading&quot; && (
              <div className=&quot;flex flex-col items-center justify-center py-8&quot;>
                <Loader2 className=&quot;h-8 w-8 animate-spin text-primary mb-4&quot; />
                <p className=&quot;text-center&quot;>Loading invitation details...</p>
              </div>
            )}

            {status === &quot;accepting&quot; && (
              <div className=&quot;flex flex-col items-center justify-center py-8&quot;>
                <Loader2 className=&quot;h-8 w-8 animate-spin text-primary mb-4&quot; />
                <p className=&quot;text-center&quot;>Processing your acceptance...</p>
              </div>
            )}

            {status === &quot;success&quot; && (
              <div className=&quot;flex flex-col items-center justify-center py-8&quot;>
                <div className=&quot;bg-green-100 rounded-full p-3 mb-4&quot;>
                  <Check className=&quot;h-8 w-8 text-green-600&quot; />
                </div>
                <h3 className=&quot;text-xl font-semibold mb-2&quot;>
                  Invitation Accepted
                </h3>
                <p className=&quot;text-center text-gray-600 dark:text-gray-400 mb-4&quot;>
                  You have successfully joined the organization.
                </p>
                <p className=&quot;text-center text-sm text-gray-500&quot;>
                  You can now access the organization resources.
                </p>
              </div>
            )}

            {status === &quot;error&quot; && (
              <div className=&quot;flex flex-col items-center justify-center py-8&quot;>
                <div className=&quot;bg-red-100 rounded-full p-3 mb-4&quot;>
                  <AlertTriangle className=&quot;h-8 w-8 text-red-600&quot; />
                </div>
                <h3 className=&quot;text-xl font-semibold mb-2&quot;>Error</h3>
                <p className=&quot;text-center text-gray-600 dark:text-gray-400 mb-4&quot;>
                  {errorMessage ||
                    &quot;There was an error processing your invitation.&quot;}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className=&quot;flex justify-center space-x-4&quot;>
            {status === &quot;loading&quot; && (
              <>
                <Button
                  variant=&quot;default&quot;
                  onClick={handleAccept}
                  className=&quot;w-32&quot;
                >
                  <Check className=&quot;h-4 w-4 mr-2&quot; />
                  Accept
                </Button>
                <Button
                  variant=&quot;outline&quot;
                  onClick={handleReject}
                  className=&quot;w-32&quot;
                >
                  <X className=&quot;h-4 w-4 mr-2&quot; />
                  Decline
                </Button>
              </>
            )}

            {status === &quot;accepting&quot; && (
              <Button variant=&quot;outline&quot; disabled>
                <Loader2 className=&quot;h-4 w-4 mr-2 animate-spin&quot; />
                Processing
              </Button>
            )}

            {(status === &quot;success&quot; || status === &quot;error&quot;) && (
              <Button onClick={() => router.push(&quot;/&quot;)}>Go to Dashboard</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
