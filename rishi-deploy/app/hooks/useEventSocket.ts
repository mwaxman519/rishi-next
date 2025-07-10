/**
 * WebSocket Event Subscription Hook
 *
 * This hook provides a React interface for WebSocket event subscriptions
 * and real-time updates from the distributed event bus.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { AppEvent } from "../../shared/events";

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
  // Track if we're currently attempting to connect
  const isConnectingRef = useRef(false);

  /**
   * Creates a new WebSocket connection
   */
  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current) {
      console.log("Connection attempt already in progress, skipping");
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
          console.log("WebSocket connection attempt timed out");
          isConnectingRef.current = false;
        }
      }, 5000); // 5 seconds timeout

      // Create WebSocket URL using the same protocol and host
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log("Connecting to WebSocket at", wsUrl);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      // Clear the timeout when socket is opened
      socket.addEventListener("open", () => {
        clearTimeout(connectingTimeout);
      });

      // Connection opened
      socket.addEventListener("open", () => {
        if (!isMountedRef.current) return;

        console.log("WebSocket connection established");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;

        // Subscribe to the specified event types
        eventTypesRef.current.forEach((eventType) => {
          socket.send(
            JSON.stringify({
              type: "subscribe",
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
      socket.addEventListener("close", (event) => {
        if (!isMountedRef.current) return;

        console.log("WebSocket connection closed", event);
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
      socket.addEventListener("error", (error) => {
        if (!isMountedRef.current) return;

        console.error("WebSocket error:", error);
        isConnectingRef.current = false;

        // Call onError callback if provided
        if (opts.onError) {
          opts.onError(error);
        }
      });

      // Receive message
      socket.addEventListener("message", (event) => {
        if (!isMountedRef.current) return;

        try {
          const message = JSON.parse(event.data);

          // Handle different message types
          switch (message.type) {
            case "event":
              // Add the event to our state
              setEvents((prev) => [message.data, ...prev].slice(0, 100));
              break;

            case "subscription_confirmed":
              console.log(`Subscription confirmed for ${message.eventType}`);
              break;

            case "pong":
              // Keep-alive response
              break;

            case "error":
              console.error("WebSocket server error:", message.message);
              break;

            case "system":
              console.log("System message:", message.message);
              break;

            default:
              console.log("Unknown message type:", message);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, [opts]);

  /**
   * Send a ping to keep the connection alive
   */
  const ping = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "ping",
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
          type: "subscribe",
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
          type: "unsubscribe",
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
            type: "subscribe",
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
    // Send a ping every 30 seconds to keep the connection alive
    const pingInterval = setInterval(ping, 30000);

    return () => {
      clearInterval(pingInterval);
    };
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
