&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Clock,
  Activity,
} from &quot;lucide-react&quot;;
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
import { Progress } from &quot;@/components/ui/progress&quot;;
import {
  serviceHealthMonitor,
  HealthStatus,
  ServiceHealth,
} from &quot;@/services/infrastructure/circuit-breaker/serviceHealthMonitor&quot;;
import { CircuitState } from &quot;@/services/infrastructure/circuit-breaker/circuitBreaker&quot;;

// This would be populated with real services from the ServiceHealthMonitor
// API endpoint in production
const useServiceHealth = () => {
  const [health, setHealth] = useState<Record<string, ServiceHealth>>({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from API endpoint
      // For now, just return the current state
      const servicesHealth = serviceHealthMonitor.getAllServicesHealth();
      setHealth(servicesHealth);
    } catch (error) {
      console.error(&quot;Failed to fetch service health:&quot;, error);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchHealth();

    // Only refresh on manual request - no automatic polling to prevent excessive edge requests
    // Previously was polling every 30 seconds causing 2,880 requests per day
    // const interval = setInterval(fetchHealth, 30000);
    // return () => clearInterval(interval);
  }, []);

  return { health, loading, lastRefresh, refreshHealth: fetchHealth };
};

// Status icon component
const StatusIcon = ({ status }: { status: HealthStatus }) => {
  switch (status) {
    case HealthStatus.HEALTHY:
      return <CheckCircle className=&quot;h-5 w-5 text-green-500&quot; />;
    case HealthStatus.DEGRADED:
      return <AlertTriangle className=&quot;h-5 w-5 text-amber-500&quot; />;
    case HealthStatus.UNHEALTHY:
      return <AlertCircle className=&quot;h-5 w-5 text-red-500&quot; />;
    default:
      return <HelpCircle className=&quot;h-5 w-5 text-gray-400&quot; />;
  }
};

