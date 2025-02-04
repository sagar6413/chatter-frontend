//--./src/util/webSocketUtils.ts--
import { Client, Frame, Message, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useErrorStore } from "@/store/errorStore";
import { WebSocketError } from "@/types/errors";

export class WebSocketClient {
  private client: Client;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private connectionId: string;
  private subscriptions: Map<string, StompSubscription>;

  constructor(url: string, token?: string) {
    this.connectionId = crypto.randomUUID();
    this.subscriptions = new Map();

    const connectHeaders: { [key: string]: string } = {
      connectionId: this.connectionId,
    };
    if (token) {
      connectHeaders["Authorization"] = `Bearer ${token}`; // Add Authorization header if token exists
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(url),
      connectHeaders: {
        connectionId: this.connectionId,
      },
      debug: (str) => {
        if (process.env.NODE_ENV === "development") {
          console.debug(`[WebSocket ${this.connectionId}]:`, str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    const errorStore = useErrorStore.getState();

    this.client.onStompError = (frame: Frame) => {
      const error: WebSocketError = {
        type: "websocket:stomp",
        title: "STOMP Protocol Error",
        status: 1000,
        detail: frame.body,
        timestamp: new Date().toISOString(),
        connectionId: this.connectionId,
        name: "STOMPError",
        message: frame.body || "STOMP protocol error occurred",
        properties: {
          headers: frame.headers,
          command: frame.command,
        },
      };

      errorStore.addError(error);
    };

    this.client.onWebSocketError = (event: Event) => {
      this.reconnectAttempts++;

      const error: WebSocketError = {
        type: "websocket:connection",
        title: "WebSocket Connection Error",
        status: 1001,
        detail: "Failed to connect to WebSocket server",
        timestamp: new Date().toISOString(),
        connectionId: this.connectionId,
        name: "WebSocketError",
        message: "Failed to connect to WebSocket server",
        attemptCount: this.reconnectAttempts,
        lastAttemptTime: new Date().toISOString(),
        properties: {
          eventType: event.type,
          maxAttempts: this.maxReconnectAttempts,
        },
      };

      errorStore.addError(error);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.handleMaxRetriesExceeded();
      }
    };
  }

  private handleMaxRetriesExceeded() {
    const errorStore = useErrorStore.getState();
    errorStore.addError({
      type: "websocket:maxRetries",
      title: "Connection Failed",
      status: 1002,
      detail: "Maximum reconnection attempts reached",
      timestamp: new Date().toISOString(),
      name: "MaxRetriesError",
      message: "Maximum reconnection attempts reached",
      properties: {
        maxAttempts: this.maxReconnectAttempts,
      },
    });

    this.disconnect();
  }

  public connect(): void {
    this.client.activate();
  }

  public disconnect(): void {
    this.subscriptions.clear();
    this.client.deactivate();
  }

  public subscribe(
    destination: string,
    callback: (message: Message) => void
  ): () => void {
    const subscription = this.client.subscribe(destination, callback);
    this.subscriptions.set(destination, subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  public getConnectionState(): "CONNECTED" | "CONNECTING" | "DISCONNECTED" {
    return this.client.connected
      ? "CONNECTED"
      : this.client.active
      ? "CONNECTING"
      : "DISCONNECTED";
  }
}
