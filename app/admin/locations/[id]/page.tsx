"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Building2,
  Phone,
  Mail,
  Globe,
  User,
  Calendar,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Edit,
  MapIcon,
  Shield,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocationMap from "@/components/locations/LocationMap";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminLocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const locationId = params.id as string;

  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchLocationDetails() {
      if (!locationId) {
        setError("Location ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching location with ID: ${locationId}`);

        const response = await fetch(`/api/locations/${locationId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // For debugging, log the response
        console.log(`Location API response status: ${response.status}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Location not found");
          }

          // Try to get more detailed error information from the response
          const errorData = await response.json().catch(() => null);
          console.error("Error response data:", errorData);

          throw new Error(
            errorData?.error ||
              `Server error: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        console.log("Successfully fetched location data:", data);
        setLocation(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching location details:", err);
        setError(
          err.message || "An error occurred while fetching location details",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLocationDetails();
  }, [locationId]);

  // Helper function to handle location approval
  async function handleApprove() {
    try {
      setIsApproving(true);
      console.log(`Approving location with ID: ${locationId}`);

      const response = await fetch(
        `/api/admin/locations/${locationId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // Log the raw response for debugging
      console.log("Approval API response status:", response.status);

      // Read the response data
      const responseText = await response.text();
      console.log("Approval API response body:", responseText);

      // Parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
      }

      if (!response.ok) {
        const errorMsg = data?.error || "Failed to approve location";
        console.error("Approval error response:", errorMsg);
        throw new Error(errorMsg);
      }

      // Update local state with the returned data or fallback to basic status update
      if (data) {
        setLocation({
          ...location,
          ...(data || {}),
          status: "active",
          approved: true,
        });
      } else {
        setLocation({
          ...location,
          status: "active",
          approved: true,
        });
      }

      toast({
        title: "Location approved",
        description: "The location has been successfully approved.",
      });
    } catch (err: any) {
      console.error("Error approving location:", err);
      toast({
        title: "Approval failed",
        description:
          err.message || "An error occurred while approving the location.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  }

  // Helper function to handle location rejection
  async function handleReject() {
    try {
      setIsRejecting(true);

      const response = await fetch(
        `/api/admin/locations/${locationId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejectionReason: "Rejected by administrator", // You could add a text input for this
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reject location");
      }

      const data = await response.json();

      // Update local state
      setLocation({
        ...location,
        status: "rejected",
      });

      toast({
        title: "Location rejected",
        description: "The location has been rejected.",
      });
    } catch (err: any) {
      console.error("Error rejecting location:", err);
      toast({
        title: "Rejection failed",
        description:
          err.message || "An error occurred while rejecting the location.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  }

  // Helper function to handle location deletion
  async function handleDelete() {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/locations/${locationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete location");
      }

      toast({
        title: "Location deleted",
        description: "The location has been successfully deleted.",
      });

      // Navigate back to admin locations page
      router.push("/admin/locations");
    } catch (err: any) {
      console.error("Error deleting location:", err);
      toast({
        title: "Deletion failed",
        description:
          err.message || "An error occurred while deleting the location.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  // Helper function to render the status badge
  function renderStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200"
          >
            {status}
          </Badge>
        );
    }
  }

  // Helper function to render the location type badge
  function renderLocationTypeBadge(type: string) {
    switch (type) {
      case "venue":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Building2 className="h-3 w-3 mr-1" /> Venue
          </Badge>
        );
      case "office":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            <Building2 className="h-3 w-3 mr-1" /> Office
          </Badge>
        );
      case "storage":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            <Building2 className="h-3 w-3 mr-1" /> Storage
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200"
          >
            <Building2 className="h-3 w-3 mr-1" /> {type}
          </Badge>
        );
    }
  }

  // Admin-specific actions based on location status
  function renderAdminActions() {
    if (!location) return null;

    if (location.status === "pending") {
      return (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            disabled={isApproving}
            onClick={handleApprove}
          >
            {isApproving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Location
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            disabled={isRejecting}
            onClick={handleReject}
          >
            {isRejecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Reject Location
              </>
            )}
          </Button>
        </div>
      );
    }

    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className=&quot;h-4 w-4 mr-2 />
          Back
        </Button>

        <Alert>
          <AlertTitle>Location Not Found</AlertTitle>
          <AlertDescription>
            The requested location does not exist or you don&apos;t have permission
            to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{location.name}</h1>
            <div className="mt-1 flex items-center">
              <Shield className="h-4 w-4 mr-1 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Admin View
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/locations/${locationId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this location from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Location"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Status and type badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {location.status && renderStatusBadge(location.status)}
        {location.type && renderLocationTypeBadge(location.type)}
      </div>

      {/* Admin actions */}
      {renderAdminActions()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Location details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>
                Basic information about this location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Address
                  </h3>
                  <div className="space-y-1">
                    <p>{location.address1}</p>
                    {location.address2 && <p>{location.address2}</p>}
                    <p>
                      {location.city}, {location.state?.name || location.state}{" "}
                      {location.zipcode}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    {location.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{location.phone}</span>
                      </div>
                    )}

                    {location.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a
                          href={`mailto:${location.email}`}
                          className="text-primary hover:underline"
                        >
                          {location.email}
                        </a>
                      </div>
                    )}

                    {location.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a
                          href={
                            location.website.startsWith("http")
                              ? location.website
                              : `https://${location.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {location.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Primary Contact
                </h3>
                <div className="space-y-2">
                  {location.contactName && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{location.contactName}</span>
                    </div>
                  )}

                  {location.contactEmail && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a
                        href={`mailto:${location.contactEmail}`}
                        className="text-primary hover:underline"
                      >
                        {location.contactEmail}
                      </a>
                    </div>
                  )}

                  {location.contactPhone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{location.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {location.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Notes
                    </h3>
                    <p className="whitespace-pre-line text-sm">
                      {location.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {(location.requestedBy || location.reviewedBy) && (
            <Card>
              <CardHeader>
                <CardTitle>Activity & Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {location.requestedBy && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Requested by {location.requestedBy}</span>
                    </div>
                    {location.createdAt && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(location.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                {location.reviewedBy && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Reviewed by {location.reviewedBy}</span>
                    </div>
                    {location.reviewDate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(location.reviewDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapIcon className="h-4 w-4 mr-2" />
                Location Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[400px]">
              {location.latitude && location.longitude ? (
                <LocationMap
                  locations={[
                    {
                      id: location.id,
                      name: location.name,
                      address:
                        location.address ||
                        `${location.address1 || ""}, ${location.city || ""}, ${location.state?.name || location.state || ""} ${location.zipcode || ""}`,
                      latitude: parseFloat(location.latitude),
                      longitude: parseFloat(location.longitude),
                      status: location.status,
                    },
                  ]}
                  center={{
                    lat: parseFloat(location.latitude),
                    lng: parseFloat(location.longitude),
                  }}
                  zoom={15}
                  clickable={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted">
                  <div className="text-center p-4">
                    <MapPin className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className=&quot;text-muted-foreground>
                      No map coordinates available
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
