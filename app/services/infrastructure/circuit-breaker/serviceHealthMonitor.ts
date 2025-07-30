/**
 * Service Health Monitoring System
 *
 * Provides centralized monitoring of service health:
 * - Regular health checks of registered services
 * - Health status dashboard
 * - Alert mechanism for service degradation
 * - Integration with circuit breakers
 */

import { CircuitBreaker, CircuitState } from "./circuitBreaker";

// Service health status
export enum HealthStatus {
  HEALTHY = "HEALTHY",
  DEGRADED = "DEGRADED",
  UNHEALTHY = "UNHEALTHY",
  UNKNOWN = "UNKNOWN",
}

// Health check options
export interface HealthCheckOptions {
  interval: number; // How often to check health (ms)
  timeout: number; // Timeout for health check (ms)
  unhealthyThreshold: number; // Number of failures before marking unhealthy
  degradedThreshold: number; // Number of failures before marking degraded
  healthyThreshold: number; // Number of successes before marking healthy
}

// Service descriptor
export interface ServiceDescriptor {
  id: string; // Unique service identifier
  name: string; // Display name
  description?: string; // Service description
  category?: string; // Service category (e.g., "core", "api")
  dependencies?: string[]; // IDs of services this depends on
  tags?: string[]; // Tags for grouping/filtering
  healthEndpoint?: string; // URL to check health
  healthCheck?: () => Promise<boolean>; // Custom health check function
  circuitBreaker?: CircuitBreaker; // Associated circuit breaker
}

// Service health record
export interface ServiceHealth {
  serviceId: string;
  status: HealthStatus;
  lastChecked?: Date;
  lastHealthy?: Date;
  lastUnhealthy?: Date;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  totalChecks: number;
  uptime: number; // percentage
  responseTime?: number; // ms
  message?: string;
  circuitState?: CircuitState;
}

// Alert configuration
export interface AlertConfig {
  enabled: boolean;
  handler: (serviceId: string, status: HealthStatus, message: string) => void;
  minInterval?: number; // Minimum time between alerts (ms)
}

/**
 * ServiceHealthMonitor class
 *
 * Centralized system for monitoring the health of registered services
 */
export class ServiceHealthMonitor {
  private services: Map<string, ServiceDescriptor> = new Map();
  private healthStatus: Map<string, ServiceHealth> = new Map();
  private healthCheckTimers: Map<string, NodeJS.Timeout> = new Map();
  private lastAlerts: Map<string, Date> = new Map();
  private defaultOptions: HealthCheckOptions = {
    interval: 300000, // 5 minutes (was 30 seconds - reduced to prevent excessive edge requests)
    timeout: 10000, // 10 seconds (increased for more reliable checks)
    unhealthyThreshold: 3,
    degradedThreshold: 1,
    healthyThreshold: 2,
  };
  private alertConfig: AlertConfig = {
    enabled: true,
    handler: (serviceId, status, message) => {
      console.warn(
        `HEALTH ALERT: Service ${serviceId} is ${status}: ${message}`,
      );
    },
    minInterval: 60000, // 1 minute
  };

  /**
   * Register a service to be monitored
   *
   * @param service The service descriptor
   * @param options Health check options
   * @returns The service ID
   */
  registerService(
    service: ServiceDescriptor,
    options?: Partial<HealthCheckOptions>,
  ): string {
    if (this.services.has(service.id)) {
      throw new Error(`Service with ID ${service.id} is already registered`);
    }

    // Merge with default options
    const healthCheckOptions = { ...this.defaultOptions, ...options };

    // Initialize health status
    this.healthStatus.set(service.id, {
      serviceId: service.id,
      status: HealthStatus.UNKNOWN,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      totalChecks: 0,
      uptime: 0,
    });

    // Store service descriptor
    this.services.set(service.id, service);

    // Listen for circuit breaker state changes if available
    if (service.circuitBreaker) {
      const originalStateChange = service.circuitBreaker.options.onStateChange;

      service.circuitBreaker.options.onStateChange = (from, to) => {
        // Call original handler if it exists
        if (originalStateChange) {
          originalStateChange(from, to);
        }

        // Update health status based on circuit state
        this.updateHealthFromCircuit(service.id, to);
      };

      // Initial update from circuit state
      this.updateHealthFromCircuit(
        service.id,
        service.circuitBreaker.getState(),
      );
    }

    // Start health check timer
    this.startHealthCheck(service.id, healthCheckOptions);

    return service.id;
  }

  /**
   * Unregister a service
   *
   * @param serviceId The service ID to unregister
   */
  unregisterService(serviceId: string): void {
    // Stop health check timer
    if (this.healthCheckTimers.has(serviceId)) {
      clearInterval(this.healthCheckTimers.get(serviceId)!);
      this.healthCheckTimers.delete(serviceId);
    }

    // Remove service and health status
    this.services.delete(serviceId);
    this.healthStatus.delete(serviceId);
  }

