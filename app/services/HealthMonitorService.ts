/**
 * Health Monitor Service for Microservices
 * Monitors system health and provides comprehensive health checks
 */

import { db } from '../db';
import { EventBusService } from './EventBusService';
import { CircuitBreakerService } from './CircuitBreakerService';
// import { v4 as uuidv4 } from 'uuid';
// Using crypto.randomUUID() instead of uuid package to avoid dependency issues
function generateId() {
  return crypto.randomUUID();
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  timestamp: Date;
  responseTime?: number;
  details?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: Date;
  uptime: number;
  version: string;
}

export class HealthMonitorService {
  private static instance: HealthMonitorService;
  private startTime: Date = new Date();
  private healthChecks: Map<string, () => Promise<HealthCheck>> = new Map();
  private lastHealthStatus: SystemHealth | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.registerDefaultHealthChecks();
  }

  static getInstance(): HealthMonitorService {
    if (!HealthMonitorService.instance) {
      HealthMonitorService.instance = new HealthMonitorService();
    }
    return HealthMonitorService.instance;
  }

  private registerDefaultHealthChecks(): void {
    // Database health check
    this.registerHealthCheck('database', async () => {
      const startTime = Date.now();
      try {
        // Simple database connectivity check
        await db.execute('SELECT 1');
        return {
          name: 'database',
          status: 'healthy' as const,
          message: 'Database connection is healthy',
          timestamp: new Date(),
          responseTime: Date.now() - startTime,
        };
      } catch (error) {
        return {
          name: 'database',
          status: 'unhealthy' as const,
          message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          responseTime: Date.now() - startTime,
        };
      }
    });

    // Memory health check
    this.registerHealthCheck('memory', async () => {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const usagePercentage = (heapUsedMB / heapTotalMB) * 100;

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = `Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercentage.toFixed(1)}%)`;

      if (usagePercentage > 90) {
        status = 'unhealthy';
        message = `High memory usage: ${message}`;
      } else if (usagePercentage > 75) {
        status = 'degraded';
        message = `Elevated memory usage: ${message}`;
      }

      return {
        name: 'memory',
        status,
        message,
        timestamp: new Date(),
        details: {
          heapUsed: heapUsedMB,
          heapTotal: heapTotalMB,
          usagePercentage: usagePercentage.toFixed(1),
        },
      };
    });

    // Event Bus health check
    this.registerHealthCheck('eventbus', async () => {
      try {
        const eventBus = EventBusService.getInstance();
        const testEvent = {
          id: generateId(),
          type: 'health.check',
          userId: 'system',
          timestamp: new Date(),
          data: { test: true },
          correlationId: generateId(),
        };

        // Test event publishing
        eventBus.publish(testEvent);

        return {
          name: 'eventbus',
          status: 'healthy' as const,
          message: 'Event bus is operational',
          timestamp: new Date(),
        };
      } catch (error) {
        return {
          name: 'eventbus',
          status: 'unhealthy' as const,
          message: `Event bus error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        };
      }
    });

    // Circuit breaker health check
    this.registerHealthCheck('circuitbreakers', async () => {
      try {
        const circuitBreaker = CircuitBreakerService.getInstance();
        const circuits = circuitBreaker.getAllCircuits();
        
        const openCircuits = circuits.filter(c => c.state === 'open');
        const halfOpenCircuits = circuits.filter(c => c.state === 'half-open');

        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
        let message = `${circuits.length} circuit breakers monitored`;

        if (openCircuits.length > 0) {
          status = 'degraded';
          message = `${openCircuits.length} circuit breaker(s) open: ${openCircuits.map(c => c.name).join(', ')}`;
        }

        if (halfOpenCircuits.length > 0) {
          status = 'degraded';
          message += ` | ${halfOpenCircuits.length} circuit breaker(s) half-open: ${halfOpenCircuits.map(c => c.name).join(', ')}`;
        }

        return {
          name: 'circuitbreakers',
          status,
          message,
          timestamp: new Date(),
          details: {
            total: circuits.length,
            open: openCircuits.length,
            halfOpen: halfOpenCircuits.length,
            closed: circuits.length - openCircuits.length - halfOpenCircuits.length,
          },
        };
      } catch (error) {
        return {
          name: 'circuitbreakers',
          status: 'unhealthy' as const,
          message: `Circuit breaker monitoring error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        };
      }
    });
  }

  registerHealthCheck(name: string, check: () => Promise<HealthCheck>): void {
    this.healthChecks.set(name, check);
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const checks: HealthCheck[] = [];

    // Run all health checks
    for (const [name, check] of this.healthChecks) {
      try {
        const result = await check();
        checks.push(result);
      } catch (error) {
        checks.push({
          name,
          status: 'unhealthy',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        });
      }
    }

    // Determine overall system status
    const unhealthyChecks = checks.filter(c => c.status === 'unhealthy');
    const degradedChecks = checks.filter(c => c.status === 'degraded');

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyChecks.length > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedChecks.length > 0) {
      overallStatus = 'degraded';
    }

    const systemHealth: SystemHealth = {
      status: overallStatus,
      checks,
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    this.lastHealthStatus = systemHealth;

    // Publish health status change events
    if (this.lastHealthStatus && this.lastHealthStatus.status !== overallStatus) {
      const eventBus = EventBusService.getInstance();
      eventBus.publish({
        id: generateId(),
        type: 'system.health.status_changed',
        userId: 'system',
        timestamp: new Date(),
        data: {
          previousStatus: this.lastHealthStatus.status,
          currentStatus: overallStatus,
          checks: checks.filter(c => c.status !== 'healthy'),
        },
        correlationId: generateId(),
      });
    }

    return systemHealth;
  }

  async getHealthCheck(name: string): Promise<HealthCheck | null> {
    const check = this.healthChecks.get(name);
    if (!check) return null;

    try {
      return await check();
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.getSystemHealth();
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  getLastHealthStatus(): SystemHealth | null {
    return this.lastHealthStatus;
  }
}