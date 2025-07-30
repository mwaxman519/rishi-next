"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Clock,
  Activity,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  serviceHealthMonitor,
  HealthStatus,
  ServiceHealth,
} from "@/services/infrastructure/circuit-breaker/serviceHealthMonitor";
import { CircuitState } from "@/services/infrastructure/circuit-breaker/circuitBreaker";

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
      console.error("Failed to fetch service health:", error);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchHealth();

    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return { health, loading, lastRefresh, refreshHealth: fetchHealth };
};

// Status icon component
const StatusIcon = ({ status }: { status: HealthStatus }) => {
  switch (status) {
    case HealthStatus.HEALTHY:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case HealthStatus.DEGRADED:
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case HealthStatus.UNHEALTHY:
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <HelpCircle className="h-5 w-5 text-gray-400" />;
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
        return "bg-green-50 border-green-200";
      case HealthStatus.DEGRADED:
        return "bg-amber-50 border-amber-200";
      case HealthStatus.UNHEALTHY:
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getCircuitStateLabel = (state?: CircuitState) => {
    if (!state) return null;

    switch (state) {
      case CircuitState.CLOSED:
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Closed
          </Badge>
        );
      case CircuitState.HALF_OPEN:
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-200"
          >
            Half-Open
          </Badge>
        );
      case CircuitState.OPEN:
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200"
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
    if (!date) return "Never";

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className={`border-2 ${getStatusColor(health.status)}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <StatusIcon status={health.status} />
              {serviceId}
            </CardTitle>
            <CardDescription>
              {health.message ||
                (health.status === HealthStatus.HEALTHY
                  ? "Service is operating normally"
                  : health.status === HealthStatus.DEGRADED
                    ? "Service is experiencing issues"
                    : health.status === HealthStatus.UNHEALTHY
                      ? "Service is unavailable"
                      : "Service health is unknown")}
            </CardDescription>
          </div>
          {getCircuitStateLabel(health.circuitState)}
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Uptime</p>
            <div className="mt-1">
              <Progress value={health.uptime} className="h-2" />
              <p className="mt-1 font-medium">{health.uptime.toFixed(1)}%</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Response Time</p>
            <p className="font-medium">
              {health.responseTime
                ? formatDuration(health.responseTime)
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Checked</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {health.lastChecked ? timeAgo(health.lastChecked) : "Never"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Healthy</p>
            <p className="font-medium flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              {health.lastHealthy ? timeAgo(health.lastHealthy) : "Never"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        {health.circuitState === CircuitState.OPEN && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResetCircuit(serviceId)}
            className="w-full"
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
        <CardTitle className="flex items-center gap-2">
          <StatusIcon status={overallStatus} />
          System Health
        </CardTitle>
        <CardDescription>
          {overallStatus === HealthStatus.HEALTHY
            ? "All systems operational"
            : overallStatus === HealthStatus.DEGRADED
              ? "Some services are experiencing issues"
              : overallStatus === HealthStatus.UNHEALTHY
                ? "Critical services are unavailable"
                : "Service health is unknown"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">
              {healthyCount}
            </div>
            <div className="text-sm text-muted-foreground">Healthy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-500">
              {degradedCount}
            </div>
            <div className="text-sm text-muted-foreground">Degraded</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">
              {unhealthyCount}
            </div>
            <div className="text-sm text-muted-foreground">Unhealthy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">
              {unknownCount}
            </div>
            <div className="text-sm text-muted-foreground">Unknown</div>
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
  const [activeTab, setActiveTab] = useState("all");

  const filteredServices = Object.entries(health).filter(
    ([_, serviceHealth]) => {
      if (activeTab === "all") return true;
      if (activeTab === "healthy")
        return serviceHealth.status === HealthStatus.HEALTHY;
      if (activeTab === "degraded")
        return serviceHealth.status === HealthStatus.DEGRADED;
      if (activeTab === "unhealthy")
        return serviceHealth.status === HealthStatus.UNHEALTHY;
      return true;
    },
  );

  const handleResetCircuit = (serviceId: string) => {
    // In production, this would call an API endpoint
    console.log(`Resetting circuit for service: ${serviceId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Service Health</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshHealth}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <SystemHealthSummary healthData={health} />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="healthy">Healthy</TabsTrigger>
          <TabsTrigger value="degraded">Degraded</TabsTrigger>
          <TabsTrigger value="unhealthy">Unhealthy</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {loading && Object.keys(health).length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                Loading service health data...
              </p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No services registered for monitoring
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <TabsContent value="healthy" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <TabsContent value="degraded" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <TabsContent value="unhealthy" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
