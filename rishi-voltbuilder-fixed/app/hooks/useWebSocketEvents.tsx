"use client";

import { useEffect, useCallback } from "react";

export interface NotificationOptions {
  duration?: number;
  type?: "info" | "success" | "warning" | "error";
}

export interface NotificationEvent {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  data?: any;
}

/**
 * @deprecated Use useNotificationEvents instead
 */
export function useWebSocketEvents(options: NotificationOptions = {}) {
  const connect = useCallback(() => {
    return Promise.resolve();
  }, []);

  const disconnect = useCallback(() => {
    // No-op for backward compatibility
  }, []);

  const subscribe = useCallback(
    (eventType: string, handler: (event: NotificationEvent) => void) => {
      return () => {}; // Return unsubscribe function
    },
    [],
  );

  const publish = useCallback((event: NotificationEvent) => {
    // No-op for backward compatibility
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup
    };
  }, []);

  return {
    connect,
    disconnect,
    subscribe,
    publish,
    isConnected: false,
  };
}

export function useNotificationEvents(options: NotificationOptions = {}) {
  return useWebSocketEvents(options);
}

// Re-export the types for backward compatibility
export type { NotificationOptions, NotificationEvent as WebSocketEvent };
