/**
 * Service Registry for Microservices Architecture
 * Manages service discovery and dependency injection
 */

import { OrganizationService } from './OrganizationService';
import { LocationService } from './LocationService';
import { BookingService } from './BookingService';
import { EventBusService } from './EventBusService';
import { CircuitBreakerService } from './CircuitBreakerService';
import { HealthMonitorService } from './HealthMonitorService';

export interface ServiceConfig {
  name: string;
  version: string;
  dependencies: string[];
  healthCheck?: () => Promise<boolean>;
  circuitBreakerConfig?: {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
    successThreshold: number;
  };
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any> = new Map();
  private serviceConfigs: Map<string, ServiceConfig> = new Map();
  private dependencies: Map<string, string[]> = new Map();
  private initialized = false;

  private constructor() {}

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[Service Registry] Initializing microservices...');

    // Register core services
    this.registerService('eventBus', EventBusService.getInstance(), {
      name: 'eventBus',
      version: '1.0.0',
      dependencies: [],
    });

    this.registerService('circuitBreaker', CircuitBreakerService.getInstance(), {
      name: 'circuitBreaker',
      version: '1.0.0',
      dependencies: [],
    });

    this.registerService('healthMonitor', HealthMonitorService.getInstance(), {
      name: 'healthMonitor',
      version: '1.0.0',
      dependencies: ['eventBus', 'circuitBreaker'],
    });

    // Register business services
    this.registerService('organizationService', OrganizationService.getInstance(), {
      name: 'organizationService',
      version: '1.0.0',
      dependencies: ['eventBus'],
      circuitBreakerConfig: {
        failureThreshold: 5,
        resetTimeout: 30000,
        monitoringPeriod: 60000,
        successThreshold: 3,
      },
    });

    this.registerService('locationService', LocationService.getInstance(), {
      name: 'locationService',
      version: '1.0.0',
      dependencies: ['eventBus'],
      circuitBreakerConfig: {
        failureThreshold: 5,
        resetTimeout: 30000,
        monitoringPeriod: 60000,
        successThreshold: 3,
      },
    });

    this.registerService('bookingService', BookingService.getInstance(), {
      name: 'bookingService',
      version: '1.0.0',
      dependencies: ['eventBus', 'locationService'],
      circuitBreakerConfig: {
        failureThreshold: 5,
        resetTimeout: 30000,
        monitoringPeriod: 60000,
        successThreshold: 3,
      },
    });

    // Initialize circuit breakers
    await this.initializeCircuitBreakers();

    // Start health monitoring
    const healthMonitor = this.getService<HealthMonitorService>('healthMonitor');
    if (healthMonitor) {
      healthMonitor.startMonitoring(30000); // Monitor every 30 seconds
    }

    this.initialized = true;
    console.log('[Service Registry] Microservices initialized successfully');
  }

  private registerService<T>(name: string, service: T, config: ServiceConfig): void {
    this.services.set(name, service);
    this.serviceConfigs.set(name, config);
    this.dependencies.set(name, config.dependencies);
  }

  private async initializeCircuitBreakers(): Promise<void> {
    const circuitBreaker = this.getService<CircuitBreakerService>('circuitBreaker');
    if (!circuitBreaker) return;

    for (const [serviceName, config] of this.serviceConfigs) {
      if (config.circuitBreakerConfig) {
        circuitBreaker.registerCircuit(serviceName, config.circuitBreakerConfig);
      }
    }
  }

  getService<T>(name: string): T | null {
    return this.services.get(name) || null;
  }

  getAllServices(): Array<{
    name: string;
    config: ServiceConfig;
    status: 'active' | 'inactive';
  }> {
    return Array.from(this.serviceConfigs.entries()).map(([name, config]) => ({
      name,
      config,
      status: this.services.has(name) ? 'active' : 'inactive',
    }));
  }

  async executeWithResilience<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.getService<CircuitBreakerService>('circuitBreaker');
    
    if (circuitBreaker) {
      return await circuitBreaker.executeWithCircuitBreaker(
        serviceName,
        operation,
        fallback
      );
    }

    // Fallback to direct execution if circuit breaker is not available
    try {
      return await operation();
    } catch (error) {
      if (fallback) {
        return await fallback();
      }
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    console.log('[Service Registry] Shutting down microservices...');

    // Stop health monitoring
    const healthMonitor = this.getService<HealthMonitorService>('healthMonitor');
    if (healthMonitor) {
      healthMonitor.stopMonitoring();
    }

    // Clear all services
    this.services.clear();
    this.serviceConfigs.clear();
    this.dependencies.clear();
    this.initialized = false;

    console.log('[Service Registry] Microservices shutdown complete');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getDependencies(serviceName: string): string[] {
    return this.dependencies.get(serviceName) || [];
  }

  getServiceConfig(serviceName: string): ServiceConfig | null {
    return this.serviceConfigs.get(serviceName) || null;
  }
}