import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageRequest, MessageResponse } from '@/types';

interface WebSocketState {
  client: Client | null;
  connected: boolean;
  messages: Record<string, MessageResponse[]>;
  connectionError: string | null;
  
  // Connection actions
  connect: (token: string) => void;
  disconnect: () => void;
  
  // Message actions
  addMessage: (conversationId: number, message: MessageResponse) => void;
  sendMessage: (message: Omit<MessageRequest, 'id' | 'timestamp'>) => void;
  
  // State management
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
}

// Create the Zustand store with WebSocket functionality
const useWebSocketStore = create<WebSocketState>((set, get) => ({
  client: null,
  connected: false,
  messages: {},
  connectionError: null,

  connect: (token: string) => {
    // Create a new STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.debug(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    // Set up connection handlers
    client.onConnect = () => {
      set({ connected: true, connectionError: null });
      
      // Subscribe to user-specific channel for private messages
      client.subscribe('/user/queue/messages', (message) => {
        const receivedMessage = JSON.parse(message.body);
        get().addMessage(receivedMessage.conversationId, receivedMessage);
      });
    };

    client.onDisconnect = () => {
      set({ connected: false });
    };

    client.onStompError = (frame) => {
      set({ connectionError: frame.headers.message });
    };

    // Activate the client connection
    client.activate();
    set({ client });
  },

  disconnect: () => {
    const { client } = get();
    if (client) {
      client.deactivate();
      set({ client: null, connected: false });
    }
  },

  addMessage: (conversationId: number, message: MessageResponse) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          message,
        ],
      },
    }));
  },

  sendMessage: (message) => {
    const { client, connected } = get();
    if (!client || !connected) {
      set({ connectionError: 'Not connected to server' });
      return;
    }

    client.publish({
      destination: '/app/chat.sendPrivateMessage',
      body: JSON.stringify(message),
    });

    // Optimistically add the message to the store
    get().addMessage(message.conversationId, message);
  },

  setConnected: (connected: boolean) => set({ connected }),
  setError: (error: string | null) => set({ connectionError: error }),
}));

export default useWebSocketStore;