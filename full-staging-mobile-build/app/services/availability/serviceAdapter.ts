import { ServiceAdapter, ApiClient } from "../infrastructure/serviceAdapter";
import {
  AvailabilityDTO,
  AvailabilityResponse,
  AvailabilitiesResponse,
  CreateAvailabilityRequest,
  UpdateAvailabilityRequest,
  AvailabilityQueryOptions,
  ConflictCheckResponse,
  ServiceResponse,
} from "./models";

// Instead of importing the service directly which causes client-side importing issues,
// we'll define the interface and use dynamic imports for server-only code

/**
 * Interface for the Availability Service
 * This abstracts the capabilities of the service, regardless of whether
 * it's a local service or a remote microservice.
 */
export interface IAvailabilityService {
  getAvailabilityBlocks(
    options: AvailabilityQueryOptions,
  ): Promise<AvailabilitiesResponse>;
  getAvailabilityBlockById(id: number): Promise<AvailabilityResponse>;
  createAvailabilityBlock(
    data: CreateAvailabilityRequest,
  ): Promise<AvailabilityResponse>;
  updateAvailabilityBlock(
    id: number,
    data: UpdateAvailabilityRequest,
  ): Promise<AvailabilityResponse>;
  deleteAvailabilityBlock(
    id: number,
    deleteSeries?: boolean,
  ): Promise<ServiceResponse<{ success: boolean; count?: number }>>;
  checkForConflicts(
    userId: number,
    startDate: Date | string,
    endDate: Date | string,
    excludeBlockId?: number,
  ): Promise<ConflictCheckResponse>;
}

/**
 * Local adapter for the Availability Service
 * Uses the local availability service implementation with proper server-side imports
 */
export class LocalAvailabilityServiceAdapter
  implements ServiceAdapter<IAvailabilityService>
{
  // This method should only be called on the server side
  async getServiceAsync(): Promise<IAvailabilityService> {
    // Dynamically import the service only when needed on the server
    const { availabilityService } = await import("./availabilityService");
    return availabilityService;
  }

  // Not safe for client-side use - will throw an error if used on client
  getService(): IAvailabilityService {
    throw new Error(
      "Direct service access is only available server-side. Use API routes instead.",
    );
  }
}

/**
 * Remote adapter for the Availability Service
 * Uses HTTP requests to interact with a remote Availability microservice
 */
export class RemoteAvailabilityServiceAdapter
  implements ServiceAdapter<IAvailabilityService>
{
  constructor(
    private baseUrl: string,
    private apiClient: ApiClient,
  ) {}

  getService(): IAvailabilityService {
    // Create an instance with local references to avoid 'this' binding issues
    const baseUrl = this.baseUrl;
    const apiClient = this.apiClient;

    // Return an implementation of the IAvailabilityService interface
    return {
      async getAvailabilityBlocks(
        options: AvailabilityQueryOptions,
      ): Promise<AvailabilitiesResponse> {
        try {
          // Build query string from options
          const queryParams = new URLSearchParams();
          queryParams.append("userId", options.userId.toString());

          if (options.startDate) {
            // Safely handle Date or string type
            const startDate =
              typeof options.startDate === "string"
                ? options.startDate
                : options.startDate.toISOString();
            queryParams.append("startDate", startDate);
          }

          if (options.endDate) {
            // Safely handle Date or string type
            const endDate =
              typeof options.endDate === "string"
                ? options.endDate
                : options.endDate.toISOString();
            queryParams.append("endDate", endDate);
          }

          if (options.status) {
            queryParams.append("status", options.status);
          }

          const url = `${baseUrl}/availability?${queryParams.toString()}`;
          const response = await apiClient.get<AvailabilitiesResponse>(url);

          return response;
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch availability blocks",
          };
        }
      },

      async getAvailabilityBlockById(
        id: number,
      ): Promise<AvailabilityResponse> {
        try {
          const url = `${baseUrl}/availability/${id}`;
          const response = await apiClient.get<AvailabilityResponse>(url);

          return response;
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch availability block",
          };
        }
      },

      async createAvailabilityBlock(
        data: CreateAvailabilityRequest,
      ): Promise<AvailabilityResponse> {
        try {
          const url = `${baseUrl}/availability`;
          const response = await apiClient.post<AvailabilityResponse>(
            url,
            data,
          );

          return response;
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create availability block",
          };
        }
      },

      async updateAvailabilityBlock(
        id: number,
        data: UpdateAvailabilityRequest,
      ): Promise<AvailabilityResponse> {
        try {
          const url = `${baseUrl}/availability/${id}`;
          const response = await apiClient.put<AvailabilityResponse>(url, data);

          return response;
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to update availability block",
          };
        }
      },

      async deleteAvailabilityBlock(
        id: number,
        deleteSeries: boolean = false,
      ): Promise<ServiceResponse<{ success: boolean; count?: number }>> {
        try {
          const url = deleteSeries
            ? `${baseUrl}/availability/${id}?deleteSeries=true`
            : `${baseUrl}/availability/${id}`;

          const response =
            await apiClient.delete<
              ServiceResponse<{ success: boolean; count?: number }>
            >(url);

          return response;
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete availability block",
          };
        }
      },

      async checkForConflicts(
        userId: number,
        startDate: Date | string,
        endDate: Date | string,
        excludeBlockId?: number,
      ): Promise<ConflictCheckResponse> {
        try {
          const queryParams = new URLSearchParams();
          queryParams.append("userId", userId.toString());

          // Safely handle Date or string type
          const formattedStartDate =
            typeof startDate === "string" ? startDate : startDate.toISOString();
          queryParams.append("startDate", formattedStartDate);

          // Safely handle Date or string type
          const formattedEndDate =
            typeof endDate === "string" ? endDate : endDate.toISOString();
          queryParams.append("endDate", formattedEndDate);

          if (excludeBlockId !== undefined) {
            queryParams.append("excludeBlockId", excludeBlockId.toString());
          }

          const url = `${baseUrl}/availability/conflicts?${queryParams.toString()}`;
          const response = await apiClient.get<ConflictCheckResponse>(url);

          return response;
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to check for conflicts",
          };
        }
      },
    };
  }
}