// Service health card component
const ServiceHealthCard = ({
  serviceId,
  health,
  onResetCircuit,
}: {
  serviceId: string;
  health: ServiceHealth;
  onResetCircuit: (serviceId: string) => void;
}) => {
  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.HEALTHY:
        return &quot;bg-green-50 border-green-200&quot;;
      case HealthStatus.DEGRADED:
        return &quot;bg-amber-50 border-amber-200&quot;;
      case HealthStatus.UNHEALTHY:
        return &quot;bg-red-50 border-red-200&quot;;
      default:
        return &quot;bg-gray-50 border-gray-200&quot;;
    }
  };

  const getCircuitStateLabel = (state?: CircuitState) => {
    if (!state) return null;

    switch (state) {
      case CircuitState.CLOSED:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-green-100 text-green-800 border-green-200&quot;
          >
            Closed
          </Badge>
        );
      case CircuitState.HALF_OPEN:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-amber-100 text-amber-800 border-amber-200&quot;
          >
            Half-Open
          </Badge>
        );
      case CircuitState.OPEN:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-red-100 text-red-800 border-red-200&quot;
          >
            Open
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const timeAgo = (date: Date | undefined) => {
    if (!date) return &quot;Never&quot;;

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className={`border-2 ${getStatusColor(health.status)}`}>
      <CardHeader className=&quot;pb-2&quot;>
        <div className=&quot;flex justify-between items-start&quot;>
          <div>
            <CardTitle className=&quot;text-lg flex items-center gap-2&quot;>
              <StatusIcon status={health.status} />
              {serviceId}
            </CardTitle>
            <CardDescription>
              {health.message ||
                (health.status === HealthStatus.HEALTHY
                  ? &quot;Service is operating normally&quot;
                  : health.status === HealthStatus.DEGRADED
                    ? &quot;Service is experiencing issues&quot;
                    : health.status === HealthStatus.UNHEALTHY
                      ? &quot;Service is unavailable&quot;
                      : &quot;Service health is unknown&quot;)}
            </CardDescription>
          </div>
          {getCircuitStateLabel(health.circuitState)}
        </div>
      </CardHeader>
      <CardContent className=&quot;pb-0&quot;>
        <div className=&quot;grid grid-cols-2 gap-4 text-sm&quot;>
          <div>
            <p className=&quot;text-muted-foreground&quot;>Uptime</p>
            <div className=&quot;mt-1&quot;>
              <Progress value={health.uptime} className=&quot;h-2&quot; />
              <p className=&quot;mt-1 font-medium&quot;>{health.uptime.toFixed(1)}%</p>
            </div>
          </div>
          <div>
            <p className=&quot;text-muted-foreground&quot;>Response Time</p>
            <p className=&quot;font-medium&quot;>
              {health.responseTime
                ? formatDuration(health.responseTime)
                : &quot;N/A&quot;}
            </p>
          </div>
          <div>
            <p className=&quot;text-muted-foreground&quot;>Last Checked</p>
            <p className=&quot;font-medium flex items-center gap-1&quot;>
              <Clock className=&quot;h-3.5 w-3.5 text-muted-foreground&quot; />
              {health.lastChecked ? timeAgo(health.lastChecked) : &quot;Never&quot;}
            </p>
          </div>
          <div>
            <p className=&quot;text-muted-foreground&quot;>Last Healthy</p>
            <p className=&quot;font-medium flex items-center gap-1&quot;>
              <Activity className=&quot;h-3.5 w-3.5 text-muted-foreground&quot; />
              {health.lastHealthy ? timeAgo(health.lastHealthy) : &quot;Never&quot;}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className=&quot;pt-4&quot;>
        {health.circuitState === CircuitState.OPEN && (
          <Button
            variant=&quot;outline&quot;
            size=&quot;sm&quot;
            onClick={() => onResetCircuit(serviceId)}
            className=&quot;w-full&quot;
          >
            Reset Circuit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// System health summary component
const SystemHealthSummary = ({
  healthData,
}: {
  healthData: Record<string, ServiceHealth>;
}) => {
  const services = Object.values(healthData);
  const totalServices = services.length;

  const healthyCount = services.filter(
    (s) => s.status === HealthStatus.HEALTHY,
  ).length;
  const degradedCount = services.filter(
    (s) => s.status === HealthStatus.DEGRADED,
  ).length;
  const unhealthyCount = services.filter(
    (s) => s.status === HealthStatus.UNHEALTHY,
  ).length;
  const unknownCount = services.filter(
    (s) => s.status === HealthStatus.UNKNOWN,
  ).length;

  let overallStatus = HealthStatus.HEALTHY;
  if (unhealthyCount > 0) {
    overallStatus = HealthStatus.UNHEALTHY;
  } else if (degradedCount > 0) {
    overallStatus = HealthStatus.DEGRADED;
  } else if (healthyCount === 0 && totalServices > 0) {
    overallStatus = HealthStatus.UNKNOWN;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className=&quot;flex items-center gap-2&quot;>
          <StatusIcon status={overallStatus} />
          System Health
        </CardTitle>
        <CardDescription>
          {overallStatus === HealthStatus.HEALTHY
            ? &quot;All systems operational&quot;
            : overallStatus === HealthStatus.DEGRADED
              ? &quot;Some services are experiencing issues&quot;
              : overallStatus === HealthStatus.UNHEALTHY
                ? &quot;Critical services are unavailable&quot;
                : &quot;Service health is unknown&quot;}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className=&quot;grid grid-cols-4 gap-4&quot;>
          <div className=&quot;text-center&quot;>
            <div className=&quot;text-3xl font-bold text-green-500&quot;>
              {healthyCount}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Healthy</div>
          </div>
          <div className=&quot;text-center&quot;>
            <div className=&quot;text-3xl font-bold text-amber-500&quot;>
              {degradedCount}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Degraded</div>
          </div>
          <div className=&quot;text-center&quot;>
            <div className=&quot;text-3xl font-bold text-red-500&quot;>
              {unhealthyCount}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Unhealthy</div>
          </div>
          <div className=&quot;text-center&quot;>
            <div className=&quot;text-3xl font-bold text-gray-400&quot;>
              {unknownCount}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Unknown</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Service Health Dashboard
 *
 * Displays the health status of all registered services
 */
export function ServiceHealthDashboard() {
  const { health, loading, lastRefresh, refreshHealth } = useServiceHealth();
  const [activeTab, setActiveTab] = useState(&quot;all&quot;);

  const filteredServices = Object.entries(health).filter(
    ([_, serviceHealth]) => {
      if (activeTab === &quot;all&quot;) return true;
      if (activeTab === &quot;healthy&quot;)
        return serviceHealth.status === HealthStatus.HEALTHY;
      if (activeTab === &quot;degraded&quot;)
        return serviceHealth.status === HealthStatus.DEGRADED;
      if (activeTab === &quot;unhealthy&quot;)
        return serviceHealth.status === HealthStatus.UNHEALTHY;
      return true;
    },
  );

  const handleResetCircuit = (serviceId: string) => {
    // In production, this would call an API endpoint
    console.log(`Resetting circuit for service: ${serviceId}`);
  };

  return (
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h2 className=&quot;text-3xl font-bold tracking-tight&quot;>Service Health</h2>
        <div className=&quot;flex items-center gap-2&quot;>
          <span className=&quot;text-sm text-muted-foreground&quot;>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant=&quot;outline&quot;
            size=&quot;sm&quot;
            onClick={refreshHealth}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? &quot;animate-spin&quot; : "&quot;}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <SystemHealthSummary healthData={health} />

      <Tabs defaultValue=&quot;all&quot; value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value=&quot;all&quot;>All Services</TabsTrigger>
          <TabsTrigger value=&quot;healthy&quot;>Healthy</TabsTrigger>
          <TabsTrigger value=&quot;degraded&quot;>Degraded</TabsTrigger>
          <TabsTrigger value=&quot;unhealthy&quot;>Unhealthy</TabsTrigger>
        </TabsList>
        <TabsContent value=&quot;all&quot; className=&quot;mt-6&quot;>
          {loading && Object.keys(health).length === 0 ? (
            <div className=&quot;text-center py-8&quot;>
              <RefreshCw className=&quot;h-8 w-8 mx-auto animate-spin text-muted-foreground&quot; />
              <p className=&quot;mt-2 text-muted-foreground&quot;>
                Loading service health data...
              </p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className=&quot;text-center py-8&quot;>
              <p className=&quot;text-muted-foreground&quot;>
                No services registered for monitoring
              </p>
            </div>
          ) : (
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
              {filteredServices.map(([serviceId, serviceHealth]) => (
                <ServiceHealthCard
                  key={serviceId}
                  serviceId={serviceId}
                  health={serviceHealth}
                  onResetCircuit={handleResetCircuit}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value=&quot;healthy&quot; className=&quot;mt-6&quot;>
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
            {filteredServices.map(([serviceId, serviceHealth]) => (
              <ServiceHealthCard
                key={serviceId}
                serviceId={serviceId}
                health={serviceHealth}
                onResetCircuit={handleResetCircuit}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value=&quot;degraded&quot; className=&quot;mt-6&quot;>
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
            {filteredServices.map(([serviceId, serviceHealth]) => (
              <ServiceHealthCard
                key={serviceId}
                serviceId={serviceId}
                health={serviceHealth}
                onResetCircuit={handleResetCircuit}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value=&quot;unhealthy&quot; className=&quot;mt-6&quot;>
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(([serviceId, serviceHealth]) => (
              <ServiceHealthCard
                key={serviceId}
                serviceId={serviceId}
                health={serviceHealth}
                onResetCircuit={handleResetCircuit}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
