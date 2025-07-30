/**
 * WebSocket Event Subscription Hook
 *
 * This hook provides a React interface for WebSocket event subscriptions
 * and real-time updates from the distributed event bus.
 */

import { useEffect, useState, useCallback, useRef } from &quot;react&quot;;
import { AppEvent } from &quot;../../shared/events&quot;;

interface EventSocketOptions {
  // Automatically reconnect on disconnect
  autoReconnect?: boolean;
  // Reconnection delay in milliseconds
  reconnectDelay?: number;
  // Maximum number of reconnection attempts
  maxReconnectAttempts?: number;
  // Callback when connection is established
  onConnect?: () => void;
  // Callback when connection is closed
  onDisconnect?: (event: CloseEvent) => void;
  // Callback when an error occurs
  onError?: (error: Event) => void;
}

const defaultOptions: EventSocketOptions = {
  autoReconnect: true,
  reconnectDelay: 3000,
  maxReconnectAttempts: 5,
};

/**
 * React hook for WebSocket event subscriptions
 */
export function useEventSocket(
  eventTypes: AppEvent[],
  options: EventSocketOptions = {},
) {
  // Merge default options
  const opts = { ...defaultOptions, ...options };

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  // Array of received events
  const [events, setEvents] = useState<any[]>([]);
  // WebSocket instance
  const socketRef = useRef<WebSocket | null>(null);
  // Track reconnection attempts
  const reconnectAttemptsRef = useRef(0);
  // Track if the component is still mounted
  const isMountedRef = useRef(true);
  // Save subscribed event types
  const eventTypesRef = useRef<AppEvent[]>(eventTypes);
  // Track if we&apos;re currently attempting to connect
  const isConnectingRef = useRef(false);

  /**
   * Creates a new WebSocket connection
   */
  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current) {
      console.log(&quot;Connection attempt already in progress, skipping&quot;);
      return;
    }

    // Close existing connection if any
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      socketRef.current.close();
    }

    try {
      isConnectingRef.current = true;

      // Set a timeout to reset connecting state if it takes too long
      const connectingTimeout = setTimeout(() => {
        if (isConnectingRef.current) {
          console.log(&quot;WebSocket connection attempt timed out&quot;);
          isConnectingRef.current = false;
        }
      }, 5000); // 5 seconds timeout

      // Create WebSocket URL using the same protocol and host
      const protocol = window.location.protocol === &quot;https:&quot; ? &quot;wss:&quot; : &quot;ws:&quot;;
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log(&quot;Connecting to WebSocket at&quot;, wsUrl);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      // Clear the timeout when socket is opened
      socket.addEventListener(&quot;open&quot;, () => {
        clearTimeout(connectingTimeout);
      });

      // Connection opened
      socket.addEventListener(&quot;open&quot;, () => {
        if (!isMountedRef.current) return;

        console.log(&quot;WebSocket connection established&quot;);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;

        // Subscribe to the specified event types
        eventTypesRef.current.forEach((eventType) => {
          socket.send(
            JSON.stringify({
              type: &quot;subscribe&quot;,
              eventType,
            }),
          );
        });

        // Call onConnect callback if provided
        if (opts.onConnect) {
          opts.onConnect();
        }
      });

      // Connection closed
      socket.addEventListener(&quot;close&quot;, (event) => {
        if (!isMountedRef.current) return;

        console.log(&quot;WebSocket connection closed&quot;, event);
        setIsConnected(false);
        isConnectingRef.current = false;

        // Call onDisconnect callback if provided
        if (opts.onDisconnect) {
          opts.onDisconnect(event);
        }

        // Attempt to reconnect if enabled
        if (
          opts.autoReconnect &&
          reconnectAttemptsRef.current < (opts.maxReconnectAttempts || 5)
        ) {
          reconnectAttemptsRef.current += 1;
          const delay = opts.reconnectDelay || 3000;

          console.log(
            `Attempting to reconnect (${reconnectAttemptsRef.current}/${opts.maxReconnectAttempts}) in ${delay}ms`,
          );
          setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, delay);
        }
      });

      // Connection error
      socket.addEventListener(&quot;error&quot;, (error) => {
        if (!isMountedRef.current) return;

        console.error(&quot;WebSocket error:&quot;, error);
        isConnectingRef.current = false;

        // Call onError callback if provided
        if (opts.onError) {
          opts.onError(error);
        }
      });

      // Receive message
      socket.addEventListener(&quot;message&quot;, (event) => {
        if (!isMountedRef.current) return;

        try {
          const message = JSON.parse(event.data);

          // Handle different message types
          switch (message.type) {
            case &quot;event&quot;:
              // Add the event to our state
              setEvents((prev) => [message.data, ...prev].slice(0, 100));
              break;

            case &quot;subscription_confirmed&quot;:
              console.log(`Subscription confirmed for ${message.eventType}`);
              break;

            case &quot;pong&quot;:
              // Keep-alive response
              break;

            case &quot;error&quot;:
              console.error(&quot;WebSocket server error:&quot;, message.message);
              break;

            case &quot;system&quot;:
              console.log(&quot;System message:&quot;, message.message);
              break;

            default:
              console.log(&quot;Unknown message type:&quot;, message);
          }
        } catch (error) {
          console.error(&quot;Error parsing WebSocket message:&quot;, error);
        }
      });
    } catch (error) {
      console.error(&quot;Failed to create WebSocket connection:&quot;, error);
    }
  }, [opts]);

  /**
   * Send a ping to keep the connection alive
   */
  const ping = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: &quot;ping&quot;,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }, []);

  /**
   * Subscribe to a new event type
   */
  const subscribe = useCallback((eventType: AppEvent) => {
    // Add to our local tracking
    if (!eventTypesRef.current.includes(eventType)) {
      eventTypesRef.current = [...eventTypesRef.current, eventType];
    }

    // Send subscription request if connected
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: &quot;subscribe&quot;,
          eventType,
        }),
      );
    }
  }, []);

  /**
   * Unsubscribe from an event type
   */
  const unsubscribe = useCallback((eventType: AppEvent) => {
    // Remove from our local tracking
    eventTypesRef.current = eventTypesRef.current.filter(
      (type) => type !== eventType,
    );

    // Send unsubscribe request if connected
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: &quot;unsubscribe&quot;,
          eventType,
        }),
      );
    }
  }, []);

  /**
   * Manually reconnect
   */
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  /**
   * Update subscribed event types when the prop changes
   */
  useEffect(() => {
    // Update local ref
    eventTypesRef.current = eventTypes;

    // Update subscriptions if already connected
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      eventTypes.forEach((eventType) => {
        socketRef.current!.send(
          JSON.stringify({
            type: &quot;subscribe&quot;,
            eventType,
          }),
        );
      });
    }
  }, [eventTypes]);

  /**
   * Set up ping interval to keep connection alive
   */
  useEffect(() => {
    // Disabled aggressive pings that were causing excessive edge requests (2,880/day)
    // WebSocket should stay alive through natural activity
    // If needed, increase to 5+ minutes: setInterval(ping, 300000);
    
    // const pingInterval = setInterval(ping, 30000);
    // return () => {
    //   clearInterval(pingInterval);
    // };
  }, [ping]);

  /**
   * Initialize the connection and clean up on unmount
   */
  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;

      // Close the socket on unmount
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected,
    events,
    subscribe,
    unsubscribe,
    reconnect,
    ping,
  };
}
