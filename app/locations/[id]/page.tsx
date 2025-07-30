&quot;use client&quot;;

import { useEffect, useState } from &quot;react&quot;;
import { useParams, useRouter } from &quot;next/navigation&quot;;
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
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { LocationMap } from &quot;@/components/locations/LocationMap&quot;;
import { LoadingSpinner } from &quot;@/components/ui/spinner&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.id as string;

  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocationDetails() {
      try {
        setLoading(true);
        const response = await fetch(`/api/locations/${locationId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(&quot;Location not found&quot;);
          }
          throw new Error(&quot;Failed to fetch location details&quot;);
        }

        const data = await response.json();
        setLocation(data);
        setError(null);
      } catch (err: any) {
        console.error(&quot;Error fetching location details:&quot;, err);
        setError(
          err.message || &quot;An error occurred while fetching location details&quot;,
        );
      } finally {
        setLoading(false);
      }
    }

    if (locationId) {
      fetchLocationDetails();
    }
  }, [locationId]);

  // Helper function to render the status badge
  function renderStatusBadge(status: string) {
    switch (status) {
      case &quot;pending&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-yellow-50 text-yellow-700 border-yellow-200&quot;
          >
            <Clock className=&quot;h-3 w-3 mr-1&quot; /> Pending
          </Badge>
        );
      case &quot;approved&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-green-50 text-green-700 border-green-200&quot;
          >
            <CheckCircle2 className=&quot;h-3 w-3 mr-1&quot; /> Approved
          </Badge>
        );
      case &quot;rejected&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-red-50 text-red-700 border-red-200&quot;
          >
            <XCircle className=&quot;h-3 w-3 mr-1&quot; /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-slate-50 text-slate-700 border-slate-200&quot;
          >
            {status}
          </Badge>
        );
    }
  }

  // Helper function to render the location type badge
  function renderLocationTypeBadge(type: string) {
    switch (type) {
      case &quot;venue&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-blue-50 text-blue-700 border-blue-200&quot;
          >
            <Building2 className=&quot;h-3 w-3 mr-1&quot; /> Venue
          </Badge>
        );
      case &quot;office&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-purple-50 text-purple-700 border-purple-200&quot;
          >
            <Building2 className=&quot;h-3 w-3 mr-1&quot; /> Office
          </Badge>
        );
      case &quot;storage&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-amber-50 text-amber-700 border-amber-200&quot;
          >
            <Building2 className=&quot;h-3 w-3 mr-1&quot; /> Storage
          </Badge>
        );
      default:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-slate-50 text-slate-700 border-slate-200&quot;
          >
            <Building2 className=&quot;h-3 w-3 mr-1&quot; /> {type}
          </Badge>
        );
    }
  }

  if (loading) {
    return (
      <div className=&quot;flex items-center justify-center min-h-[60vh]&quot;>
        <LoadingSpinner size=&quot;lg&quot; />
      </div>
    );
  }

  if (error) {
    return (
      <div className=&quot;p-6&quot;>
        <Button variant=&quot;ghost&quot; onClick={() => router.back()} className=&quot;mb-6&quot;>
          <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
          Back
        </Button>

        <Alert variant=&quot;destructive&quot;>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!location) {
    return (
      <div className=&quot;p-6&quot;>
        <Button variant=&quot;ghost&quot; onClick={() => router.back()} className=&quot;mb-6&quot;>
          <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
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
    <div className=&quot;p-6&quot;>
      {/* Back button and actions */}
      <div className=&quot;flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4&quot;>
        <div className=&quot;flex items-center&quot;>
          <Button
            variant=&quot;ghost&quot;
            onClick={() => router.back()}
            className=&quot;mr-2&quot;
          >
            <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
            Back
          </Button>
          <h1 className=&quot;text-2xl font-bold&quot;>{location.name}</h1>
        </div>

        <div className=&quot;flex items-center gap-2&quot;>
          <Button variant=&quot;outline&quot; asChild>
            <Link href={`/locations/${locationId}/edit`}>
              <Edit className=&quot;h-4 w-4 mr-2&quot; />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Status and type badges */}
      <div className=&quot;flex flex-wrap gap-2 mb-6&quot;>
        {location.status && renderStatusBadge(location.status)}
        {location.type && renderLocationTypeBadge(location.type)}
      </div>

      <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-6&quot;>
        {/* Location details */}
        <div className=&quot;lg:col-span-2 space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>
                Basic information about this location
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                <div>
                  <h3 className=&quot;text-sm font-medium text-muted-foreground mb-1&quot;>
                    Address
                  </h3>
                  <div className=&quot;space-y-1&quot;>
                    <p>{location.address1}</p>
                    {location.address2 && <p>{location.address2}</p>}
                    <p>
                      {location.city}, {location.state?.name || location.state}{&quot; &quot;}
                      {location.zipcode}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className=&quot;text-sm font-medium text-muted-foreground mb-1&quot;>
                    Contact Information
                  </h3>
                  <div className=&quot;space-y-2&quot;>
                    {location.phone && (
                      <div className=&quot;flex items-center&quot;>
                        <Phone className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                        <span>{location.phone}</span>
                      </div>
                    )}

                    {location.email && (
                      <div className=&quot;flex items-center&quot;>
                        <Mail className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                        <a
                          href={`mailto:${location.email}`}
                          className=&quot;text-primary hover:underline&quot;
                        >
                          {location.email}
                        </a>
                      </div>
                    )}

                    {location.website && (
                      <div className=&quot;flex items-center&quot;>
                        <Globe className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                        <a
                          href={
                            location.website.startsWith(&quot;http&quot;)
                              ? location.website
                              : `https://${location.website}`
                          }
                          target=&quot;_blank&quot;
                          rel=&quot;noopener noreferrer&quot;
                          className=&quot;text-primary hover:underline&quot;
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
                <h3 className=&quot;text-sm font-medium text-muted-foreground mb-2&quot;>
                  Primary Contact
                </h3>
                <div className=&quot;space-y-2&quot;>
                  {location.contactName && (
                    <div className=&quot;flex items-center&quot;>
                      <User className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                      <span>{location.contactName}</span>
                    </div>
                  )}

                  {location.contactEmail && (
                    <div className=&quot;flex items-center&quot;>
                      <Mail className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                      <a
                        href={`mailto:${location.contactEmail}`}
                        className=&quot;text-primary hover:underline&quot;
                      >
                        {location.contactEmail}
                      </a>
                    </div>
                  )}

                  {location.contactPhone && (
                    <div className=&quot;flex items-center&quot;>
                      <Phone className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                      <span>{location.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {location.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className=&quot;text-sm font-medium text-muted-foreground mb-2&quot;>
                      Notes
                    </h3>
                    <p className=&quot;whitespace-pre-line text-sm&quot;>
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
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent className=&quot;space-y-4&quot;>
                {location.requestedBy && (
                  <div className=&quot;flex items-center justify-between&quot;>
                    <div className=&quot;flex items-center&quot;>
                      <User className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                      <span>Requested by {location.requestedBy}</span>
                    </div>
                    {location.createdAt && (
                      <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                        <Calendar className=&quot;h-3 w-3 mr-1&quot; />
                        {new Date(location.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                {location.reviewedBy && (
                  <div className=&quot;flex items-center justify-between&quot;>
                    <div className=&quot;flex items-center&quot;>
                      <User className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                      <span>Reviewed by {location.reviewedBy}</span>
                    </div>
                    {location.reviewDate && (
                      <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                        <Calendar className=&quot;h-3 w-3 mr-1&quot; />
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
          <Card className=&quot;h-full&quot;>
            <CardHeader>
              <CardTitle className=&quot;flex items-center&quot;>
                <MapIcon className=&quot;h-4 w-4 mr-2&quot; />
                Location Map
              </CardTitle>
            </CardHeader>
            <CardContent className=&quot;p-0 h-[400px]&quot;>
              {location.latitude && location.longitude ? (
                <LocationMap
                  locations={[
                    {
                      id: location.id,
                      name: location.name,
                      address:
                        location.address ||
                        `${location.address1 || "&quot;}, ${location.city || &quot;&quot;}, ${location.state?.name || location.state || &quot;&quot;} ${location.zipcode || &quot;&quot;}`,
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
                <div className=&quot;flex items-center justify-center h-full bg-muted&quot;>
                  <div className=&quot;text-center p-4&quot;>
                    <MapPin className=&quot;h-10 w-10 mx-auto mb-2 text-muted-foreground&quot; />
                    <p className=&quot;text-muted-foreground">
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
