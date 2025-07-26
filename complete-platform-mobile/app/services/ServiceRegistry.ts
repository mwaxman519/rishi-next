export class ServiceRegistry {
  private static instance: ServiceRegistry;
  
  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }
  
  register(name: string, service: any): void {
    // Minimal implementation
  }
}
