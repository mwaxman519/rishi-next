export class EventBusService {
  publish(event: string, data?: any, correlationId?: string): void {
    // Minimal implementation
    console.log('Event:', event, data);
  }
}
