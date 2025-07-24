# API Service Architecture

## Overview

The API Service layer in the mobile application provides a robust interface between the mobile client and the backend services. It handles network requests, response parsing, error handling, authentication, and offline queuing of requests for our field marketing, support, operations, workforce and event management platform.

## Architecture

```
┌───────────────────────────────────────────────────┐
│                  Application Layer                 │
│  (Screens, Components, Business Logic, Contexts)   │
└───────────────────┬───────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────┐
│                   API Service                      │
├───────────────────┬───────────────────────────────┤
│  Request Builder  │       Response Handler         │
├───────────────────┼───────────────────────────────┤
│  Auth Manager     │       Error Handler            │
├───────────────────┼───────────────────────────────┤
│  Offline Queue    │       Retry Manager            │
├───────────────────┼───────────────────────────────┤
│  Request Cache    │       Rate Limiter             │
└───────────────────┴───────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────┐
│               Network Layer                        │
│       (Fetch API / Network Information)            │
└───────────────────────────────────────────────────┘
```

## Core Components

### 1. Request Builder

Constructs API requests with proper headers, parameters, and body content:

```typescript
export const DEFAULT_OPTIONS: RequestInit = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: TIMEOUTS.apiRequest,
};

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const baseUrl = API_URL;
  const url = `${baseUrl}${endpoint}`;

  // Merge default options with custom options
  const requestOptions: RequestInit = {
    ...DEFAULT_OPTIONS,
    ...options,
    headers: {
      ...DEFAULT_OPTIONS.headers,
      ...options.headers,
    },
  };

  // Add authentication token if available
  const token = await getAuthToken();
  if (token) {
    requestOptions.headers = {
      ...requestOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // Handle network connectivity
  if (!(await checkNetworkConnectivity())) {
    if (options.method !== "GET") {
      // Queue non-GET requests for later sync
      await queueRequest(endpoint, requestOptions);
      throw new NetworkError("Request queued for offline sync");
    } else {
      throw new NetworkError("No network connection available");
    }
  }

  try {
    const response = await fetch(url, requestOptions);
    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error, endpoint, requestOptions);
  }
};
```

### 2. Response Handler

Processes API responses, parses data, and handles different response types:

```typescript
const handleResponse = async <T>(response: Response): Promise<T> => {
  // Handle no-content responses
  if (response.status === 204) {
    return {} as T;
  }

  // Parse JSON response
  let data: any;
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError(response.status, "Invalid JSON response", {
      url: response.url,
    });
  }

  // Handle error responses
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || response.statusText,
      data,
    );
  }

  return data as T;
};
```

### 3. Authentication Manager

Handles authentication tokens, refreshing, and session management:

```typescript
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const tokenData = await AsyncStorage.getItem(
      STORAGE_CONFIG.asyncStorage.authKeyPrefix + "token",
    );
    if (!tokenData) return null;

    const { token, expiresAt } = JSON.parse(tokenData);

    // Check if token is expired
    if (new Date(expiresAt).getTime() <= Date.now()) {
      // Token expired, try to refresh
      return refreshAuthToken();
    }

    return token;
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem(
      STORAGE_CONFIG.asyncStorage.authKeyPrefix + "refreshToken",
    );
    if (!refreshToken) return null;

    // Call refresh token API
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Clear tokens if refresh failed
      await clearAuthTokens();
      return null;
    }

    const data = await response.json();

    // Store new tokens
    await setAuthToken(data.token, data.expiresAt, data.refreshToken);

    return data.token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    await clearAuthTokens();
    return null;
  }
};
```

### 4. Error Handler

Custom error classes and error handling logic:

```typescript
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data: any = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(401, message);
    this.name = "AuthenticationError";
  }
}

const handleError = async <T>(
  error: any,
  endpoint: string,
  requestOptions: RequestInit,
): Promise<T> => {
  // Handle different error types
  if (error instanceof ApiError) {
    // Handle authentication errors
    if (error.status === 401) {
      await clearAuthTokens();
      // Notify auth context about logout requirement
      Events.emit("auth:logout", { reason: "token_expired" });
    }

    // Handle rate limiting
    if (error.status === 429) {
      // Implement retry with backoff
      return retryWithBackoff(() =>
        apiRequest(endpoint, requestOptions),
      ) as Promise<T>;
    }

    throw error;
  }

  // Network or other errors
  if (error instanceof NetworkError) {
    // For GET requests, try to return cached data
    if (requestOptions.method === "GET" || !requestOptions.method) {
      const cachedData = await getCachedResponse(endpoint);
      if (cachedData) {
        return cachedData as T;
      }
    }

    throw error;
  }

  // Unknown errors
  console.error("API request error:", error);
  throw new ApiError(0, error.message || "Unknown error occurred", {
    originalError: error.toString(),
  });
};
```

