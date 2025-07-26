/**
 * Utility function for making API requests with enhanced error handling
 */
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: any,
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  let response;
  try {
    response = await fetch(url, options);

    // Check if response is valid
    if (!response) {
      throw new Error("No response received from server");
    }
  } catch (networkError) {
    console.error(`Network error fetching ${url}:`, networkError);
    throw new Error(
      `Network error: ${networkError.message || "Unable to connect to server"}`,
    );
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    // Try to parse error JSON, but handle the case where json() might not be available
    if (typeof response.json === "function") {
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If parsing JSON fails, try to get text
        try {
          const textError = await response.text();
          if (textError) {
            errorMessage += `: ${textError}`;
          }
        } catch (textError) {
          // If even getting text fails, use the default error message
          console.error("Failed to get error response text:", textError);
        }
      }
    } else {
      console.error("Response does not have json method:", response);
      // Try to get response as text
      try {
        const textError = await response.text();
        if (textError) {
          errorMessage += `: ${textError}`;
        }
      } catch (textError) {
        console.error("Failed to get error response text:", textError);
      }
    }

    throw new Error(errorMessage);
  }

  // For 204 No Content responses, return null
  if (response.status === 204) {
    return response;
  }

  // Check if the response has content before trying to parse JSON
  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return response;
  }

  // Handle the case where json() might not be available
  if (typeof response.json !== "function") {
    console.error("Response does not have json method:", response);

    // Try to get response as text and parse it manually
    try {
      const text = await response.text();
      if (!text) {
        console.warn("Empty response text");
        return response;
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse response text as JSON:", parseError);
        // Return the raw text in a structured format
        return {
          _raw: text,
          _parseError: true,
        };
      }
    } catch (textError) {
      console.error("Failed to get response text:", textError);
      return response;
    }
  }

  // Normal path - response.json() is available
  try {
    return await response.json();
  } catch (error) {
    console.error(`Error parsing JSON response from ${url}:`, error);

    // Try to get the raw text as fallback
    try {
      const text = await response.text();
      console.log("Response text when JSON parsing failed:", text);

      // If the text is empty, return an empty object
      if (!text) {
        return {};
      }

      // Try to manually parse it as JSON
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // If manual parsing also fails, return the raw text in a structured format
        return {
          _raw: text,
          _parseError: true,
        };
      }
    } catch (textError) {
      console.error("Failed to get response text as fallback:", textError);
      // Return the response object for inspection
      return {
        _response: {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries([...response.headers.entries()]),
        },
        _error: true,
      };
    }
  }
}

/**
 * API client with methods for different HTTP verbs
 * Used by React hooks for TanStack Query
 */
export const api = {
  async get(url: string) {
    const data = await apiRequest("GET", url);
    return { data };
  },

  async post(url: string, body?: any) {
    const data = await apiRequest("POST", url, body);
    return { data };
  },

  async put(url: string, body?: any) {
    const data = await apiRequest("PUT", url, body);
    return { data };
  },

  async patch(url: string, body?: any) {
    const data = await apiRequest("PATCH", url, body);
    return { data };
  },

  async delete(url: string) {
    const data = await apiRequest("DELETE", url);
    return { data };
  },
};
