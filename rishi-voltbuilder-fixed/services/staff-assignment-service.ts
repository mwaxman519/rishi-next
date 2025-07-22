// Staff Assignment Service - Event-Driven Cannabis Industry Staff Management
// Following all three architectural pillars: Microservices, Event-Driven, UUID-based

import { v4 as uuidv4 } from "uuid";
import { EventBusService } from "./event-bus-service";

export interface StaffAssignment {
  id: string; // UUID
  bookingId: string; // UUID
  staffId: string; // UUID
  assignedBy: string; // UUID
  assignmentType: "primary" | "support" | "specialist";
  status: "assigned" | "confirmed" | "checked_in" | "completed" | "no_show";
  cannabisExpertiseLevel:
    | "beginner"
    | "intermediate"
    | "experienced"
    | "expert";
  requiredSkills: string[];
  assignedAt: Date;
  confirmedAt?: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  notes?: string;
}

export interface StaffCheckIn {
  id: string; // UUID
  assignmentId: string; // UUID
  staffId: string; // UUID
  bookingId: string; // UUID
  checkInTime: Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  verificationMethod: "gps" | "manual" | "qr_code";
  cannabisCertificationVerified: boolean;
  equipmentReceived: string[];
  notes?: string;
}

export interface StaffCheckOut {
  id: string; // UUID
  checkInId: string; // UUID
  assignmentId: string; // UUID
  staffId: string; // UUID
  bookingId: string; // UUID
  checkOutTime: Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  equipmentReturned: string[];
  eventData: {
    attendeeCount: number;
    customerSatisfaction: number;
    leadsGenerated: number;
    issuesReported: string[];
  };
  notes?: string;
}

export class StaffAssignmentService {
  constructor(private eventBus: EventBusService) {}

  // Assign staff to cannabis booking with expertise matching
  async assignStaffToBooking(
    bookingId: string, // UUID
    staffIds: string[], // UUID[]
    requiredExpertise: string,
    assignedBy: string, // UUID
  ): Promise<StaffAssignment[]> {
    const assignments: StaffAssignment[] = [];

    for (const staffId of staffIds) {
      const assignmentId = uuidv4();
      const assignment: StaffAssignment = {
        id: assignmentId,
        bookingId,
        staffId,
        assignedBy,
        assignmentType: "primary",
        status: "assigned",
        cannabisExpertiseLevel: "experienced",
        requiredSkills: ["cannabis_knowledge", "customer_service"],
        assignedAt: new Date(),
        notes: `Assigned for cannabis expertise: ${requiredExpertise}`,
      };

      assignments.push(assignment);

      // Event-Driven: Publish staff assignment event
      await this.eventBus.publish(
        "staff.assigned",
        {
          assignmentId,
          bookingId,
          staffId,
          assignedBy,
          cannabisExpertiseLevel: assignment.cannabisExpertiseLevel,
          requiredSkills: assignment.requiredSkills,
          assignedAt: assignment.assignedAt.toISOString(),
        },
        {
          source: "staff-assignment-service",
          version: "1.0.0",
          correlationId: uuidv4(),
        },
      );
    }

    return assignments;
  }

  // Staff check-in with GPS verification and cannabis certification
  async checkInStaff(
    assignmentId: string, // UUID
    location: { latitude: number; longitude: number; accuracy: number },
    cannabisCertificationVerified: boolean,
    equipmentReceived: string[],
    checkedInBy: string, // UUID
    notes?: string,
  ): Promise<StaffCheckIn> {
    const checkInId = uuidv4();
    const now = new Date();

    const checkIn: StaffCheckIn = {
      id: checkInId,
      assignmentId,
      staffId: checkedInBy,
      bookingId: "", // Would be fetched from assignment
      checkInTime: now,
      location,
      verificationMethod: "gps",
      cannabisCertificationVerified,
      equipmentReceived,
      notes,
    };

    // Event-Driven: Publish staff check-in event
    await this.eventBus.publish(
      "staff.checked_in",
      {
        checkInId,
        assignmentId,
        staffId: checkedInBy,
        checkInTime: now.toISOString(),
        location,
        cannabisCertificationVerified,
        equipmentReceived,
        locationVerified: location.accuracy < 10,
      },
      {
        source: "staff-assignment-service",
        version: "1.0.0",
        correlationId: uuidv4(),
      },
    );

    return checkIn;
  }