### 5. Offline Queue

Manages requests made when offline for later synchronization:

```typescript
export interface QueuedRequest {
  id: string;
  endpoint: string;
  options: RequestInit;
  timestamp: number;
  attempts: number;
  priority: number;
}

export const queueRequest = async (
  endpoint: string,
  options: RequestInit,
  priority: number = 1,
): Promise<void> => {
  try {
    const queueKey = STORAGE_CONFIG.asyncStorage.syncKeyPrefix + "requestQueue";
    const queueJson = await AsyncStorage.getItem(queueKey);
    const queue: QueuedRequest[] = queueJson ? JSON.parse(queueJson) : [];

    // Convert body to string if it's an object
    if (options.body && typeof options.body === "object") {
      options.body = JSON.stringify(options.body);
    }

    // Create a unique identifier for the request
    const requestId = generateUUID();

    // Add request to queue
    queue.push({
      id: requestId,
      endpoint,
      options,
      timestamp: Date.now(),
      attempts: 0,
      priority,
    });

    // Sort queue by priority (higher first) and then by timestamp (older first)
    queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });

    // Save updated queue
    await AsyncStorage.setItem(queueKey, JSON.stringify(queue));

    // Emit event for sync service to pick up
    Events.emit("sync:request-queued");
  } catch (error) {
    console.error("Error queueing request:", error);
    // If we can't queue, we'll have to discard the request
    throw new Error("Failed to queue request for offline sync");
  }
};

export const processRequestQueue = async (): Promise<{
  successful: number;
  failed: number;
  remaining: number;
}> => {
  if (!(await checkNetworkConnectivity())) {
    return { successful: 0, failed: 0, remaining: 0 };
  }

  try {
    const queueKey = STORAGE_CONFIG.asyncStorage.syncKeyPrefix + "requestQueue";
    const queueJson = await AsyncStorage.getItem(queueKey);

    if (!queueJson) {
      return { successful: 0, failed: 0, remaining: 0 };
    }

    let queue: QueuedRequest[] = JSON.parse(queueJson);
    const originalLength = queue.length;

    if (originalLength === 0) {
      return { successful: 0, failed: 0, remaining: 0 };
    }

    let successful = 0;
    let failed = 0;

    // Process requests in batches to avoid overwhelming the network
    const batchSize = 5;
    const requestsToProcess = queue.slice(0, batchSize);

    // Create an array of promises for concurrent processing
    const results = await Promise.allSettled(
      requestsToProcess.map(async (request) => {
        try {
          // Parse the body back to an object if it's a JSON string
          const options = { ...request.options };

          // Make the request
          await fetch(`${API_URL}${request.endpoint}`, options);
          return { success: true, request };
        } catch (error) {
          // Increment attempt count
          request.attempts += 1;

          // If max attempts reached, mark as failed permanently
          if (request.attempts >= SYNC_CONFIG.retry.maxAttempts) {
            return { success: false, request, permanent: true };
          }

          return { success: false, request, permanent: false };
        }
      }),
    );

    // Process results and update queue
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { success, request, permanent } = result.value;

        if (success) {
          // Remove successful request from queue
          queue = queue.filter((r) => r.id !== request.id);
          successful++;
        } else if (permanent) {
          // Remove permanently failed request from queue
          queue = queue.filter((r) => r.id !== request.id);
          failed++;

          // Log failed request for debugging
          console.error(
            "Request permanently failed after max attempts:",
            request,
          );
        }
        // Temporarily failed requests remain in the queue with incremented attempt count
      }
    });

    // Save updated queue
    await AsyncStorage.setItem(queueKey, JSON.stringify(queue));

    return {
      successful,
      failed,
      remaining: queue.length,
    };
  } catch (error) {
    console.error("Error processing request queue:", error);
    return { successful: 0, failed: 0, remaining: 0 };
  }
};
```

### 6. Response Caching

Caches GET requests for offline availability:

