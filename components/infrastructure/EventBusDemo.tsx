"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Check,
  Clock,
  RefreshCw,
  Server,
  Activity,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEventSocket } from "@/hooks/useEventSocket";
import { AppEvent } from "@/shared/events";
import { useToast } from "@/hooks/use-toast";

export function EventBusDemo() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState<AppEvent[]>([
    AppEvent.LOCATION_CREATED,
    AppEvent.LOCATION_APPROVED,
    AppEvent.LOCATION_REJECTED,
    AppEvent.CIRCUIT_BREAKER_OPENED,
    AppEvent.CIRCUIT_BREAKER_CLOSED,
  ]);

  // Enable/disable specific features
  const [features, setFeatures] = useState({
    retryEnabled: true,
    circuitBreakerEnabled: true,
    websocketEnabled: true,
  });

  // Connect to the WebSocket for real-time event notifications
  const { isConnected, events, reconnect } = useEventSocket(
    selectedEventTypes,
    {
      onConnect: () => {
        toast({
          title: "WebSocket Connected",
          description: "Now receiving real-time event notifications",
          variant: "default",
        });
      },
      onDisconnect: () => {
        toast({
          title: "WebSocket Disconnected",
          description: "Connection to event stream lost",
          variant: "destructive",
        });
      },
      onError: () => {
        toast({
          title: "WebSocket Error",
          description: "Error in event stream connection",
          variant: "destructive",
        });
      },
    },
  );

  // Toggle a feature
  const toggleFeature = (feature: keyof typeof features) => {
    setFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));

    // Send API request to toggle feature
    fetch(`/api/infrastructure/features/${feature}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !features[feature] }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to toggle feature");
        return res.json();
      })
      .then((data) => {
        toast({
          title: `${feature} ${!features[feature] ? "Enabled" : "Disabled"}`,
          description:
            data.message || `Successfully updated ${feature} setting`,
          variant: "default",
        });
      })
      .catch((err) => {
        console.error("Error toggling feature:", err);
        // Revert the state change
        setFeatures((prev) => ({
          ...prev,
          [feature]: prev[feature],
        }));

        toast({
          title: "Feature Toggle Failed",
          description: err.message || "Could not update feature settings",
          variant: "destructive",
        });
      });
  };

  // Simulated health metrics
  const [metrics, setMetrics] = useState({
    eventCount: 0,
    successRate: 100,
    avgLatency: 12,
    activeCircuitBreakers: 0,
    connectedClients: 0,
  });

  // Update the metrics periodically to simulate real activity
  useEffect(() => {
    const timer = setInterval(() => {
      // Small random changes to the metrics
      setMetrics((prev) => ({
        eventCount: prev.eventCount + Math.floor(Math.random() * 3),
        successRate: Math.min(
          100,
          Math.max(90, prev.successRate + (Math.random() * 2 - 1)),
        ),
        avgLatency: Math.max(
          5,
          Math.min(50, prev.avgLatency + (Math.random() * 4 - 2)),
        ),
        activeCircuitBreakers: Math.floor(Math.random() * 2),
        connectedClients: isConnected
          ? prev.connectedClients + (Math.random() > 0.7 ? 1 : 0)
          : 0,
      }));
    }, 5000);

    return () => clearInterval(timer);
  }, [isConnected]);

  // Handle real events coming in
  useEffect(() => {
    if (events.length > 0) {
      // Update our metrics based on real events
      setMetrics((prev) => ({
        ...prev,
        eventCount: prev.eventCount + 1,
      }));
    }
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Event Bus Infrastructure
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage the distributed event messaging system
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
            >
              <Wifi className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
            >
              <WifiOff className="h-3 w-3" />
              Disconnected
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={reconnect}
            disabled={isConnected}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reconnect
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.eventCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Events processed in current session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Event delivery success percentage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgLatency.toFixed(1)} ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average event processing time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Services
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.connectedClients}</div>
            <p className="text-xs text-muted-foreground">
              Connected WebSocket clients
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>
                How the distributed event bus works with circuit breakers and
                error handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-semibold mb-2">
                    Event Distribution Channels
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Messages are distributed across multiple channels for
                    maximum reliability
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background rounded p-3 text-center">
                      <div className="font-semibold">Local</div>
                      <div className="text-xs text-muted-foreground">
                        In-process handlers
                      </div>
                    </div>
                    <div className="bg-background rounded p-3 text-center">
                      <div className="font-semibold">HTTP</div>
                      <div className="text-xs text-muted-foreground">
                        Service-to-service calls
                      </div>
                    </div>
                    <div className="bg-background rounded p-3 text-center">
                      <div className="font-semibold">WebSocket</div>
                      <div className="text-xs text-muted-foreground">
                        Real-time clients
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-semibold mb-2">Circuit Breaker States</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Prevents cascading failures by isolating failing components
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background rounded p-3 text-center">
                      <div className="font-semibold text-green-600">Closed</div>
                      <div className="text-xs text-muted-foreground">
                        Normal operation
                      </div>
                    </div>
                    <div className="bg-background rounded p-3 text-center">
                      <div className="font-semibold text-yellow-600">
                        Half-Open
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Testing recovery
                      </div>
                    </div>
                    <div className="bg-background rounded p-3 text-center">
                      <div className="font-semibold text-red-600">Open</div>
                      <div className="text-xs text-muted-foreground">
                        Fast failure
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-semibold mb-2">
                    Error Handling Strategies
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Customized error handling based on error type and event
                    criticality
                  </p>

                  <div className="space-y-2">
                    <div className="bg-background rounded p-3">
                      <div className="font-semibold">
                        Exponential Backoff with Jitter
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Progressively increases retry delays to prevent
                        thundering herd
                      </div>
                    </div>
                    <div className="bg-background rounded p-3">
                      <div className="font-semibold">
                        Categorized Error Handling
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Different strategies for transient vs. permanent errors
                      </div>
                    </div>
                    <div className="bg-background rounded p-3">
                      <div className="font-semibold">
                        Event-Specific Retry Policies
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Critical events have more aggressive retry policies
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Event Bus Status</AlertTitle>
                  <AlertDescription>
                    The event bus is operating normally with{" "}
                    {metrics.activeCircuitBreakers} active circuit breakers.
                    Current success rate is {metrics.successRate.toFixed(1)}%.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "Hide" : "Show"} Technical Details
              </Button>
            </CardFooter>
          </Card>

          {showDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Implementation Details</CardTitle>
                <CardDescription>
                  Technical specifics of the event bus implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <h3 className="font-semibold mb-2">Core Components</h3>
                    <div className="space-y-2">
                      <div className="bg-background rounded p-3">
                        <div className="font-semibold">Event Bus</div>
                        <div className="text-xs text-muted-foreground">
                          Central event pub/sub system for in-memory handlers
                        </div>
                      </div>
                      <div className="bg-background rounded p-3">
                        <div className="font-semibold">
                          Enhanced Distributed Event Bus
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Multi-channel distribution with WebSocket and HTTP
                          support
                        </div>
                      </div>
                      <div className="bg-background rounded p-3">
                        <div className="font-semibold">Circuit Breaker</div>
                        <div className="text-xs text-muted-foreground">
                          State machine for failure detection and isolation
                        </div>
                      </div>
                      <div className="bg-background rounded p-3">
                        <div className="font-semibold">
                          Error Handling Strategies
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pluggable strategies for different error scenarios
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Real-time event stream from the distributed event bus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 10).map((event: any, index) => (
                      <div key={index} className="rounded-md border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{event.event}</div>
                          <Badge variant="outline">
                            {new Date(
                              event.metadata?.timestamp || Date.now(),
                            ).toLocaleTimeString()}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-8 text-center">
                    <h3 className="font-semibold mb-2">No Events Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Waiting for events from the distributed event bus
                    </p>
                    {!isConnected && (
                      <Button onClick={reconnect} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Connect to Event Stream
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {isConnected ? "Connected to event stream" : "Disconnected"}
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Event Subscriptions</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Event Subscriptions</SheetTitle>
                  </SheetHeader>

                  <div className="py-4">
                    <Select
                      onValueChange={(value) => {
                        const eventType = value as AppEvent;
                        if (!selectedEventTypes.includes(eventType)) {
                          setSelectedEventTypes([
                            ...selectedEventTypes,
                            eventType,
                          ]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add Event Subscription" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Location Events</SelectLabel>
                          {[
                            AppEvent.LOCATION_CREATED,
                            AppEvent.LOCATION_UPDATED,
                            AppEvent.LOCATION_DELETED,
                            AppEvent.LOCATION_APPROVED,
                            AppEvent.LOCATION_REJECTED,
                          ].map((event) => (
                            <SelectItem key={event} value={event}>
                              {event}
                            </SelectItem>
                          ))}
                        </SelectGroup>

                        <SelectGroup>
                          <SelectLabel>Infrastructure Events</SelectLabel>
                          {[
                            AppEvent.CIRCUIT_BREAKER_OPENED,
                            AppEvent.CIRCUIT_BREAKER_CLOSED,
                            AppEvent.CIRCUIT_BREAKER_HALF_OPEN,
                          ].map((event) => (
                            <SelectItem key={event} value={event}>
                              {event}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">
                        Active Subscriptions
                      </h4>
                      <div className="space-y-2">
                        {selectedEventTypes.map((eventType) => (
                          <div
                            key={eventType}
                            className="flex items-center justify-between rounded-md border px-4 py-2"
                          >
                            <div className="text-sm">{eventType}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSelectedEventTypes(
                                  selectedEventTypes.filter(
                                    (e) => e !== eventType,
                                  ),
                                )
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        ))}

                        {selectedEventTypes.length === 0 && (
                          <div className="text-sm text-muted-foreground text-center py-2">
                            No active subscriptions
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure behavior of the event distribution system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Feature Toggles
                  </h3>
                  <Separator className="my-2" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="retry">Retry Mechanism</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically retry failed event deliveries
                        </p>
                      </div>
                      <Switch
                        id="retry"
                        checked={features.retryEnabled}
                        onCheckedChange={() => toggleFeature("retryEnabled")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="circuitBreaker">Circuit Breaker</Label>
                        <p className="text-sm text-muted-foreground">
                          Isolate failing components to prevent cascading
                          failures
                        </p>
                      </div>
                      <Switch
                        id="circuitBreaker"
                        checked={features.circuitBreakerEnabled}
                        onCheckedChange={() =>
                          toggleFeature("circuitBreakerEnabled")
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="websocket">WebSocket Channel</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable real-time updates via WebSocket
                        </p>
                      </div>
                      <Switch
                        id="websocket"
                        checked={features.websocketEnabled}
                        onCheckedChange={() =>
                          toggleFeature("websocketEnabled")
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
