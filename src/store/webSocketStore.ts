//--./src/store/webSocketStore.ts--
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Client, Frame, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  MessageResponse,
  MessageRequest,
  ConversationType,
  MessageStatus,
} from "@/types";
import { ApiError } from "@/types/errors";
import { useChatStore } from "./chatStore";
import { useErrorStore } from "./errorStore";

interface WebSocketConfig {
  URL: string;
  RECONNECT_DELAY: number;
  MAX_RETRIES: number;
  HEARTBEAT_INCOMING: number;
  HEARTBEAT_OUTGOING: number;
}

interface WebSocketState {
  // State
  client: Client | null;
  isConnected: boolean;
  isConnecting: boolean;
  subscriptions: Map<number, StompSubscription>;
  connectionError: string | null;
  retryCount: number;
  lastHeartbeat: number | null;

  // Connection management
  connect: (token: string) => void;
  disconnect: () => void;
  reconnect: (token: string) => void;

  // Message handling
  sendMessage: (
    message: MessageRequest,
    conversationType: ConversationType
  ) => void;
  subscribeToConversation: (
    conversationId: number,
    conversationType: ConversationType
  ) => () => void;
  unsubscribeFromConversation: (conversationId: number) => void;

  // Status management
  updateMessageStatus: (
    conversationId: number,
    messageId: number,
    status: MessageStatus
  ) => void;

  // Health checks
  checkConnection: () => boolean;
  resetState: () => void;
}

const WEBSOCKET_CONFIG: WebSocketConfig = {
  URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:8080/ws",
  RECONNECT_DELAY: 5000,
  MAX_RETRIES: 5,
  HEARTBEAT_INCOMING: 10000,
  HEARTBEAT_OUTGOING: 10000,
};

const INITIAL_STATE = {
  client: null,
  isConnected: false,
  isConnecting: false,
  subscriptions: new Map(),
  connectionError: null,
  retryCount: 0,
  lastHeartbeat: null,
};

