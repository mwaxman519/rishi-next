/**
 * Location Event Publisher Service
 *
 * Handles publishing events related to location actions such as:
 * - Location creation
 * - Location updates
 * - Location approval/rejection
 * - Location deletion
 */

import { v4 as uuidv4 } from "uuid";
import { publishEvent } from "../infrastructure/messaging/distributedEventBus";
import {
  AppEvent,
  LocationCreatedPayload,
  LocationUpdatedPayload,
  LocationApprovalPayload,
  LocationRejectionPayload,
  LocationDeletedPayload,
} from "../infrastructure/messaging/eventTypes";

/**
 * Create payload for location creation event
 */
export interface CreateLocationEventInput {
  locationId: string;
  name: string;
  address: string;
  submittedById?: string;
  submittedByName?: string;
  submittedByOrganization?: string;
}

/**
 * Create payload for location update event
 */
export interface UpdateLocationEventInput {
  locationId: string;
  updatedById?: string;
  updatedByName?: string;
  changes?: Record<string, any>;
}

/**
 * Create payload for location approval event
 */
export interface ApproveLocationEventInput {
  locationId: string;
  name?: string;
  approvedById: string;
  approvedByName: string;
  approvedAt: string;
  submittedById?: string;
}

/**
 * Create payload for location rejection event
 */
export interface RejectLocationEventInput {
  locationId: string;
  name?: string;
  rejectedById: string;
  rejectedByName: string;
  rejectedAt: string;
  rejectionReason?: string;
  submittedById?: string;
}

/**
 * Create payload for location deletion event
 */
export interface DeleteLocationEventInput {
  locationId: string;
  name?: string;
  deletedById: string;
  deletedByName?: string;
}

/**
 * Publish a location created event
 */
export async function publishLocationCreatedEvent(
  data: CreateLocationEventInput,
) {
  console.log(
    `[LocationEventPublisher] Publishing location created event for location: ${data.locationId}`,
  );

  const payload: LocationCreatedPayload = {
    locationId: data.locationId,
    name: data.name,
    address: data.address,
    submittedById: data.submittedById,
    submittedByName: data.submittedByName,
    submittedByOrganization: data.submittedByOrganization,
  };

  try {
    const result = await publishEvent(AppEvent.LOCATION_CREATED, payload, {
      correlationId: uuidv4(),
      eventSource: "location-service",
    });

    if (!result.success) {
      console.error(
        `[LocationEventPublisher] Failed to publish location created event:`,
        result.errors,
      );
    }

    return result;
  } catch (error) {
    console.error(
      `[LocationEventPublisher] Error publishing location created event:`,
      error,
    );
    throw error;
  }
}

/**
 * Publish a location updated event
 */
export async function publishLocationUpdatedEvent(
  data: UpdateLocationEventInput,
) {
  console.log(
    `[LocationEventPublisher] Publishing location updated event for location: ${data.locationId}`,
  );

  const payload: LocationUpdatedPayload = {
    locationId: data.locationId,
    updatedById: data.updatedById,
    updatedByName: data.updatedByName,
    changes: data.changes,
  };

  try {
    const result = await publishEvent(AppEvent.LOCATION_UPDATED, payload, {
      correlationId: uuidv4(),
      eventSource: "location-service",
    });

    if (!result.success) {
      console.error(
        `[LocationEventPublisher] Failed to publish location updated event:`,
        result.errors,
      );
    }

    return result;
  } catch (error) {
    console.error(
      `[LocationEventPublisher] Error publishing location updated event:`,
      error,
    );
    throw error;
  }
}

/**
 * Publish a location approved event
 */
export async function publishLocationApprovedEvent(
  data: ApproveLocationEventInput,
) {
  console.log(
    `[LocationEventPublisher] Publishing location approved event for location: ${data.locationId}`,
  );

  const payload: LocationApprovalPayload = {
    locationId: data.locationId,
    name: data.name,
    approvedById: data.approvedById,
    approvedByName: data.approvedByName,
    approvedAt: data.approvedAt,
    submittedById: data.submittedById,
  };

  try {
    const result = await publishEvent(AppEvent.LOCATION_APPROVED, payload, {
      correlationId: uuidv4(),
      eventSource: "location-service",
      priority: "high", // High priority for approval events to trigger notifications
    });

    if (!result.success) {
      console.error(
        `[LocationEventPublisher] Failed to publish location approved event:`,
        result.errors,
      );
    }

    return result;
  } catch (error) {
    console.error(
      `[LocationEventPublisher] Error publishing location approved event:`,
      error,
    );
    throw error;
  }
}

/**
 * Publish a location rejected event
 */
export async function publishLocationRejectedEvent(
  data: RejectLocationEventInput,
) {
  console.log(
    `[LocationEventPublisher] Publishing location rejected event for location: ${data.locationId}`,
  );

  const payload: LocationRejectionPayload = {
    locationId: data.locationId,
    name: data.name,
    rejectedById: data.rejectedById,
    rejectedByName: data.rejectedByName,
    rejectedAt: data.rejectedAt,
    rejectionReason: data.rejectionReason,
    submittedById: data.submittedById,
  };

  try {
    const result = await publishEvent(AppEvent.LOCATION_REJECTED, payload, {
      correlationId: uuidv4(),
      eventSource: "location-service",
      priority: "high", // High priority for rejection events to trigger notifications
    });

    if (!result.success) {
      console.error(
        `[LocationEventPublisher] Failed to publish location rejected event:`,
        result.errors,
      );
    }

    return result;
  } catch (error) {
    console.error(
      `[LocationEventPublisher] Error publishing location rejected event:`,
      error,
    );
    throw error;
  }
}

/**
 * Publish a location deleted event
 */
export async function publishLocationDeletedEvent(
  data: DeleteLocationEventInput,
) {
  console.log(
    `[LocationEventPublisher] Publishing location deleted event for location: ${data.locationId}`,
  );

  const payload: LocationDeletedPayload = {
    locationId: data.locationId,
    name: data.name,
    deletedById: data.deletedById,
    deletedByName: data.deletedByName,
  };

  try {
    const result = await publishEvent(AppEvent.LOCATION_DELETED, payload, {
      correlationId: uuidv4(),
      eventSource: "location-service",
    });

    if (!result.success) {
      console.error(
        `[LocationEventPublisher] Failed to publish location deleted event:`,
        result.errors,
      );
    }

    return result;
  } catch (error) {
    console.error(
      `[LocationEventPublisher] Error publishing location deleted event:`,
      error,
    );
    throw error;
  }
}