```typescript
export const cacheResponse = async (
  endpoint: string,
  data: any,
  ttl: number = TIMEOUTS.cacheExpiry,
): Promise<void> => {
  try {
    const cacheKey = generateCacheKey(endpoint);
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error caching response:", error);
  }
};

export const getCachedResponse = async (
  endpoint: string,
): Promise<any | null> => {
  try {
    const cacheKey = generateCacheKey(endpoint);
    const cacheJson = await AsyncStorage.getItem(cacheKey);

    if (!cacheJson) return null;

    const cache = JSON.parse(cacheJson);

    // Check if cache is expired
    if (cache.expiry < Date.now()) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return cache.data;
  } catch (error) {
    console.error("Error retrieving cached response:", error);
    return null;
  }
};

const generateCacheKey = (endpoint: string): string => {
  // Normalize endpoint by removing query string parameters
  const normalizedEndpoint = endpoint.split("?")[0];
  return `${STORAGE_CONFIG.asyncStorage.temporaryPrefix}cache_${normalizedEndpoint.replace(/\//g, "_")}`;
};
```

### 7. Retry Manager

Handles retries with exponential backoff:

```typescript
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = SYNC_CONFIG.retry.maxAttempts,
  initialDelay: number = SYNC_CONFIG.retry.initialDelay,
): Promise<T> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempts++;

      if (attempts >= maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay =
        initialDelay * Math.pow(2, attempts - 1) * (0.5 + Math.random() * 0.5);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Maximum retry attempts reached");
};
```

### 8. Network Connectivity Manager

Monitors network state and provides network-related utilities:

```typescript
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const networkState = await NetInfo.fetch();
    return networkState.isConnected === true;
  } catch (error) {
    console.error("Error checking network connectivity:", error);
    return false;
  }
};

export const waitForConnectivity = async (
  timeout: number = 30000,
): Promise<boolean> => {
  // Check if already connected
  if (await checkNetworkConnectivity()) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeout);

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(true);
      }
    });
  });
};
```

## CRUD Operation Helpers

Convenience methods for common operations:

```typescript
export const get = <T = any>(
  endpoint: string,
  params: Record<string, any> = {},
  options: RequestInit = {},
): Promise<T> => {
  const url = buildUrl(endpoint, params);
  return apiRequest<T>(url, { ...options, method: "GET" });
};

export const post = <T = any>(
  endpoint: string,
  data: any = {},
  options: RequestInit = {},
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const put = <T = any>(
  endpoint: string,
  data: any = {},
  options: RequestInit = {},
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const patch = <T = any>(
  endpoint: string,
  data: any = {},
  options: RequestInit = {},
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const del = <T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
};
```

## File Upload

Specialized utilities for handling file uploads:

```typescript
export const uploadFile = async <T = any>(
  endpoint: string,
  fileUri: string,
  fieldName: string = "file",
  mimeType: string = "application/octet-stream",
  extraFields: Record<string, any> = {},
  options: RequestInit = {},
): Promise<T> => {
  // Create form data
  const formData = new FormData();

  // Add file
  formData.append(fieldName, {
    uri: fileUri,
    name: fileUri.split("/").pop() || "file",
    type: mimeType,
  } as any);

  // Add extra fields
  Object.entries(extraFields).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  // Set up request options
  const requestOptions: RequestInit = {
    ...options,
    method: "POST",
    headers: {
      ...options.headers,
      "Content-Type": "multipart/form-data",
    },
    body: formData as any,
  };

  return apiRequest<T>(endpoint, requestOptions);
};

export const uploadImage = async <T = any>(
  endpoint: string,
  imageUri: string,
  fieldName: string = "image",
  options: {
    compress?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    extraFields?: Record<string, any>;
    requestOptions?: RequestInit;
  } = {},
): Promise<T> => {
  const {
    compress = true,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    extraFields = {},
    requestOptions = {},
  } = options;

  let finalImageUri = imageUri;

  // Compress image if requested
  if (compress) {
    try {
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: maxWidth, height: maxHeight } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
      );

      finalImageUri = processedImage.uri;
    } catch (error) {
      console.error("Error compressing image:", error);
      // Continue with original image if compression fails
    }
  }

  // Detect mime type from uri
  const mimeType = finalImageUri.endsWith(".png")
    ? "image/png"
    : finalImageUri.endsWith(".gif")
      ? "image/gif"
      : "image/jpeg";

  return uploadFile<T>(
    endpoint,
    finalImageUri,
    fieldName,
    mimeType,
    extraFields,
    requestOptions,
  );
};
```

## API Health Check

Utility to verify API availability:

```typescript
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      headers: DEFAULT_OPTIONS.headers,
      timeout: 5000, // Short timeout for health check
    });

    return response.ok;
  } catch (error) {
    console.log("API health check failed:", error);
    return false;
  }
};
```

## Integration with Sync Engine

The API Service integrates with the Sync Engine to coordinate offline operations:

```typescript
// Listen for sync events
Events.on("sync:started", () => {
  // Process queued requests when sync starts
  processRequestQueue()
    .then((result) => {
      console.log("Processed request queue:", result);

      if (result.remaining > 0) {
        // Notify that there are still pending requests
        Events.emit("sync:pending-requests", { count: result.remaining });
      }
    })
    .catch((error) => {
      console.error("Error processing request queue during sync:", error);
    });
});