export const useWebSocketStore = create<WebSocketState>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      connect: (token: string) => {
        const { client, isConnecting } = get();

        if (isConnecting) return;
        if (client) client.deactivate();

        set({ isConnecting: true });

        const newClient = new Client({
          webSocketFactory: () => new SockJS(WEBSOCKET_CONFIG.URL),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug:
            process.env.NODE_ENV === "development" ? console.debug : undefined,
          reconnectDelay: WEBSOCKET_CONFIG.RECONNECT_DELAY,
          heartbeatIncoming: WEBSOCKET_CONFIG.HEARTBEAT_INCOMING,
          heartbeatOutgoing: WEBSOCKET_CONFIG.HEARTBEAT_OUTGOING,

          onConnect: () => {
            set({
              isConnected: true,
              isConnecting: false,
              connectionError: null,
              retryCount: 0,
              lastHeartbeat: Date.now(),
            });

            // Process any queued messages
            useChatStore.getState().processQueue();
          },

          onDisconnect: () => {
            set((state) => ({
              isConnected: false,
              isConnecting: false,
              lastHeartbeat: null,
              retryCount: state.retryCount + 1,
            }));
          },

          onStompError: (frame: Frame) => {
            const { retryCount } = get();
            const error: ApiError = {
              name: "WebSocket Error",
              message: frame.headers["message"] || "STOMP Error",
              type: "websocket",
              title: "WebSocket Error",
              status: 1000,
              detail: `Connection ID: ${
                frame.headers["connection-id"]
              }, Error Code: ${frame.headers["error-code"] || "0"}`,
            };

            useErrorStore.getState().addError(error);

            if (retryCount < WEBSOCKET_CONFIG.MAX_RETRIES) {
              set({ retryCount: retryCount + 1 });
              setTimeout(
                () => get().reconnect(token),
                WEBSOCKET_CONFIG.RECONNECT_DELAY * Math.pow(2, retryCount)
              );
            } else {
              set({
                connectionError: `Max reconnection attempts reached: ${error.message}`,
                isConnected: false,
                isConnecting: false,
              });
            }
          },

          onWebSocketError: (event: Event) => {
            const error: ApiError = {
              name: "WebSocket Error",
              message: (event as ErrorEvent).message,
              type: "websocket",
              title: "WebSocket Error",
              status: 1001,
              detail: (event as ErrorEvent).message,
            };
            useErrorStore.getState().addError(error);
          },
        });

        newClient.activate();
        set({ client: newClient });
      },

      disconnect: () => {
        const { client } = get();
        if (client) {
          client.deactivate();
          set({ ...INITIAL_STATE });
        }
      },

      reconnect: (token: string) => {
        const { isConnecting, isConnected } = get();
        if (!isConnecting && !isConnected) {
          get().connect(token);
        }
      },

      sendMessage: (
        message: MessageRequest & { id: string },
        conversationType: ConversationType
      ) => {
        const { client, checkConnection } = get();

        if (!checkConnection()) {
          useChatStore
            .getState()
            .addToQueue({ ...message, id: crypto.randomUUID() });
          return;
        }

        const destination =
          conversationType === ConversationType.PRIVATE
            ? "/app/chat.sendPrivateMessage"
            : "/app/chat.sendGroupMessage";

        client!.publish({
          destination,
          body: JSON.stringify(message),
          headers: {
            "content-type": "application/json",
          },
        });
      },

      subscribeToConversation: (
        conversationId: number,
        conversationType: ConversationType
      ) => {
        const { client, checkConnection } = get();

        if (!checkConnection()) {
          const error: ApiError = {
            name: "WebSocket Error",
            message: "Cannot subscribe: WebSocket not connected",
            type: "websocket",
            title: "WebSocket Error",
            status: 1002,
          };
          useErrorStore.getState().addError(error);
          return () => {};
        }

        const destination =
          conversationType === ConversationType.PRIVATE
            ? `/queue/chat/${conversationId}`
            : `/topic/chat/${conversationId}`;

        // Unsubscribe from existing subscription
        get().unsubscribeFromConversation(conversationId);

        // Create new subscription
        const subscription = client!.subscribe(destination, (message) => {
          try {
            const parsedMessage = JSON.parse(message.body) as MessageResponse;
            useChatStore.getState().addMessage(conversationId, parsedMessage);
          } catch (error) {
            const wsError: ApiError = {
              name: "WebSocket Error",
              message: "Error parsing message",
              type: "websocket",
              title: "WebSocket Error",
              status: 1003,
              detail: error instanceof Error ? error.message : "Unknown error",
            };
            useErrorStore.getState().addError(wsError);
          }
        });

        // Store subscription
        set((state) => ({
          subscriptions: new Map(state.subscriptions).set(
            conversationId,
            subscription
          ),
        }));

        // Return unsubscribe function
        return () => get().unsubscribeFromConversation(conversationId);
      },

      unsubscribeFromConversation: (conversationId: number) => {
        const { subscriptions } = get();
        const subscription = subscriptions.get(conversationId);
        if (subscription) {
          subscription.unsubscribe();
          set((state) => {
            const newSubscriptions = new Map(state.subscriptions);
            newSubscriptions.delete(conversationId);
            return { subscriptions: newSubscriptions };
          });
        }
      },

      updateMessageStatus: (
        conversationId: number,
        messageId: number,
        status: MessageStatus
      ) => {
        const { client, checkConnection } = get();

        if (!checkConnection()) {
          const error: ApiError = {
            name: "WebSocket Error",
            message: "Cannot update message status: WebSocket not connected",
            type: "websocket",
            title: "WebSocket Error",
            status: 1004,
          };
          useErrorStore.getState().addError(error);
          return;
        }

        client!.publish({
          destination: "/app/chat.updateMessageStatus",
          body: JSON.stringify({ conversationId, messageId, status }),
          headers: {
            "content-type": "application/json",
          },
        });
      },

      checkConnection: () => {
        const { client, isConnected } = get();
        return Boolean(client && isConnected);
      },

      resetState: () => {
        set(INITIAL_STATE);
      },
    }),
    { name: "websocket-store" }
  )
);
