import { useCallback } from "react";
import { useError } from "./useError";
import { WebSocketError } from "@/types/errors";

export function useWebSocketError() {
  const { handleError } = useError();

  const handleConnectionError = useCallback(
    (error: Error, connectionId: string) => {
      const wsError: WebSocketError = {
        type: "websocket:connection",
        title: "WebSocket Connection Error",
        status: 500,
        detail: error.message || "Failed to connect to WebSocket server",
        name: error.name || "WebSocketError",
        message: error.message || "WebSocket connection error",
        timestamp: new Date().toISOString(),
        connectionId,
        properties: {
          error,
        },
      };
      handleError(wsError, "websocket");
    },
    [handleError]
  );

  const handleMessageError = useCallback(
    (error: Error, topic: string) => {
      const wsError: WebSocketError = {
        type: "websocket:message",
        title: "WebSocket Message Error",
        status: 500,
        detail: error.message || "Failed to process WebSocket message",
        name: error.name || "WebSocketMessageError",
        message: error.message || "WebSocket message error",
        timestamp: new Date().toISOString(),
        properties: {
          error,
          topic,
        },
      };
      handleError(wsError, "websocket");
    },
    [handleError]
  );

  const handleSubscriptionError = useCallback(
    (error: Error, topic: string) => {
      const wsError: WebSocketError = {
        type: "websocket:subscription",
        title: "WebSocket Subscription Error",
        status: 500,
        detail: error.message || "Failed to subscribe to topic",
        name: error.name || "WebSocketSubscriptionError",
        message: error.message || "WebSocket subscription error",
        timestamp: new Date().toISOString(),
        properties: {
          error,
          topic,
        },
      };
      handleError(wsError, "websocket");
    },
    [handleError]
  );

  return {
    handleConnectionError,
    handleMessageError,
    handleSubscriptionError,
  };
}
