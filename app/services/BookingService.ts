import { db } from "../../lib/db";
import { bookings } from "@shared/schema";
import { EventBusService } from "./EventBusService";
import { ServiceRegistry } from "./ServiceRegistry";
import { v4 as uuidv4 } from "uuid";
import { eq, and, desc } from "drizzle-orm";

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
        type: "booking.query.started",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getAllBookings",
          queryType: "list"
        }
      });

      // Query database
      const allBookings = await db
        .select()
        .from(bookings)
        .orderBy(desc(bookings.createdAt));

      // Publish success event
      await this.eventBus.publish({
        type: "booking.query.completed",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getAllBookings",
          resultCount: allBookings.length
        }
      });

      return allBookings;
    } catch (error) {
      // Publish error event
      await this.eventBus.publish({
        type: "booking.query.failed",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getAllBookings",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }

  async getBookingById(bookingId: string, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: "booking.query.started",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getBookingById",
          targetId: bookingId
        }
      });

      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      await this.eventBus.publish({
        type: "booking.query.completed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getBookingById",
          found: !!booking
        }
      });

      return booking;
    } catch (error) {
      await this.eventBus.publish({
        type: "booking.query.failed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getBookingById",
          error: error instanceof Error ? error.message : "Unknown error"
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
        type: "booking.create.started",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "createBooking",
          bookingTitle: data.title,
          bookingType: data.booking_type
        }
      });

      const [newBooking] = await db
        .insert(bookings)
        .values({
          id: bookingId,
          ...data,
          status: "draft",
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();

      await this.eventBus.publish({
        type: "booking.created",
        userId,
        organizationId: data.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "createBooking",
          bookingId: newBooking.id,
          bookingTitle: newBooking.title,
          bookingStatus: newBooking.status,
          startDate: newBooking.start_date,
          endDate: newBooking.end_date
        }
      });

      // Cannabis-specific booking lifecycle event
      await this.eventBus.publish({
        type: "cannabis.booking.lifecycle",
        userId,
        organizationId: data.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          stage: "draft",
          bookingId: newBooking.id,
          bookingType: data.booking_type,
          location: data.location_id,
          requiredStaff: data.staff_count
        }
      });

      return newBooking;
    } catch (error) {
      await this.eventBus.publish({
        type: "booking.create.failed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "createBooking",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }

  async updateBooking(bookingId: string, data: any, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: "booking.update.started",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateBooking",
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
        type: "booking.updated",
        userId,
        organizationId: updatedBooking.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateBooking",
          bookingId,
          changes: Object.keys(data)
        }
      });

      return updatedBooking;
    } catch (error) {
      await this.eventBus.publish({
        type: "booking.update.failed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateBooking",
          error: error instanceof Error ? error.message : "Unknown error"
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
        throw new Error("Booking not found");
      }

      await this.eventBus.publish({
        type: "booking.status.update.started",
        userId,
        organizationId: currentBooking.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateBookingStatus",
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
      if (status === "approved") {
        updateData.approved_by = userId;
        updateData.approved_at = new Date();
      } else if (status === "rejected") {
        updateData.rejected_by = userId;
        updateData.rejected_at = new Date();
      }

      const [updatedBooking] = await db
        .update(bookings)
        .set(updateData)
        .where(eq(bookings.id, bookingId))
        .returning();

      await this.eventBus.publish({
        type: "booking.status.updated",
        userId,
        organizationId: updatedBooking.client_organization_id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateBookingStatus",
          bookingId,
          fromStatus: currentBooking.status,
          toStatus: status,
          transition: `${currentBooking.status} → ${status}`
        }
      });

      // Cannabis booking lifecycle event
      await this.eventBus.publish({
        type: "cannabis.booking.lifecycle",
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
        type: "booking.status.update.failed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateBookingStatus",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }
}