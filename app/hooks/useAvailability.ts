import { useState, useEffect, useCallback, useRef } from &quot;react&quot;;
import debounce from &quot;lodash/debounce&quot;;
import { AvailabilityDTO } from &quot;../models/availability&quot;;

export function useAvailability(
  userId: number,
  startDate: string,
  endDate: string,
) {
  const [availability, setAvailability] = useState<AvailabilityDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Using useRef to maintain a reference to the current props without triggering re-renders
  const paramsRef = useRef({ userId, startDate, endDate });

  // Update params ref when props change
  useEffect(() => {
    paramsRef.current = { userId, startDate, endDate };
  }, [userId, startDate, endDate]);

  // Create a stable version of the fetch function with debounce
  const fetchAvailability = useCallback(
    debounce(async () => {
      // Skip fetching if component is unmounted
      if (!isMounted.current) return;

      try {
        setLoading(true);

        // Use the values from the ref to ensure we have the latest props
        const { userId, startDate, endDate } = paramsRef.current;

        console.log(
          `useAvailability: Fetching for user ${userId} from ${startDate} to ${endDate}`,
        );

        const response = await fetch(
          `/api/availability?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
          {
            headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
            // Disable caching during development
            cache: &quot;no-store&quot;,
          },
        );

        // Skip processing if component unmounted during fetch
        if (!isMounted.current) return;

        if (!response.ok) {
          throw new Error(
            `Failed to fetch availability (Status: ${response.status})`,
          );
        }

        const data = await response.json();

        // Skip updating state if component unmounted during fetch
        if (!isMounted.current) return;

        console.log(
          `useAvailability: Received ${Array.isArray(data) ? data.length : 0} blocks`,
        );

        // Handle both direct array and wrapped response formats
        if (Array.isArray(data)) {
          setAvailability(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setAvailability(data.data);
        } else {
          setAvailability([]);
        }

        setError(null);
      } catch (err) {
        // Skip updating error state if component unmounted
        if (!isMounted.current) return;

        console.error(&quot;useAvailability hook error:&quot;, err);
        setError(
          err instanceof Error
            ? err.message
            : &quot;Unknown error fetching availability&quot;,
        );
        setAvailability([]);
      } finally {
        // Skip updating loading state if component unmounted
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }, 300), // Reduced debounce time for better responsiveness
    [], // Empty dependency array makes this callback stable across renders
  );

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;

    // Initial fetch
    fetchAvailability();

    // Cleanup function
    return () => {
      isMounted.current = false;
      fetchAvailability.cancel();
    };
  }, [fetchAvailability]);

  // Trigger fetch when params change
  useEffect(() => {
    fetchAvailability();
  }, [userId, startDate, endDate, fetchAvailability]);

  return { availability, loading, error };
}
