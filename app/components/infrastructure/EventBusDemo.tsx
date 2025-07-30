&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from &quot;@/components/ui/sheet&quot;;
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import {
  AlertCircle,
  Check,
  Clock,
  RefreshCw,
  Server,
  Activity,
  Wifi,
  WifiOff,
} from &quot;lucide-react&quot;;
import { useEventSocket } from &quot;@/hooks/useEventSocket&quot;;
import { AppEvent } from &quot;../../../shared/events&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

export function EventBusDemo() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(&quot;overview&quot;);
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
          title: &quot;WebSocket Connected&quot;,
          description: &quot;Now receiving real-time event notifications&quot;,
          variant: &quot;default&quot;,
        });
      },
      onDisconnect: () => {
        toast({
          title: &quot;WebSocket Disconnected&quot;,
          description: &quot;Connection to event stream lost&quot;,
          variant: &quot;destructive&quot;,
        });
      },
      onError: () => {
        toast({
          title: &quot;WebSocket Error&quot;,
          description: &quot;Error in event stream connection&quot;,
          variant: &quot;destructive&quot;,
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
      method: &quot;POST&quot;,
      headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
      body: JSON.stringify({ enabled: !features[feature] }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(&quot;Failed to toggle feature&quot;);
        return res.json();
      })
      .then((data) => {
        toast({
          title: `${feature} ${!features[feature] ? &quot;Enabled&quot; : &quot;Disabled&quot;}`,
          description:
            data.message || `Successfully updated ${feature} setting`,
          variant: &quot;default&quot;,
        });
      })
      .catch((err) => {
        console.error(&quot;Error toggling feature:&quot;, err);
        // Revert the state change
        setFeatures((prev) => ({
          ...prev,
          [feature]: prev[feature],
        }));

        toast({
          title: &quot;Feature Toggle Failed&quot;,
          description: err.message || &quot;Could not update feature settings&quot;,
          variant: &quot;destructive&quot;,
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
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h2 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Event Bus Infrastructure
          </h2>
          <p className=&quot;text-muted-foreground&quot;>
            Monitor and manage the distributed event messaging system
          </p>
        </div>

        <div className=&quot;flex items-center gap-2&quot;>
          {isConnected ? (
            <Badge
              variant=&quot;outline&quot;
              className=&quot;bg-green-50 text-green-700 border-green-200 flex items-center gap-1&quot;
            >
              <Wifi className=&quot;h-3 w-3&quot; />
              Connected
            </Badge>
          ) : (
            <Badge
              variant=&quot;outline&quot;
              className=&quot;bg-red-50 text-red-700 border-red-200 flex items-center gap-1&quot;
            >
              <WifiOff className=&quot;h-3 w-3&quot; />
              Disconnected
            </Badge>
          )}

          <Button
            variant=&quot;outline&quot;
            size=&quot;sm&quot;
            onClick={reconnect}
            disabled={isConnected}
          >
            <RefreshCw className=&quot;h-4 w-4 mr-2&quot; />
            Reconnect
          </Button>
        </div>
      </div>

      <div className=&quot;grid gap-4 md:grid-cols-2 lg:grid-cols-4&quot;>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Total Events</CardTitle>
            <Activity className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {metrics.eventCount.toLocaleString()}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Events processed in current session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Success Rate</CardTitle>
            <Check className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {metrics.successRate.toFixed(1)}%
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Event delivery success percentage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Avg. Latency</CardTitle>
            <Clock className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {metrics.avgLatency.toFixed(1)} ms
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Average event processing time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>
              Active Services
            </CardTitle>
            <Server className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>{metrics.connectedClients}</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Connected WebSocket clients
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className=&quot;grid w-full grid-cols-3&quot;>
          <TabsTrigger value=&quot;overview&quot;>Overview</TabsTrigger>
          <TabsTrigger value=&quot;events&quot;>Recent Events</TabsTrigger>
          <TabsTrigger value=&quot;settings&quot;>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;overview&quot; className=&quot;space-y-4&quot;>
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>
                How the distributed event bus works with circuit breakers and
                error handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                <div className=&quot;rounded-md bg-muted p-4&quot;>
                  <h3 className=&quot;font-semibold mb-2&quot;>
                    Event Distribution Channels
                  </h3>
                  <p className=&quot;text-sm text-muted-foreground mb-3&quot;>
                    Messages are distributed across multiple channels for
                    maximum reliability
                  </p>

                  <div className=&quot;grid grid-cols-3 gap-2&quot;>
                    <div className=&quot;bg-background rounded p-3 text-center&quot;>
                      <div className=&quot;font-semibold&quot;>Local</div>
                      <div className=&quot;text-xs text-muted-foreground&quot;>
                        In-process handlers
                      </div>
                    </div>
                    <div className=&quot;bg-background rounded p-3 text-center&quot;>
                      <div className=&quot;font-semibold&quot;>HTTP</div>
                      <div className=&quot;text-xs text-muted-foreground&quot;>
                        Service-to-service calls
                      </div>
                    </div>
                    <div className=&quot;bg-background rounded p-3 text-center&quot;>
                      <div className=&quot;font-semibold&quot;>WebSocket</div>
                      <div className=&quot;text-xs text-muted-foreground&quot;>
                        Real-time clients
                      </div>
                    </div>
                  </div>
                </div>

                <div className=&quot;rounded-md bg-muted p-4&quot;>
                  <h3 className=&quot;font-semibold mb-2&quot;>Circuit Breaker States</h3>
                  <p className=&quot;text-sm text-muted-foreground mb-3&quot;>
                    Prevents cascading failures by isolating failing components
                  </p>

                  <div className=&quot;grid grid-cols-3 gap-2&quot;>
                    <div className=&quot;bg-background rounded p-3 text-center&quot;>
                      <div className=&quot;font-semibold text-green-600&quot;>Closed</div>
                      <div className=&quot;text-xs text-muted-foreground&quot;>
                        Normal operation
                      </div>
                    </div>
                    <div className=&quot;bg-background rounded p-3 text-center&quot;>
                      <div className=&quot;font-semibold text-yellow-600&quot;>
                        Half-Open
                      </div>
                      <div className=&quot;text-xs text-muted-foreground&quot;>
                        Testing recovery
                      </div>
                    </div>
                    <div className=&quot;bg-background rounded p-3 text-center&quot;>
                      <div className=&quot;font-semibold text-red-600&quot;>Open</div>
                      <div className=&quot;text-xs text-muted-foreground&quot;>
                        Fast failure
                      </div>
                    </div>
                  </div>
                </div>

                <div className=&quot;rounded-md bg-muted p-4&quot;>
                  <h3 className=&quot;font-semibold mb-2&quot;>
                    Error Handling Strategies
                  </h3>
                  <p className=&quot;text-sm text-muted-foreground mb-3&quot;>
                    Customized error handling based on error type and event
                    criticality
                  </p>

                  <div className=&quot;space-y-2&quot;>
                    <div className=&quot;bg-background rounded p-3&quot;>
                      <div className=&quot;font-semibold&quot;>
                        Exponential Backoff with Jitter
                      </div>
                      <div className=&quot;text-xs text-muted-foreground&quot;>
                        Progressively increases retry delays to prevent
                        thundering herd
                      </div>
                    </div>
                    <div className=&quot;bg-background rounded p-3&quot;>
                      <div className=&quot;font-semibold&quot;>
                        Categorized Error Handling
                      </div>
                      <div className=&quot;text-xs text-muted-foreground&quot;>
                        Different strategies for transient vs. permanent errors
                      </div>
                    </div>
                    <div className=&quot;bg-background rounded p-3&quot;>
                      <div className=&quot;font-semibold&quot;>
                        Event-Specific Retry Policies
                      </div>
                      <div className=&quot;text-xs text-muted-foreground&quot;>
                        Critical events have more aggressive retry policies
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className=&quot;h-4 w-4&quot; />
                  <AlertTitle>Event Bus Status</AlertTitle>
                  <AlertDescription>
                    The event bus is operating normally with{&quot; &quot;}
                    {metrics.activeCircuitBreakers} active circuit breakers.
                    Current success rate is {metrics.successRate.toFixed(1)}%.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant=&quot;outline&quot;
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? &quot;Hide&quot; : &quot;Show&quot;} Technical Details
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
                <div className=&quot;space-y-4&quot;>
                  <div className=&quot;rounded-md bg-muted p-4&quot;>
                    <h3 className=&quot;font-semibold mb-2&quot;>Core Components</h3>
                    <div className=&quot;space-y-2&quot;>
                      <div className=&quot;bg-background rounded p-3&quot;>
                        <div className=&quot;font-semibold&quot;>Event Bus</div>
                        <div className=&quot;text-xs text-muted-foreground&quot;>
                          Central event pub/sub system for in-memory handlers
                        </div>
                      </div>
                      <div className=&quot;bg-background rounded p-3&quot;>
                        <div className=&quot;font-semibold&quot;>
                          Enhanced Distributed Event Bus
                        </div>
                        <div className=&quot;text-xs text-muted-foreground&quot;>
                          Multi-channel distribution with WebSocket and HTTP
                          support
                        </div>
                      </div>
                      <div className=&quot;bg-background rounded p-3&quot;>
                        <div className=&quot;font-semibold&quot;>Circuit Breaker</div>
                        <div className=&quot;text-xs text-muted-foreground&quot;>
                          State machine for failure detection and isolation
                        </div>
                      </div>
                      <div className=&quot;bg-background rounded p-3&quot;>
                        <div className=&quot;font-semibold&quot;>
                          Error Handling Strategies
                        </div>
                        <div className=&quot;text-xs text-muted-foreground&quot;>
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

        <TabsContent value=&quot;events&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Real-time event stream from the distributed event bus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                {events.length > 0 ? (
                  <div className=&quot;space-y-4&quot;>
                    {events.slice(0, 10).map((event: any, index) => (
                      <div key={index} className=&quot;rounded-md border p-4&quot;>
                        <div className=&quot;flex items-center justify-between mb-2&quot;>
                          <div className=&quot;font-semibold&quot;>{event.event}</div>
                          <Badge variant=&quot;outline&quot;>
                            {new Date(
                              event.metadata?.timestamp || Date.now(),
                            ).toLocaleTimeString()}
                          </Badge>
                        </div>
                        <div className=&quot;text-sm&quot;>
                          <pre className=&quot;bg-muted p-2 rounded text-xs overflow-auto&quot;>
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className=&quot;rounded-md border border-dashed p-8 text-center&quot;>
                    <h3 className=&quot;font-semibold mb-2&quot;>No Events Yet</h3>
                    <p className=&quot;text-sm text-muted-foreground mb-4&quot;>
                      Waiting for events from the distributed event bus
                    </p>
                    {!isConnected && (
                      <Button onClick={reconnect} variant=&quot;outline&quot;>
                        <RefreshCw className=&quot;h-4 w-4 mr-2&quot; />
                        Connect to Event Stream
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className=&quot;flex justify-between&quot;>
              <div className=&quot;text-sm text-muted-foreground&quot;>
                {isConnected ? &quot;Connected to event stream&quot; : &quot;Disconnected&quot;}
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant=&quot;outline&quot;>Event Subscriptions</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Event Subscriptions</SheetTitle>
                  </SheetHeader>

                  <div className=&quot;py-4&quot;>
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
                        <SelectValue placeholder=&quot;Add Event Subscription&quot; />
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

                    <div className=&quot;mt-4&quot;>
                      <h4 className=&quot;text-sm font-semibold mb-2&quot;>
                        Active Subscriptions
                      </h4>
                      <div className=&quot;space-y-2&quot;>
                        {selectedEventTypes.map((eventType) => (
                          <div
                            key={eventType}
                            className=&quot;flex items-center justify-between rounded-md border px-4 py-2&quot;
                          >
                            <div className=&quot;text-sm&quot;>{eventType}</div>
                            <Button
                              variant=&quot;ghost&quot;
                              size=&quot;sm&quot;
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
                          <div className=&quot;text-sm text-muted-foreground text-center py-2&quot;>
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

        <TabsContent value=&quot;settings&quot;>
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure behavior of the event distribution system
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;space-y-4&quot;>
                <div>
                  <h3 className=&quot;text-lg font-semibold mb-2&quot;>
                    Feature Toggles
                  </h3>
                  <Separator className=&quot;my-2&quot; />
                  <div className=&quot;space-y-4&quot;>
                    <div className=&quot;flex items-center justify-between&quot;>
                      <div className=&quot;space-y-0.5&quot;>
                        <Label htmlFor=&quot;retry&quot;>Retry Mechanism</Label>
                        <p className=&quot;text-sm text-muted-foreground&quot;>
                          Automatically retry failed event deliveries
                        </p>
                      </div>
                      <Switch
                        id=&quot;retry&quot;
                        checked={features.retryEnabled}
                        onCheckedChange={() => toggleFeature(&quot;retryEnabled&quot;)}
                      />
                    </div>

                    <div className=&quot;flex items-center justify-between&quot;>
                      <div className=&quot;space-y-0.5&quot;>
                        <Label htmlFor=&quot;circuitBreaker&quot;>Circuit Breaker</Label>
                        <p className=&quot;text-sm text-muted-foreground&quot;>
                          Isolate failing components to prevent cascading
                          failures
                        </p>
                      </div>
                      <Switch
                        id=&quot;circuitBreaker&quot;
                        checked={features.circuitBreakerEnabled}
                        onCheckedChange={() =>
                          toggleFeature(&quot;circuitBreakerEnabled&quot;)
                        }
                      />
                    </div>

                    <div className=&quot;flex items-center justify-between&quot;>
                      <div className=&quot;space-y-0.5&quot;>
                        <Label htmlFor=&quot;websocket&quot;>WebSocket Channel</Label>
                        <p className=&quot;text-sm text-muted-foreground&quot;>
                          Enable real-time updates via WebSocket
                        </p>
                      </div>
                      <Switch
                        id=&quot;websocket&quot;
                        checked={features.websocketEnabled}
                        onCheckedChange={() =>
                          toggleFeature(&quot;websocketEnabled&quot;)
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