  /**
   * Start the health check timer for a service
   */
  private startHealthCheck(
    serviceId: string,
    options: HealthCheckOptions,
  ): void {
    // Clear existing timer if any
    if (this.healthCheckTimers.has(serviceId)) {
      clearInterval(this.healthCheckTimers.get(serviceId)!);
    }

    // Start new timer
    const timer = setInterval(() => {
      this.checkServiceHealth(serviceId, options);
    }, options.interval);

    this.healthCheckTimers.set(serviceId, timer);

    // Run an immediate check
    this.checkServiceHealth(serviceId, options);
  }

  /**
   * Check the health of a service
   */
  private async checkServiceHealth(
    serviceId: string,
    options: HealthCheckOptions,
  ): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) return;

    const health = this.healthStatus.get(serviceId);
    if (!health) return;

    // Update check timestamp
    health.lastChecked = new Date();
    health.totalChecks++;

    try {
      let isHealthy = false;
      let responseTime = 0;

      // Use the appropriate health check method
      if (service.healthCheck) {
        // Custom health check function
        const start = Date.now();

        // With timeout
        isHealthy = await Promise.race([
          service.healthCheck(),
          new Promise<boolean>((_, reject) => {
            setTimeout(
              () => reject(new Error("Health check timed out")),
              options.timeout,
            );
          }),
        ]);

        responseTime = Date.now() - start;
      } else if (service.healthEndpoint) {
        // HTTP health check
        const start = Date.now();

        const response = await Promise.race([
          fetch(service.healthEndpoint, {
            method: "GET",
            headers: { Accept: "application/json" },
          }),
          new Promise<Response>((_, reject) => {
            setTimeout(
              () => reject(new Error("Health check timed out")),
              options.timeout,
            );
          }),
        ]);

        responseTime = Date.now() - start;
        isHealthy = response.ok;
      } else if (service.circuitBreaker) {
        // Use circuit breaker state
        isHealthy = service.circuitBreaker.getState() === CircuitState.CLOSED;
      } else {
        // No health check method available
        health.message = "No health check method configured";
        this.updateHealthStatus(serviceId, HealthStatus.UNKNOWN);
        return;
      }

      // Update health stats based on check result
      if (isHealthy) {
        health.consecutiveSuccesses++;
        health.consecutiveFailures = 0;
        health.responseTime = responseTime;
        health.lastHealthy = new Date();

        // Calculate uptime percentage
        if (health.totalChecks > 0) {
          const healthyChecks = health.totalChecks - health.consecutiveFailures;
          health.uptime = (healthyChecks / health.totalChecks) * 100;
        }

        // Determine health status based on consecutive successes
        if (
          health.status !== HealthStatus.HEALTHY &&
          health.consecutiveSuccesses >= options.healthyThreshold
        ) {
          this.updateHealthStatus(serviceId, HealthStatus.HEALTHY);
        }
      } else {
        health.consecutiveFailures++;
        health.consecutiveSuccesses = 0;
        health.responseTime = responseTime;
        health.lastUnhealthy = new Date();

        // Determine health status based on consecutive failures
        if (health.consecutiveFailures >= options.unhealthyThreshold) {
          this.updateHealthStatus(serviceId, HealthStatus.UNHEALTHY);
        } else if (health.consecutiveFailures >= options.degradedThreshold) {
          this.updateHealthStatus(serviceId, HealthStatus.DEGRADED);
        }
      }
    } catch (error) {
      // Health check failed
      health.consecutiveFailures++;
      health.consecutiveSuccesses = 0;
      health.lastUnhealthy = new Date();
      health.message = error instanceof Error ? error.message : String(error);

      // Determine health status based on consecutive failures
      if (health.consecutiveFailures >= options.unhealthyThreshold) {
        this.updateHealthStatus(serviceId, HealthStatus.UNHEALTHY);
      } else if (health.consecutiveFailures >= options.degradedThreshold) {
        this.updateHealthStatus(serviceId, HealthStatus.DEGRADED);
      }
    }
  }

  /**
   * Update health status from circuit breaker state
   */
  private updateHealthFromCircuit(
    serviceId: string,
    circuitState: CircuitState,
  ): void {
    const health = this.healthStatus.get(serviceId);
    if (!health) return;

    health.circuitState = circuitState;

    // Map circuit state to health status
    switch (circuitState) {
      case CircuitState.CLOSED:
        this.updateHealthStatus(serviceId, HealthStatus.HEALTHY);
        break;
      case CircuitState.HALF_OPEN:
        this.updateHealthStatus(serviceId, HealthStatus.DEGRADED);
        break;
      case CircuitState.OPEN:
        this.updateHealthStatus(serviceId, HealthStatus.UNHEALTHY);
        break;
    }
  }

  /**
   * Update the health status of a service
   */
  private updateHealthStatus(serviceId: string, status: HealthStatus): void {
    const health = this.healthStatus.get(serviceId);
    if (!health) return;

    const oldStatus = health.status;
    health.status = status;

    // If status changed to something worse, send an alert
    if (
      this.alertConfig.enabled &&
      this.isStatusDegradation(oldStatus, status)
    ) {
      this.sendAlert(
        serviceId,
        status,
        health.message || "Service health status changed",
      );
    }
  }

  /**
   * Check if status change is a degradation
   */
  private isStatusDegradation(
    oldStatus: HealthStatus,
    newStatus: HealthStatus,
  ): boolean {
    if (oldStatus === newStatus) return false;

    const severityOrder = [
      HealthStatus.HEALTHY,
      HealthStatus.UNKNOWN,
      HealthStatus.DEGRADED,
      HealthStatus.UNHEALTHY,
    ];

    return severityOrder.indexOf(newStatus) > severityOrder.indexOf(oldStatus);
  }

  /**
   * Send an alert for a service status change
   */
  private sendAlert(
    serviceId: string,
    status: HealthStatus,
    message: string,
  ): void {
    // Check if we should throttle alerts
    if (this.alertConfig.minInterval) {
      const lastAlert = this.lastAlerts.get(serviceId);

      if (
        lastAlert &&
        Date.now() - lastAlert.getTime() < this.alertConfig.minInterval
      ) {
        return;
      }

      this.lastAlerts.set(serviceId, new Date());
    }

    // Send the alert
    this.alertConfig.handler(serviceId, status, message);
  }

  /**
   * Configure the alert handler
   */
  setAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  /**
   * Get the health status of a specific service
   */
  getServiceHealth(serviceId: string): ServiceHealth | undefined {
    return this.healthStatus.get(serviceId);
  }

  /**
   * Get the health status of all services
   */
  getAllServicesHealth(): Record<string, ServiceHealth> {
    const result: Record<string, ServiceHealth> = {};

    for (const [id, health] of this.healthStatus.entries()) {
      result[id] = { ...health };
    }

    return result;
  }

  /**
   * Get a list of unhealthy services
   */
  getUnhealthyServices(): ServiceHealth[] {
    return Array.from(this.healthStatus.values()).filter(
      (health) => health.status === HealthStatus.UNHEALTHY,
    );
  }

  /**
   * Get a list of degraded services
   */
  getDegradedServices(): ServiceHealth[] {
    return Array.from(this.healthStatus.values()).filter(
      (health) => health.status === HealthStatus.DEGRADED,
    );
  }

  /**
   * Get overall system health
   */
  getSystemHealth(): {
    status: HealthStatus;
    healthyCount: number;
    degradedCount: number;
    unhealthyCount: number;
    unknownCount: number;
    totalCount: number;
  } {
    const healthyCount = Array.from(this.healthStatus.values()).filter(
      (health) => health.status === HealthStatus.HEALTHY,
    ).length;

    const degradedCount = Array.from(this.healthStatus.values()).filter(
      (health) => health.status === HealthStatus.DEGRADED,
    ).length;

    const unhealthyCount = Array.from(this.healthStatus.values()).filter(
      (health) => health.status === HealthStatus.UNHEALTHY,
    ).length;

    const unknownCount = Array.from(this.healthStatus.values()).filter(
      (health) => health.status === HealthStatus.UNKNOWN,
    ).length;

    const totalCount = this.healthStatus.size;

    let status = HealthStatus.HEALTHY;

    if (unhealthyCount > 0) {
      status = HealthStatus.UNHEALTHY;
    } else if (degradedCount > 0) {
      status = HealthStatus.DEGRADED;
    } else if (healthyCount === 0 && totalCount > 0) {
      status = HealthStatus.UNKNOWN;
    }

    return {
      status,
      healthyCount,
      degradedCount,
      unhealthyCount,
      unknownCount,
      totalCount,
    };
  }

  /**
   * Manually set a service as healthy or unhealthy
   */
  setServiceStatus(
    serviceId: string,
    status: HealthStatus,
    message?: string,
  ): void {
    const health = this.healthStatus.get(serviceId);
    if (!health) return;

    const oldStatus = health.status;
    health.status = status;

    if (message) {
      health.message = message;
    }

    if (status === HealthStatus.HEALTHY) {
      health.lastHealthy = new Date();
      health.consecutiveSuccesses = this.defaultOptions.healthyThreshold;
      health.consecutiveFailures = 0;
    } else if (status === HealthStatus.UNHEALTHY) {
      health.lastUnhealthy = new Date();
      health.consecutiveFailures = this.defaultOptions.unhealthyThreshold;
      health.consecutiveSuccesses = 0;
    }

    // If status changed to something worse, send an alert
    if (
      this.alertConfig.enabled &&
      this.isStatusDegradation(oldStatus, status)
    ) {
      this.sendAlert(
        serviceId,
        status,
        health.message || "Service health status manually changed",
      );
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    // Clear all timers
    for (const timer of this.healthCheckTimers.values()) {
      clearInterval(timer);
    }

    this.healthCheckTimers.clear();
  }
}

// Export singleton instance
export const serviceHealthMonitor = new ServiceHealthMonitor();
