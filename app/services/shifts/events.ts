/**
 * Shift Management Events
 * Event publishers and handlers for shift-related operations
 */

import { EventBus } from "../core/EventBus";
import { ShiftDTO, AssignmentStatus } from "./models";

export interface ShiftEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId: string;
  organizationId: string;
}

export interface ShiftCreatedEvent extends ShiftEvent {
  type: "shift.created";
  payload: {
    shift: ShiftDTO;
    createdBy: string;
  };
}

export interface ShiftUpdatedEvent extends ShiftEvent {
  type: "shift.updated";
  payload: {
    shift: ShiftDTO;
    updatedBy: string;
    changes: any;
  };
}

export interface ShiftDeletedEvent extends ShiftEvent {
  type: "shift.deleted";
  payload: {
    shiftId: string;
    deletedBy: string;
  };
}

export interface ShiftAssignedEvent extends ShiftEvent {
  type: "shift.assigned";
  payload: {
    shift: ShiftDTO;
    agentId: string;
    assignedBy: string;
    assignmentStatus: AssignmentStatus;
  };
}

export interface ShiftUnassignedEvent extends ShiftEvent {
  type: "shift.unassigned";
  payload: {
    shift: ShiftDTO;
    agentId: string;
    unassignedBy: string;
  };
}

export interface ShiftStartedEvent extends ShiftEvent {
  type: "shift.started";
  payload: {
    shift: ShiftDTO;
    startedBy: string;
    startTime: Date;
  };
}

export interface ShiftCompletedEvent extends ShiftEvent {
  type: "shift.completed";
  payload: {
    shift: ShiftDTO;
    completedBy: string;
    totalHours: number;
  };
}

export interface ShiftCancelledEvent extends ShiftEvent {
  type: "shift.cancelled";
  payload: {
    shift: ShiftDTO;
    cancelledBy: string;
    reason: string;
  };
}

export class ShiftEventPublisher {
  private eventBus: EventBus;

  constructor() {
    this.eventBus = new EventBus();
  }

  async publishShiftCreated(
    shift: ShiftDTO,
    createdBy: string,
    organizationId: string,
  ): Promise<void> {
    const event: ShiftCreatedEvent = {
      type: "shift.created",
      payload: {
        shift,
        createdBy,
      },
      timestamp: new Date(),
      userId: createdBy,
      organizationId,
    };

    await this.eventBus.publish(event);
  }

  async publishShiftUpdated(
    shift: ShiftDTO,
    updatedBy: string,
    changes: any,
    organizationId: string,
  ): Promise<void> {
    const event: ShiftUpdatedEvent = {
      type: "shift.updated",
      payload: {
        shift,
        updatedBy,
        changes,
      },
      timestamp: new Date(),
      userId: updatedBy,
      organizationId,
    };

    await this.eventBus.publish(event);
  }

  async publishShiftDeleted(
    shiftId: string,
    deletedBy: string,
    organizationId: string,
  ): Promise<void> {
    const event: ShiftDeletedEvent = {
      type: "shift.deleted",
      payload: {
        shiftId,
        deletedBy,
      },
      timestamp: new Date(),
      userId: deletedBy,
      organizationId,
    };

    await this.eventBus.publish(event);
  }

  async publishShiftAssigned(
    shift: ShiftDTO,
    agentId: string,
    assignedBy: string,
    assignmentStatus: AssignmentStatus,
    organizationId: string,
  ): Promise<void> {
    const event: ShiftAssignedEvent = {
      type: "shift.assigned",
      payload: {
        shift,
        agentId,
        assignedBy,
        assignmentStatus,
      },
      timestamp: new Date(),
      userId: assignedBy,
      organizationId,
    };

    await this.eventBus.publish(event);
  }

  async publishShiftUnassigned(
    shift: ShiftDTO,
    agentId: string,
    unassignedBy: string,
    organizationId: string,
  ): Promise<void> {
    const event: ShiftUnassignedEvent = {
      type: "shift.unassigned",
      payload: {
        shift,
        agentId,
        unassignedBy,
      },
      timestamp: new Date(),
      userId: unassignedBy,
      organizationId,
    };

    await this.eventBus.publish(event);
  }

  async publishShiftStarted(
    shift: ShiftDTO,
    startedBy: string,
    startTime: Date,
    organizationId: string,
  ): Promise<void> {
    const event: ShiftStartedEvent = {
      type: "shift.started",
      payload: {
        shift,
        startedBy,
        startTime,
      },
      timestamp: new Date(),
      userId: startedBy,
      organizationId,
    };

    await this.eventBus.publish(event);
  }

  async publishShiftCompleted(
    shift: ShiftDTO,
    completedBy: string,
    totalHours: number,
    organizationId: string,
  ): Promise<void> {
    const event: ShiftCompletedEvent = {
      type: "shift.completed",
      payload: {
        shift,
        completedBy,
        totalHours,
      },
      timestamp: new Date(),
      userId: completedBy,
      organizationId,
    };

    await this.eventBus.publish(event);
  }

  async publishShiftCancelled(
    shift: ShiftDTO,
    cancelledBy: string,
    reason: string,
    organizationId: string,
  ): Promise<void> {
    const event: ShiftCancelledEvent = {
      type: "shift.cancelled",
      payload: {
        shift,
        cancelledBy,
        reason,
      },
      timestamp: new Date(),
      userId: cancelledBy,
      organizationId,
    };

    await this.eventBus.publish(event);
  }
}

// Global instance
export const shiftEventPublisher = new ShiftEventPublisher();
