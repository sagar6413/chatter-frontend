//--./src/hooks/useWebSocket.ts--
import { useCallback, useEffect, useState } from "react";
import { useWebSocketStore } from "@/store/webSocketStore";
import { WebSocketError } from "@/types/errors";
import { useError } from "./useError";
import { MessageRequest, ConversationType } from "@/types";

const MAX_RETRIES = 5;
const MAX_RETRY_DELAY = 30000; // 30 seconds
const INITIAL_RETRY_DELAY = 1000; // 1 second

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  lastError: WebSocketError | null;
  retryCount: number;
  retryTimeout: number | null;
}

interface WebSocketHookReturn extends WebSocketState {
  connect: (token: string) => void;
  disconnect: () => void;
  resetError: () => void;
  sendMessage: (message: MessageRequest, type: ConversationType) => void;
  subscribeToConversation: (
    conversationId: number,
    type: ConversationType
  ) => () => void;
}

const createWebSocketError = (
  message: string,
  type = "error:websocket"
): WebSocketError => {
  const error = new Error(message) as WebSocketError;
  error.name = "WebSocketError";
  error.type = type;
  error.title = "WebSocket Error";
  error.status = 1001;
  error.timestamp = new Date().toISOString();
  return error;
};

export function useWebSocket(
  token?: string,
  autoConnect = true
): WebSocketHookReturn {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    lastError: null,
    retryCount: 0,
    retryTimeout: null,
  });

  const { handleError } = useError();
  const webSocketStore = useWebSocketStore();

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, lastError: null }));
  }, []);

  const handleWebSocketError = useCallback(
    (error: WebSocketError) => {
      setState((prev) => ({ ...prev, lastError: error }));
      handleError(error, "websocket");

      // Implement reconnection logic if appropriate
      if (error.type === "connection" && state.retryCount < MAX_RETRIES) {
        const timeout = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, state.retryCount),
          MAX_RETRY_DELAY
        );

        const retryTimeout = window.setTimeout(() => {
          if (token) {
            connect(token);
          }
        }, timeout);

        setState((prev) => ({
          ...prev,
          retryTimeout,
          retryCount: prev.retryCount + 1,
        }));
      }
    },
    [state.retryCount, handleError, token]
  );

  const connect = useCallback(
    (connectionToken: string) => {
      if (state.isConnecting || state.isConnected) return;

      setState((prev) => ({ ...prev, isConnecting: true }));

      try {
        webSocketStore.connect(connectionToken);
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          retryCount: 0,
          lastError: null,
        }));
      } catch (error) {
        handleWebSocketError(error as WebSocketError);
        setState((prev) => ({ ...prev, isConnecting: false }));
      }
    },
    [
      state.isConnecting,
      state.isConnected,
      webSocketStore,
      handleWebSocketError,
    ]
  );

  const disconnect = useCallback(() => {
    if (state.retryTimeout) {
      clearTimeout(state.retryTimeout);
    }

    webSocketStore.disconnect();
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      retryTimeout: null,
    }));
  }, [state.retryTimeout, webSocketStore]);

  const sendMessage = useCallback(
    (message: MessageRequest, type: ConversationType) => {
      if (!state.isConnected) {
        const error = createWebSocketError(
          "Cannot send message: WebSocket not connected"
        );
        handleWebSocketError(error);
        return;
      }

      try {
        webSocketStore.sendMessage(message, type);
      } catch (err) {
        if (err instanceof Error) {
          const error = createWebSocketError(err.message);
          handleWebSocketError(error);
        }
      }
    },
    [state.isConnected, webSocketStore, handleWebSocketError]
  );

  const subscribeToConversation = useCallback(
    (conversationId: number, type: ConversationType) => {
      if (!state.isConnected) {
        const error = createWebSocketError(
          "Cannot subscribe: WebSocket not connected"
        );
        handleWebSocketError(error);
        return () => {};
      }

      try {
        return webSocketStore.subscribeToConversation(conversationId, type);
      } catch (err) {
        if (err instanceof Error) {
          const error = createWebSocketError(err.message);
          handleWebSocketError(error);
        }
        return () => {};
      }
    },
    [state.isConnected, webSocketStore, handleWebSocketError]
  );

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect && token && !state.isConnected && !state.isConnecting) {
      connect(token);
    }

    return () => {
      if (state.retryTimeout) {
        clearTimeout(state.retryTimeout);
      }
    };
  }, [autoConnect, token, state.isConnected, state.isConnecting, connect]);

  return {
    ...state,
    connect,
    disconnect,
    resetError,
    sendMessage,
    subscribeToConversation,
  };
}
