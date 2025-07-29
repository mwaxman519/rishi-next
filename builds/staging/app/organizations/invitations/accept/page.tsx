"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

// Wrapper with suspense boundary
export default function AcceptInvitationPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    "loading" | "accepting" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      setStatus("error");
      setErrorMessage("Invalid invitation link. No token provided.");
    }
  }, [searchParams]);

  // Mutation for accepting the invitation
  const acceptInvitationMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest("POST", "/api/organizations/invitations/accept", {
        token,
      });
    },
    onSuccess: () => {
      setStatus("success");
      toast({
        title: "Invitation Accepted",
        description: "You have successfully joined the organization.",
      });
    },
    onError: (error: Error) => {
      setStatus("error");
      setErrorMessage(
        error.message || "There was an error accepting the invitation.",
      );
      toast({
        title: "Error",
        description:
          error.message || "There was an error accepting the invitation.",
        variant: "destructive",
      });
    },
  });

  // Mutation for rejecting the invitation
  const rejectInvitationMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest("POST", "/api/organizations/invitations/reject", {
        token,
      });
    },
    onSuccess: () => {
      toast({
        title: "Invitation Rejected",
        description:
          "You have declined the invitation to join the organization.",
      });
      router.push("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description:
          error.message || "There was an error rejecting the invitation.",
        variant: "destructive",
      });
    },
  });

  // Handle accepting the invitation
  const handleAccept = () => {
    if (token) {
      setStatus("accepting");
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, show a loading indicator (will redirect via useEffect)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle>Organization Invitation</CardTitle>
            <CardDescription>
              You have been invited to join an organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-center">Loading invitation details...</p>
              </div>
            )}

            {status === "accepting" && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-center">Processing your acceptance...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-green-100 rounded-full p-3 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Invitation Accepted
                </h3>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                  You have successfully joined the organization.
                </p>
                <p className="text-center text-sm text-gray-500">
                  You can now access the organization resources.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-red-100 rounded-full p-3 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Error</h3>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                  {errorMessage ||
                    "There was an error processing your invitation."}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            {status === "loading" && (
              <>
                <Button
                  variant="default"
                  onClick={handleAccept}
                  className="w-32"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="w-32"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </>
            )}

            {status === "accepting" && (
              <Button variant="outline" disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing
              </Button>
            )}

            {(status === "success" || status === "error") && (
              <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
