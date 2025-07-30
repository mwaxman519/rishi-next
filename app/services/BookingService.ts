import { db } from &quot;../../lib/db&quot;;
import { bookings } from &quot;@shared/schema&quot;;
import { EventBusService } from &quot;./EventBusService&quot;;
import { ServiceRegistry } from &quot;./ServiceRegistry&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import { eq, and, desc } from &quot;drizzle-orm&quot;;

export interface BookingServiceInterface {
  getAllBookings(userId: string, organizationId: string, correlationId?: string): Promise<any[]>;
  getBookingById(bookingId: string, userId: string, correlationId?: string): Promise<any>;
  createBooking(data: any, userId: string, correlationId?: string): Promise<any>;
  updateBooking(bookingId: string, data: any, userId: string, correlationId?: string): Promise<any>;
  updateBookingStatus(bookingId: string, status: string, userId: string, correlationId?: string): Promise<any>;
}

export class BookingService implements BookingServiceInterface {
  private static instance: BookingService;
  private eventBus: EventBusService;
  private serviceRegistry: ServiceRegistry;

  constructor() {
    this.eventBus = new EventBusService();
    this.serviceRegistry = ServiceRegistry.getInstance();
  }

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  async getAllBookings(userId: string, organizationId: string, correlationId?: string): Promise<any[]> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      // Publish event for booking query
      await this.eventBus.publish({
        type: &quot;booking.query.started&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getAllBookings&quot;,
          queryType: &quot;list&quot;
        }
      });

      // Query database
      const allBookings = await db
        .select()
        .from(bookings)
        .orderBy(desc(bookings.createdAt));

      // Publish success event
      await this.eventBus.publish({
        type: &quot;booking.query.completed&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getAllBookings&quot;,
          resultCount: allBookings.length
        }
      });

      return allBookings;
    } catch (error) {
      // Publish error event
      await this.eventBus.publish({
        type: &quot;booking.query.failed&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getAllBookings&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }

  async getBookingById(bookingId: string, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: &quot;booking.query.started&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getBookingById&quot;,
          targetId: bookingId
        }
      });

      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      await this.eventBus.publish({
        type: &quot;booking.query.completed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getBookingById&quot;,
          found: !!booking
        }
      });

      return booking;
    } catch (error) {
      await this.eventBus.publish({
        type: &quot;booking.query.failed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getBookingById&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }

  async createBooking(data: any, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    const bookingId = uuidv4();
    
    try {
      await this.eventBus.publish({
        type: &quot;booking.create.started&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;createBooking&quot;,
          bookingTitle: data.title,
          bookingType: data.booking_type
        }
      });

      const [newBooking] = await db
        .insert(bookings)
        .values({
          id: bookingId,
          ...data,
          status: &quot;draft&quot;,
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();

      await this.eventBus.publish({
        type: &quot;booking.created&quot;,
        userId,
        organizationId: data.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;createBooking&quot;,
          bookingId: newBooking.id,
          bookingTitle: newBooking.title,
          bookingStatus: newBooking.status,
          startDate: newBooking.start_date,
          endDate: newBooking.end_date
        }
      });

      // Cannabis-specific booking lifecycle event
      await this.eventBus.publish({
        type: &quot;cannabis.booking.lifecycle&quot;,
        userId,
        organizationId: data.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          stage: &quot;draft&quot;,
          bookingId: newBooking.id,
          bookingType: data.booking_type,
          location: data.location_id,
          requiredStaff: data.staff_count
        }
      });

      return newBooking;
    } catch (error) {
      await this.eventBus.publish({
        type: &quot;booking.create.failed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;createBooking&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }

  async updateBooking(bookingId: string, data: any, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: &quot;booking.update.started&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateBooking&quot;,
          bookingId,
          updates: Object.keys(data)
        }
      });

      const [updatedBooking] = await db
        .update(bookings)
        .set({
          ...data,
          updated_at: new Date()
        })
        .where(eq(bookings.id, bookingId))
        .returning();

      await this.eventBus.publish({
        type: &quot;booking.updated&quot;,
        userId,
        organizationId: updatedBooking.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateBooking&quot;,
          bookingId,
          changes: Object.keys(data)
        }
      });

      return updatedBooking;
    } catch (error) {
      await this.eventBus.publish({
        type: &quot;booking.update.failed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateBooking&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }

  async updateBookingStatus(bookingId: string, status: string, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      // Get current booking to track status transition
      const [currentBooking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!currentBooking) {
        throw new Error(&quot;Booking not found&quot;);
      }

      await this.eventBus.publish({
        type: &quot;booking.status.update.started&quot;,
        userId,
        organizationId: currentBooking.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateBookingStatus&quot;,
          bookingId,
          fromStatus: currentBooking.status,
          toStatus: status
        }
      });

      const updateData: any = {
        status,
        updated_at: new Date()
      };

      // Add approval/rejection metadata
      if (status === &quot;approved&quot;) {
        updateData.approved_by = userId;
        updateData.approved_at = new Date();
      } else if (status === &quot;rejected&quot;) {
        updateData.rejected_by = userId;
        updateData.rejected_at = new Date();
      }

      const [updatedBooking] = await db
        .update(bookings)
        .set(updateData)
        .where(eq(bookings.id, bookingId))
        .returning();

      await this.eventBus.publish({
        type: &quot;booking.status.updated&quot;,
        userId,
        organizationId: updatedBooking.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateBookingStatus&quot;,
          bookingId,
          fromStatus: currentBooking.status,
          toStatus: status,
          transition: `${currentBooking.status} → ${status}`
        }
      });

      // Cannabis booking lifecycle event
      await this.eventBus.publish({
        type: &quot;cannabis.booking.lifecycle&quot;,
        userId,
        organizationId: updatedBooking.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          stage: status,
          bookingId,
          transition: `${currentBooking.status} → ${status}`,
          updatedBy: userId
        }
      });

      return updatedBooking;
    } catch (error) {
      await this.eventBus.publish({
        type: &quot;booking.status.update.failed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateBookingStatus&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }
}