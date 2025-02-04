import { Client, type Message, type Frame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useErrorStore } from "@/store/errorStore";

class WebSocketService {
  private client: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  constructor() {
    this.setupClient();
  }

  private setupClient() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_WS_URL || ""),
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: this.handleConnect,
      onStompError: this.handleStompError,
      onWebSocketError: this.handleWebSocketError,
      onWebSocketClose: this.handleWebSocketClose,
    });
  }

  private handleConnect = () => {
    console.log("Connected to WebSocket");
    this.reconnectAttempts = 0;
  };

  private handleStompError = (frame: Frame) => {
    const errorStore = useErrorStore.getState();
    errorStore.addError({
      type: "websocket:stomp",
      title: "WebSocket STOMP Error",
      status: 500,
      detail: frame.headers?.message || "STOMP protocol error",
      name: "StompError",
      message: frame.headers?.message || "STOMP protocol error",
      timestamp: new Date().toISOString(),
      properties: {
        headers: frame.headers,
        command: frame.command,
      },
    });
  };

  private handleWebSocketError = (event: Event) => {
    const errorStore = useErrorStore.getState();
    errorStore.addError({
      type: "websocket:connection",
      title: "WebSocket Connection Error",
      status: 500,
      detail: "Failed to connect to WebSocket server",
      name: "WebSocketError",
      message: "WebSocket connection error",
      timestamp: new Date().toISOString(),
      properties: {
        event,
      },
    });

    this.handleReconnect();
  };

  private handleWebSocketClose = () => {
    console.log("WebSocket connection closed");
    this.handleReconnect();
  };

  private handleReconnect = () => {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      const errorStore = useErrorStore.getState();
      errorStore.addError({
        type: "websocket:maxRetries",
        title: "WebSocket Connection Failed",
        status: 500,
        detail: "Maximum reconnection attempts reached",
        name: "WebSocketMaxRetriesError",
        message:
          "Failed to establish WebSocket connection after maximum retries",
        timestamp: new Date().toISOString(),
        properties: {
          attempts: this.reconnectAttempts,
          maxAttempts: this.maxReconnectAttempts,
        },
      });
    }
  };

  public connect() {
    if (this.client && !this.client.active) {
      this.client.activate();
    }
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }

  public subscribe(destination: string, callback: (message: Message) => void) {
    if (!this.client?.active) {
      throw new Error("WebSocket is not connected");
    }

    return this.client.subscribe(destination, callback);
  }

  public send<T>(destination: string, body: T) {
    if (!this.client?.active) {
      throw new Error("WebSocket is not connected");
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}

export const webSocketService = new WebSocketService();
