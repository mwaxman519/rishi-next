/**
 * Shift Management Events
 * Event publishers and handlers for shift-related operations
 */

import { EventBus } from &quot;../core/EventBus&quot;;
import { ShiftDTO, AssignmentStatus } from &quot;./models&quot;;

export interface ShiftEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId: string;
  organizationId: string;
}

export interface ShiftCreatedEvent extends ShiftEvent {
  type: &quot;shift.created&quot;;
  payload: {
    shift: ShiftDTO;
    createdBy: string;
  };
}

export interface ShiftUpdatedEvent extends ShiftEvent {
  type: &quot;shift.updated&quot;;
  payload: {
    shift: ShiftDTO;
    updatedBy: string;
    changes: any;
  };
}

export interface ShiftDeletedEvent extends ShiftEvent {
  type: &quot;shift.deleted&quot;;
  payload: {
    shiftId: string;
    deletedBy: string;
  };
}

export interface ShiftAssignedEvent extends ShiftEvent {
  type: &quot;shift.assigned&quot;;
  payload: {
    shift: ShiftDTO;
    agentId: string;
    assignedBy: string;
    assignmentStatus: AssignmentStatus;
  };
}

export interface ShiftUnassignedEvent extends ShiftEvent {
  type: &quot;shift.unassigned&quot;;
  payload: {
    shift: ShiftDTO;
    agentId: string;
    unassignedBy: string;
  };
}

export interface ShiftStartedEvent extends ShiftEvent {
  type: &quot;shift.started&quot;;
  payload: {
    shift: ShiftDTO;
    startedBy: string;
    startTime: Date;
  };
}

export interface ShiftCompletedEvent extends ShiftEvent {
  type: &quot;shift.completed&quot;;
  payload: {
    shift: ShiftDTO;
    completedBy: string;
    totalHours: number;
  };
}

export interface ShiftCancelledEvent extends ShiftEvent {
  type: &quot;shift.cancelled&quot;;
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
      type: &quot;shift.created&quot;,
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
      type: &quot;shift.updated&quot;,
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
      type: &quot;shift.deleted&quot;,
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
      type: &quot;shift.assigned&quot;,
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
      type: &quot;shift.unassigned&quot;,
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
      type: &quot;shift.started&quot;,
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
      type: &quot;shift.completed&quot;,
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
      type: &quot;shift.cancelled&quot;,
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
