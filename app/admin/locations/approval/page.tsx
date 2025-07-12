"use client";

import { useState } from "react";
import {
  Building,
  Check,
  X,
  MapPin,
  Clock,
  Eye,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Calendar,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useLocations } from "@/hooks/useLocations";
import { LocationDTO } from "@/services/locations";
import LocationMap from "@/app/components/locations/LocationMap";

export default function LocationApprovalPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationDTO | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentTab, setCurrentTab] = useState("pending");

  // Filter for pending locations
  const filters = { status: currentTab === "all" ? undefined : currentTab };

  // Fetch locations with the status filter
  const {
    locations,
    isLoading,
    error,
    refetch,
    approveLocation,
    rejectLocation,
    approveMutation,
    rejectMutation,
  } = useLocations(filters);

  // Filter locations based on search query
  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.state?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  // Handle location approval
  const handleApproveLocation = async (id: string) => {
    try {
      await approveLocation(id);
      toast({
        title: "Success",
        description: "Location has been approved",
      });
      // Close details dialog if the approved location is the selected one
      if (selectedLocation?.id === id) {
        setIsDetailsOpen(false);
      }
    } catch (error) {
      console.error("Error approving location:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve location",
        variant: "destructive",
      });
    }
  };

  // Handle location rejection
  const handleRejectLocation = async (id: string, reason: string) => {
    try {
      await rejectLocation({ id, reason });
      toast({
        title: "Success",
        description: "Location has been rejected",
      });
      setIsRejectDialogOpen(false);
      // Close details dialog if the rejected location is the selected one
      if (selectedLocation?.id === id) {
        setIsDetailsOpen(false);
      }
    } catch (error) {
      console.error("Error rejecting location:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject location",
        variant: "destructive",
      });
    }
  };

  // View location details
  const handleViewDetails = (location: LocationDTO) => {
    setSelectedLocation(location);
    setIsDetailsOpen(true);
  };

  // Open rejection dialog
  const handleOpenRejectDialog = (location: LocationDTO) => {
    setSelectedLocation(location);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  // Get status badge based on location status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Pending Review
          </Badge>
        );
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Get location type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "venue":
        return <Badge className="bg-blue-100 text-blue-800">Venue</Badge>;
      case "office":
        return <Badge className="bg-purple-100 text-purple-800">Office</Badge>;
      case "storage":
        return <Badge className="bg-amber-100 text-amber-800">Storage</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Location Approval Queue
          </h1>
          <p className="text-muted-foreground">
            Review and approve venue location requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/admin/locations")}
          >
            View All Locations
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search locations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="flex-1"
        >
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending">
              Pending{" "}
              <Badge variant="outline" className="ml-2">
                {locations.filter((l) => l.status === "pending").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved{" "}
              <Badge variant="outline" className="ml-2">
                {locations.filter((l) => l.status === "approved").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected{" "}
              <Badge variant="outline" className="ml-2">
                {locations.filter((l) => l.status === "rejected").length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading locations...</p>
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
              <X className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium">Error Loading Locations</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error
                ? error.message
                : "An unknown error occurred"}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredLocations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-blue-100 p-3 text-blue-600 mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium">No Locations Found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery
                ? "No locations match your search criteria"
                : `No ${currentTab} locations available at this time`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                  <CardDescription>
                    {location.type} in {location.city}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  {getStatusBadge(location.status)}
                  {getTypeBadge(location.type)}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p>{location.address1}</p>
                      {location.address2 && <p>{location.address2}</p>}
                      <p>
                        {location.city}, {location.state?.abbreviation || "N/A"}{" "}
                        {location.zipcode}
                      </p>
                    </div>
                  </div>
                  {location.requester && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Requested by {location.requester.fullName}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Submitted{" "}
                      {format(new Date(location.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 p-4 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(location)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>

                {location.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleOpenRejectDialog(location)}
                      disabled={
                        approveMutation.isPending || rejectMutation.isPending
                      }
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveLocation(location.id)}
                      disabled={
                        approveMutation.isPending || rejectMutation.isPending
                      }
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Location Details Dialog */}
      {selectedLocation && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                {selectedLocation.name}
                <div className="ml-3">
                  {getStatusBadge(selectedLocation.status)}
                </div>
              </DialogTitle>
              <DialogDescription>
                Location Details and Approval Information
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Location Information */}
                  <div>
                    <h3 className="text-lg font-medium">
                      Location Information
                    </h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex">
                        <span className="font-medium w-32">Type:</span>
                        <span>{getTypeBadge(selectedLocation.type)}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-32">Address:</span>
                        <div>
                          <p>{selectedLocation.address1}</p>
                          {selectedLocation.address2 && (
                            <p>{selectedLocation.address2}</p>
                          )}
                          <p>
                            {selectedLocation.city},{" "}
                            {selectedLocation.state?.abbreviation || "N/A"}{" "}
                            {selectedLocation.zipcode}
                          </p>
                        </div>
                      </div>
                      {selectedLocation.phone && (
                        <div className="flex">
                          <span className="font-medium w-32">Phone:</span>
                          <span>{selectedLocation.phone}</span>
                        </div>
                      )}
                      {selectedLocation.email && (
                        <div className="flex">
                          <span className="font-medium w-32">Email:</span>
                          <span>{selectedLocation.email}</span>
                        </div>
                      )}
                      {selectedLocation.website && (
                        <div className="flex">
                          <span className="font-medium w-32">Website:</span>
                          <a
                            href={selectedLocation.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {selectedLocation.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  {(selectedLocation.contactName ||
                    selectedLocation.contactEmail ||
                    selectedLocation.contactPhone) && (
                    <>
                      <div>
                        <h3 className="text-lg font-medium">
                          Contact Information
                        </h3>
                        <div className="mt-2 space-y-2 text-sm">
                          {selectedLocation.contactName && (
                            <div className="flex">
                              <span className="font-medium w-32">Name:</span>
                              <span>{selectedLocation.contactName}</span>
                            </div>
                          )}
                          {selectedLocation.contactEmail && (
                            <div className="flex">
                              <span className="font-medium w-32">Email:</span>
                              <span>{selectedLocation.contactEmail}</span>
                            </div>
                          )}
                          {selectedLocation.contactPhone && (
                            <div className="flex">
                              <span className="font-medium w-32">Phone:</span>
                              <span>{selectedLocation.contactPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Requester Information */}
                  {selectedLocation.requester && (
                    <>
                      <div>
                        <h3 className="text-lg font-medium">Request Details</h3>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium w-32">
                              Requested By:
                            </span>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback>
                                  {selectedLocation.requester.fullName.charAt(
                                    0,
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <span>{selectedLocation.requester.fullName}</span>
                            </div>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Email:</span>
                            <span>{selectedLocation.requester.email}</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">
                              Request Date:
                            </span>
                            <span>
                              {format(
                                new Date(selectedLocation.createdAt),
                                "MMM d, yyyy h:mm a",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Additional Notes */}
                  {selectedLocation.notes && (
                    <>
                      <div>
                        <h3 className="text-lg font-medium">
                          Additional Notes
                        </h3>
                        <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                          {selectedLocation.notes}
                        </div>
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Rejection Reason */}
                  {selectedLocation.status === "rejected" &&
                    selectedLocation.rejectionReason && (
                      <>
                        <div>
                          <h3 className="text-lg font-medium text-red-600">
                            Rejection Reason
                          </h3>
                          <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md text-sm">
                            {selectedLocation.rejectionReason}
                          </div>
                        </div>

                        <Separator />
                      </>
                    )}
                </div>
              </div>

              {/* Map Section */}
              <div className="w-full md:w-1/2 h-[300px] md:h-auto">
                {selectedLocation.latitude && selectedLocation.longitude ? (
                  <LocationMap
                    latitude={selectedLocation.latitude}
                    longitude={selectedLocation.longitude}
                    className="h-full w-full rounded-md border"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-muted rounded-md border">
                    <div className="text-center">
                      <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No coordinates available for this location
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-auto">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>

              {selectedLocation.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleOpenRejectDialog(selectedLocation)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject Location
                  </Button>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveLocation(selectedLocation.id)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve Location
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Location</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this location. This will be
              visible to the requester.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="h-32"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedLocation &&
                handleRejectLocation(selectedLocation.id, rejectionReason)
              }
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject Location
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
