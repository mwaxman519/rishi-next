&quot;use client&quot;;

import { useState } from &quot;react&quot;;
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
} from &quot;lucide-react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { format } from &quot;date-fns&quot;;

import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from &quot;@/components/ui/dialog&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;

import { useLocations } from &quot;@/hooks/useLocations&quot;;
import { LocationDTO } from &quot;@/services/locations&quot;;
import LocationMap from &quot;@/components/locations/LocationMap&quot;;

export default function LocationApprovalPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [selectedLocation, setSelectedLocation] = useState<LocationDTO | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(&quot;&quot;);
  const [currentTab, setCurrentTab] = useState(&quot;pending&quot;);

  // Filter for pending locations
  const filters = { status: currentTab === &quot;all&quot; ? undefined : currentTab };

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
      (location.state?.name || &quot;&quot;)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  // Handle location approval
  const handleApproveLocation = async (id: string) => {
    try {
      await approveLocation(id);
      toast({
        title: &quot;Success&quot;,
        description: &quot;Location has been approved&quot;,
      });
      // Close details dialog if the approved location is the selected one
      if (selectedLocation?.id === id) {
        setIsDetailsOpen(false);
      }
    } catch (error) {
      console.error(&quot;Error approving location:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description:
          error instanceof Error ? error.message : &quot;Failed to approve location&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Handle location rejection
  const handleRejectLocation = async (id: string, reason: string) => {
    try {
      await rejectLocation({ id, reason });
      toast({
        title: &quot;Success&quot;,
        description: &quot;Location has been rejected&quot;,
      });
      setIsRejectDialogOpen(false);
      // Close details dialog if the rejected location is the selected one
      if (selectedLocation?.id === id) {
        setIsDetailsOpen(false);
      }
    } catch (error) {
      console.error(&quot;Error rejecting location:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description:
          error instanceof Error ? error.message : &quot;Failed to reject location&quot;,
        variant: &quot;destructive&quot;,
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
    setRejectionReason(&quot;&quot;);
    setIsRejectDialogOpen(true);
  };

  // Get status badge based on location status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case &quot;approved&quot;:
        return <Badge className=&quot;bg-green-100 text-green-800&quot;>Approved</Badge>;
      case &quot;pending&quot;:
        return (
          <Badge className=&quot;bg-yellow-100 text-yellow-800&quot;>
            Pending Review
          </Badge>
        );
      case &quot;rejected&quot;:
        return <Badge className=&quot;bg-red-100 text-red-800&quot;>Rejected</Badge>;
      case &quot;draft&quot;:
        return <Badge className=&quot;bg-gray-100 text-gray-800&quot;>Draft</Badge>;
      default:
        return <Badge className=&quot;bg-gray-100 text-gray-800&quot;>{status}</Badge>;
    }
  };

  // Get location type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case &quot;venue&quot;:
        return <Badge className=&quot;bg-blue-100 text-blue-800&quot;>Venue</Badge>;
      case &quot;office&quot;:
        return <Badge className=&quot;bg-purple-100 text-purple-800&quot;>Office</Badge>;
      case &quot;storage&quot;:
        return <Badge className=&quot;bg-amber-100 text-amber-800&quot;>Storage</Badge>;
      default:
        return <Badge className=&quot;bg-gray-100 text-gray-800&quot;>{type}</Badge>;
    }
  };

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Location Approval Queue
          </h1>
          <p className=&quot;text-muted-foreground&quot;>
            Review and approve venue location requests
          </p>
        </div>

        <div className=&quot;flex items-center gap-3&quot;>
          <Button
            variant=&quot;outline&quot;
            size=&quot;sm&quot;
            onClick={() => refetch()}
            disabled={isLoading}
            className=&quot;flex items-center gap-2&quot;
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? &quot;animate-spin&quot; : &quot;&quot;}`}
            />
            Refresh
          </Button>
          <Button
            variant=&quot;default&quot;
            size=&quot;sm&quot;
            onClick={() => router.push(&quot;/admin/locations&quot;)}
          >
            View All Locations
          </Button>
        </div>
      </div>

      <div className=&quot;flex items-center space-x-4&quot;>
        <div className=&quot;relative flex-1 max-w-sm&quot;>
          <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
          <Input
            type=&quot;search&quot;
            placeholder=&quot;Search locations...&quot;
            className=&quot;pl-9&quot;
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className=&quot;flex-1&quot;
        >
          <TabsList className=&quot;grid w-full max-w-md grid-cols-3&quot;>
            <TabsTrigger value=&quot;pending&quot;>
              Pending{&quot; &quot;}
              <Badge variant=&quot;outline&quot; className=&quot;ml-2&quot;>
                {locations.filter((l) => l.status === &quot;pending&quot;).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value=&quot;approved&quot;>
              Approved{&quot; &quot;}
              <Badge variant=&quot;outline&quot; className=&quot;ml-2&quot;>
                {locations.filter((l) => l.status === &quot;approved&quot;).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value=&quot;rejected&quot;>
              Rejected{&quot; &quot;}
              <Badge variant=&quot;outline&quot; className=&quot;ml-2&quot;>
                {locations.filter((l) => l.status === &quot;rejected&quot;).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className=&quot;flex justify-center items-center py-12&quot;>
          <div className=&quot;flex flex-col items-center&quot;>
            <div className=&quot;animate-spin rounded-full h-12 w-12 border-b-2 border-primary&quot;></div>
            <p className=&quot;mt-4 text-muted-foreground&quot;>Loading locations...</p>
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className=&quot;flex flex-col items-center justify-center py-12&quot;>
            <div className=&quot;rounded-full bg-red-100 p-3 text-red-600 mb-4&quot;>
              <X className=&quot;h-6 w-6&quot; />
            </div>
            <h3 className=&quot;text-lg font-medium&quot;>Error Loading Locations</h3>
            <p className=&quot;text-sm text-muted-foreground mt-2&quot;>
              {error instanceof Error
                ? error.message
                : &quot;An unknown error occurred&quot;}
            </p>
            <Button
              variant=&quot;outline&quot;
              className=&quot;mt-4&quot;
              onClick={() => refetch()}
            >
              <RefreshCw className=&quot;mr-2 h-4 w-4&quot; />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredLocations.length === 0 ? (
        <Card>
          <CardContent className=&quot;flex flex-col items-center justify-center py-12&quot;>
            <div className=&quot;rounded-full bg-blue-100 p-3 text-blue-600 mb-4&quot;>
              <MapPin className=&quot;h-6 w-6&quot; />
            </div>
            <h3 className=&quot;text-lg font-medium&quot;>No Locations Found</h3>
            <p className=&quot;text-sm text-muted-foreground mt-2&quot;>
              {searchQuery
                ? &quot;No locations match your search criteria&quot;
                : `No ${currentTab} locations available at this time`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className=&quot;grid gap-4 md:grid-cols-2 lg:grid-cols-3&quot;>
          {filteredLocations.map((location) => (
            <Card key={location.id} className=&quot;overflow-hidden&quot;>
              <CardHeader className=&quot;p-4 pb-2 flex flex-row justify-between items-start&quot;>
                <div>
                  <CardTitle className=&quot;text-lg&quot;>{location.name}</CardTitle>
                  <CardDescription>
                    {location.type} in {location.city}
                  </CardDescription>
                </div>
                <div className=&quot;flex space-x-1&quot;>
                  {getStatusBadge(location.status)}
                  {getTypeBadge(location.type)}
                </div>
              </CardHeader>
              <CardContent className=&quot;p-4 pt-2&quot;>
                <div className=&quot;space-y-2 text-sm&quot;>
                  <div className=&quot;flex items-start&quot;>
                    <MapPin className=&quot;h-4 w-4 mr-2 mt-0.5 text-muted-foreground&quot; />
                    <div className=&quot;flex-1&quot;>
                      <p>{location.address1}</p>
                      {location.address2 && <p>{location.address2}</p>}
                      <p>
                        {location.city}, {location.state?.abbreviation || &quot;N/A&quot;}{&quot; &quot;}
                        {location.zipcode}
                      </p>
                    </div>
                  </div>
                  {location.requester && (
                    <div className=&quot;flex items-center&quot;>
                      <User className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                      <span>Requested by {location.requester.fullName}</span>
                    </div>
                  )}
                  <div className=&quot;flex items-center&quot;>
                    <Clock className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                    <span>
                      Submitted{&quot; &quot;}
                      {format(new Date(location.createdAt), &quot;MMM d, yyyy&quot;)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className=&quot;bg-muted/20 p-4 flex justify-between&quot;>
                <Button
                  variant=&quot;outline&quot;
                  size=&quot;sm&quot;
                  onClick={() => handleViewDetails(location)}
                >
                  <Eye className=&quot;mr-2 h-4 w-4&quot; />
                  View Details
                </Button>

                {location.status === &quot;pending&quot; && (
                  <div className=&quot;flex gap-2&quot;>
                    <Button
                      variant=&quot;outline&quot;
                      size=&quot;sm&quot;
                      className=&quot;text-red-600 border-red-200 hover:bg-red-50&quot;
                      onClick={() => handleOpenRejectDialog(location)}
                      disabled={
                        approveMutation.isPending || rejectMutation.isPending
                      }
                    >
                      <X className=&quot;mr-2 h-4 w-4&quot; />
                      Reject
                    </Button>
                    <Button
                      variant=&quot;default&quot;
                      size=&quot;sm&quot;
                      className=&quot;bg-green-600 hover:bg-green-700&quot;
                      onClick={() => handleApproveLocation(location.id)}
                      disabled={
                        approveMutation.isPending || rejectMutation.isPending
                      }
                    >
                      <Check className=&quot;mr-2 h-4 w-4&quot; />
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
          <DialogContent className=&quot;max-w-3xl h-[80vh] flex flex-col&quot;>
            <DialogHeader>
              <DialogTitle className=&quot;flex items-center&quot;>
                <Building className=&quot;mr-2 h-5 w-5&quot; />
                {selectedLocation.name}
                <div className=&quot;ml-3&quot;>
                  {getStatusBadge(selectedLocation.status)}
                </div>
              </DialogTitle>
              <DialogDescription>
                Location Details and Approval Information
              </DialogDescription>
            </DialogHeader>

            <div className=&quot;flex flex-col md:flex-row gap-6 flex-1 overflow-hidden&quot;>
              <div className=&quot;flex-1 overflow-y-auto&quot;>
                <div className=&quot;space-y-4&quot;>
                  {/* Location Information */}
                  <div>
                    <h3 className=&quot;text-lg font-medium&quot;>
                      Location Information
                    </h3>
                    <div className=&quot;mt-2 space-y-2 text-sm&quot;>
                      <div className=&quot;flex&quot;>
                        <span className=&quot;font-medium w-32&quot;>Type:</span>
                        <span>{getTypeBadge(selectedLocation.type)}</span>
                      </div>
                      <div className=&quot;flex&quot;>
                        <span className=&quot;font-medium w-32&quot;>Address:</span>
                        <div>
                          <p>{selectedLocation.address1}</p>
                          {selectedLocation.address2 && (
                            <p>{selectedLocation.address2}</p>
                          )}
                          <p>
                            {selectedLocation.city},{&quot; &quot;}
                            {selectedLocation.state?.abbreviation || &quot;N/A&quot;}{&quot; &quot;}
                            {selectedLocation.zipcode}
                          </p>
                        </div>
                      </div>
                      {selectedLocation.phone && (
                        <div className=&quot;flex&quot;>
                          <span className=&quot;font-medium w-32&quot;>Phone:</span>
                          <span>{selectedLocation.phone}</span>
                        </div>
                      )}
                      {selectedLocation.email && (
                        <div className=&quot;flex&quot;>
                          <span className=&quot;font-medium w-32&quot;>Email:</span>
                          <span>{selectedLocation.email}</span>
                        </div>
                      )}
                      {selectedLocation.website && (
                        <div className=&quot;flex&quot;>
                          <span className=&quot;font-medium w-32&quot;>Website:</span>
                          <a
                            href={selectedLocation.website}
                            target=&quot;_blank&quot;
                            rel=&quot;noopener noreferrer&quot;
                            className=&quot;text-blue-600 hover:underline&quot;
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
                        <h3 className=&quot;text-lg font-medium&quot;>
                          Contact Information
                        </h3>
                        <div className=&quot;mt-2 space-y-2 text-sm&quot;>
                          {selectedLocation.contactName && (
                            <div className=&quot;flex&quot;>
                              <span className=&quot;font-medium w-32&quot;>Name:</span>
                              <span>{selectedLocation.contactName}</span>
                            </div>
                          )}
                          {selectedLocation.contactEmail && (
                            <div className=&quot;flex&quot;>
                              <span className=&quot;font-medium w-32&quot;>Email:</span>
                              <span>{selectedLocation.contactEmail}</span>
                            </div>
                          )}
                          {selectedLocation.contactPhone && (
                            <div className=&quot;flex&quot;>
                              <span className=&quot;font-medium w-32&quot;>Phone:</span>
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
                        <h3 className=&quot;text-lg font-medium&quot;>Request Details</h3>
                        <div className=&quot;mt-2 space-y-2 text-sm&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <span className=&quot;font-medium w-32&quot;>
                              Requested By:
                            </span>
                            <div className=&quot;flex items-center&quot;>
                              <Avatar className=&quot;h-6 w-6 mr-2&quot;>
                                <AvatarFallback>
                                  {selectedLocation.requester.fullName.charAt(
                                    0,
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <span>{selectedLocation.requester.fullName}</span>
                            </div>
                          </div>
                          <div className=&quot;flex&quot;>
                            <span className=&quot;font-medium w-32&quot;>Email:</span>
                            <span>{selectedLocation.requester.email}</span>
                          </div>
                          <div className=&quot;flex&quot;>
                            <span className=&quot;font-medium w-32&quot;>
                              Request Date:
                            </span>
                            <span>
                              {format(
                                new Date(selectedLocation.createdAt),
                                &quot;MMM d, yyyy h:mm a&quot;,
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
                        <h3 className=&quot;text-lg font-medium&quot;>
                          Additional Notes
                        </h3>
                        <div className=&quot;mt-2 p-3 bg-muted rounded-md text-sm&quot;>
                          {selectedLocation.notes}
                        </div>
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Rejection Reason */}
                  {selectedLocation.status === &quot;rejected&quot; &&
                    selectedLocation.rejectionReason && (
                      <>
                        <div>
                          <h3 className=&quot;text-lg font-medium text-red-600&quot;>
                            Rejection Reason
                          </h3>
                          <div className=&quot;mt-2 p-3 bg-red-50 border border-red-100 rounded-md text-sm&quot;>
                            {selectedLocation.rejectionReason}
                          </div>
                        </div>

                        <Separator />
                      </>
                    )}
                </div>
              </div>

              {/* Map Section */}
              <div className=&quot;w-full md:w-1/2 h-[300px] md:h-auto&quot;>
                {selectedLocation.latitude && selectedLocation.longitude ? (
                  <LocationMap
                    latitude={selectedLocation.latitude}
                    longitude={selectedLocation.longitude}
                    className=&quot;h-full w-full rounded-md border&quot;
                  />
                ) : (
                  <div className=&quot;flex items-center justify-center h-full w-full bg-muted rounded-md border&quot;>
                    <div className=&quot;text-center&quot;>
                      <MapPin className=&quot;mx-auto h-10 w-10 text-muted-foreground/50&quot; />
                      <p className=&quot;mt-2 text-sm text-muted-foreground&quot;>
                        No coordinates available for this location
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className=&quot;mt-auto&quot;>
              <DialogClose asChild>
                <Button variant=&quot;outline&quot;>Close</Button>
              </DialogClose>

              {selectedLocation.status === &quot;pending&quot; && (
                <>
                  <Button
                    variant=&quot;outline&quot;
                    className=&quot;text-red-600 border-red-200 hover:bg-red-50&quot;
                    onClick={() => handleOpenRejectDialog(selectedLocation)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                  >
                    <X className=&quot;mr-2 h-4 w-4&quot; />
                    Reject Location
                  </Button>
                  <Button
                    variant=&quot;default&quot;
                    className=&quot;bg-green-600 hover:bg-green-700&quot;
                    onClick={() => handleApproveLocation(selectedLocation.id)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                  >
                    <Check className=&quot;mr-2 h-4 w-4&quot; />
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

          <div className=&quot;space-y-4 py-2&quot;>
            <Textarea
              placeholder=&quot;Enter rejection reason...&quot;
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className=&quot;h-32&quot;
            />
          </div>

          <DialogFooter>
            <Button
              variant=&quot;outline&quot;
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant=&quot;destructive&quot;
              onClick={() =>
                selectedLocation &&
                handleRejectLocation(selectedLocation.id, rejectionReason)
              }
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <RefreshCw className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className=&quot;mr-2 h-4 w-4" />
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
