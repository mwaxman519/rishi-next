/**
 * Utility function for making API requests with enhanced error handling
 */
export async function apiRequest(
  method: &quot;GET&quot; | &quot;POST&quot; | &quot;PUT&quot; | &quot;PATCH&quot; | &quot;DELETE&quot;,
  url: string,
  data?: any,
) {
  const headers: HeadersInit = {
    &quot;Content-Type&quot;: &quot;application/json&quot;,
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: &quot;include&quot;,
  };

  if (data && method !== &quot;GET&quot;) {
    options.body = JSON.stringify(data);
  }

  let response;
  try {
    response = await fetch(url, options);

    // Check if response is valid
    if (!response) {
      throw new Error(&quot;No response received from server&quot;);
    }
  } catch (networkError) {
    console.error(`Network error fetching ${url}:`, networkError);
    const errorMessage = networkError.message || &quot;Network error with no message&quot;;
    throw new Error(`Network error: ${errorMessage}`);
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    // Try to parse error JSON, but handle the case where json() might not be available
    if (typeof response.json === &quot;function&quot;) {
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
          console.error(&quot;Failed to get error response text:&quot;, textError);
        }
      }
    } else {
      console.error(&quot;Response does not have json method:&quot;, response);
      // Try to get response as text
      try {
        const textError = await response.text();
        if (textError) {
          errorMessage += `: ${textError}`;
        }
      } catch (textError) {
        console.error(&quot;Failed to get error response text:&quot;, textError);
      }
    }

    throw new Error(errorMessage);
  }

  // For 204 No Content responses, return null
  if (response.status === 204) {
    return response;
  }

  // Check if the response has content before trying to parse JSON
  const contentLength = response.headers.get(&quot;content-length&quot;);
  if (contentLength === &quot;0&quot;) {
    return response;
  }

  // Handle the case where json() might not be available
  if (typeof response.json !== &quot;function&quot;) {
    console.error(&quot;Response does not have json method:&quot;, response);

    // Try to get response as text and parse it manually
    try {
      const text = await response.text();
      if (!text) {
        console.warn(&quot;Empty response text&quot;);
        return response;
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error(&quot;Failed to parse response text as JSON:&quot;, parseError);
        // Return the raw text in a structured format
        return {
          _raw: text,
          _parseError: true,
        };
      }
    } catch (textError) {
      console.error(&quot;Failed to get response text:&quot;, textError);
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
      console.log(&quot;Response text when JSON parsing failed:&quot;, text);

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
      console.error(&quot;Failed to get response text as fallback:&quot;, textError);
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
    const data = await apiRequest(&quot;GET&quot;, url);
    return { data };
  },

  async post(url: string, body?: any) {
    const data = await apiRequest(&quot;POST&quot;, url, body);
    return { data };
  },

  async put(url: string, body?: any) {
    const data = await apiRequest(&quot;PUT&quot;, url, body);
    return { data };
  },

  async patch(url: string, body?: any) {
    const data = await apiRequest(&quot;PATCH&quot;, url, body);
    return { data };
  },

  async delete(url: string) {
    const data = await apiRequest(&quot;DELETE&quot;, url);
    return { data };
  },
};