// Check for queued requests on app start
export const checkQueuedRequests = async (): Promise<number> => {
  try {
    const queueKey = STORAGE_CONFIG.asyncStorage.syncKeyPrefix + "requestQueue";
    const queueJson = await AsyncStorage.getItem(queueKey);

    if (!queueJson) return 0;

    const queue: QueuedRequest[] = JSON.parse(queueJson);
    return queue.length;
  } catch (error) {
    console.error("Error checking queued requests:", error);
    return 0;
  }
};
```

## Error Handling Strategy

The API service implements a comprehensive error handling strategy:

1. **Network Errors**:

   - Detected when the device is offline
   - Non-GET requests are queued for later processing
   - GET requests attempt to return cached responses

2. **API Errors**:

   - HTTP status codes are translated to meaningful errors
   - Authentication errors (401) trigger logout flow
   - Rate limiting (429) triggers retry with backoff
   - Server errors (500s) are logged and may be retried

3. **Timeout Handling**:

   - Requests have configurable timeouts
   - Slow connections trigger retries or fallbacks to cached data

4. **Recovery Mechanisms**:
   - Request queue processing on network restoration
   - Token refresh on expiration
   - Cache invalidation when stale

## Performance Optimizations

1. **Request Batching**:

   - Group related requests to reduce network overhead
   - Process offline queue in batches

2. **Selective Caching**:

   - Cache responses for frequently accessed, slowly changing data
   - Use TTL (Time-To-Live) to control cache freshness

3. **Compression**:

   - Compress request/response payloads
   - Resize images before upload

4. **Connection Optimization**:
   - Keep-alive connections when possible
   - Prioritize critical requests

## Security Considerations

1. **Token Management**:

   - Secure storage of authentication tokens
   - Automatic token refresh
   - Token revocation on logout

2. **Data Protection**:

   - Sensitive data encryption in transit and at rest
   - Secure offline request queue
   - Protection against request replay attacks

3. **Input Validation**:
   - Request validation before sending
   - Response validation before processing

## Usage Examples

### Basic Request

```typescript
// Get user profile
const getUserProfile = async (userId: number) => {
  try {
    const profile = await get<UserProfile>(`/users/${userId}`);
    return profile;
  } catch (error) {
    if (error instanceof NetworkError) {
      // Handle offline scenario
      return getCachedUserProfile(userId);
    }
    throw error;
  }
};
```

### Form Submission

```typescript
// Create availability block
const createAvailability = async (data: AvailabilityBlock) => {
  try {
    return await post<AvailabilityBlock>("/api/availability", data);
  } catch (error) {
    if (error instanceof NetworkError) {
      // Show offline notification but continue optimistically
      showOfflineNotification(
        "Your availability will be saved when you reconnect",
      );
      return {
        ...data,
        id: `temp-${Date.now()}`,
        _syncPending: true,
      };
    }
    throw error;
  }
};
```

### File Upload

```typescript
// Upload profile image
const uploadProfileImage = async (imageUri: string, userId: number) => {
  try {
    return await uploadImage<{ imageUrl: string }>(
      `/users/${userId}/profile-image`,
      imageUri,
      "profileImage",
      {
        compress: true,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        extraFields: {
          userId: userId.toString(),
        },
      },
    );
  } catch (error) {
    // Handle upload errors
    console.error("Profile image upload failed:", error);
    throw new Error("Failed to upload profile image. Please try again later.");
  }
};
```

## Testing Strategy

1. **Unit Tests**:

   - Mock fetch and AsyncStorage for isolated testing
   - Test each API service function individually
   - Verify error handling paths

2. **Integration Tests**:

   - Test API service with mock server
   - Verify request/response cycles
   - Test authentication flows

3. **Offline Simulation**:

   - Test request queuing and processing
   - Verify cache retrieval during offline state
   - Test recovery when connection is restored

4. **Performance Testing**:
   - Measure request completion times
   - Test concurrent request handling
   - Verify memory usage during large transfers