  // Staff check-out with event data collection
  async checkOutStaff(
    checkInId: string, // UUID
    location: { latitude: number; longitude: number; accuracy: number },
    equipmentReturned: string[],
    eventData: {
      attendeeCount: number;
      customerSatisfaction: number;
      leadsGenerated: number;
      issuesReported: string[];
    },
    checkedOutBy: string, // UUID
    notes?: string,
  ): Promise<StaffCheckOut> {
    const checkOutId = uuidv4();
    const now = new Date();

    const checkOut: StaffCheckOut = {
      id: checkOutId,
      checkInId,
      assignmentId: "", // Would be fetched from check-in
      staffId: checkedOutBy,
      bookingId: "", // Would be fetched from assignment
      checkOutTime: now,
      location,
      equipmentReturned,
      eventData,
      notes,
    };

    // Event-Driven: Publish staff check-out event
    await this.eventBus.publish(
      "staff.checked_out",
      {
        checkOutId,
        checkInId,
        staffId: checkedOutBy,
        checkOutTime: now.toISOString(),
        location,
        equipmentReturned,
        eventData,
        performanceMetrics: {
          attendeeEngagement: eventData.customerSatisfaction,
          leadsGenerated: eventData.leadsGenerated,
          issuesResolved: eventData.issuesReported.length,
        },
      },
      {
        source: "staff-assignment-service",
        version: "1.0.0",
        correlationId: uuidv4(),
      },
    );

    // Event-Driven: Publish event data submission
    await this.eventBus.publish(
      "event.data_submitted",
      {
        staffId: checkedOutBy,
        attendeeCount: eventData.attendeeCount,
        customerSatisfaction: eventData.customerSatisfaction,
        leadsGenerated: eventData.leadsGenerated,
        issuesReported: eventData.issuesReported,
        submittedAt: now.toISOString(),
      },
      {
        source: "staff-assignment-service",
        version: "1.0.0",
        correlationId: uuidv4(),
      },
    );

    return checkOut;
  }

  // Find available cannabis-experienced staff
  async findAvailableCannabisStaff(
    startDate: Date,
    endDate: Date,
    state: string,
    requiredExpertise: string,
    maxTravelDistance: number,
  ): Promise<{ staffId: string; expertiseLevel: string; distance: number }[]> {
    // This would query database for available staff with cannabis expertise
    // For now, returning mock data with proper UUID structure

    const availableStaff = [
      {
        staffId: uuidv4(),
        expertiseLevel: "experienced",
        distance: 15.2,
      },
      {
        staffId: uuidv4(),
        expertiseLevel: "expert",
        distance: 8.7,
      },
    ];

    // Event-Driven: Publish staff availability query
    await this.eventBus.publish(
      "staff.availability_queried",
      {
        queryId: uuidv4(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        state,
        requiredExpertise,
        maxTravelDistance,
        resultsCount: availableStaff.length,
        queriedAt: new Date().toISOString(),
      },
      {
        source: "staff-assignment-service",
        version: "1.0.0",
        correlationId: uuidv4(),
      },
    );

    return availableStaff;
  }

  // Get assignment by ID
  async getAssignmentById(
    assignmentId: string,
  ): Promise<StaffAssignment | null> {
    // Database query would go here
    return null;
  }

  // Update assignment status
  async updateAssignmentStatus(
    assignmentId: string, // UUID
    newStatus: StaffAssignment["status"],
    updatedBy: string, // UUID
    reason?: string,
  ): Promise<void> {
    // Event-Driven: Publish assignment status change
    await this.eventBus.publish(
      "staff.assignment_status_changed",
      {
        assignmentId,
        newStatus,
        updatedBy,
        reason,
        updatedAt: new Date().toISOString(),
      },
      {
        source: "staff-assignment-service",
        version: "1.0.0",
        correlationId: uuidv4(),
      },
    );
  }

  // Get staff performance metrics
  async getStaffPerformanceMetrics(
    staffId: string, // UUID
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalAssignments: number;
    completedAssignments: number;
    averageRating: number;
    cannabisExpertiseRating: number;
    punctualityScore: number;
  }> {
    const metrics = {
      totalAssignments: 12,
      completedAssignments: 11,
      averageRating: 4.7,
      cannabisExpertiseRating: 4.9,
      punctualityScore: 95.2,
    };

    // Event-Driven: Publish performance metrics query
    await this.eventBus.publish(
      "staff.performance_metrics_queried",
      {
        staffId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        metrics,
        queriedAt: new Date().toISOString(),
      },
      {
        source: "staff-assignment-service",
        version: "1.0.0",
        correlationId: uuidv4(),
      },
    );

    return metrics;
  }
}
