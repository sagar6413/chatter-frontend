# WebSocket Implementation for Real-Time Chat Application
## Frontend Technical Documentation with Zustand Integration

### Overview
This document outlines the implementation strategy for WebSocket functionality in our Next.js 15 frontend application, integrated with Zustand for state management. This approach combines the real-time capabilities of WebSocket with Zustand's simple yet powerful state management, ensuring efficient updates and consistent state across the application.

### Technical Architecture

#### Zustand Store Configuration
We'll create a WebSocket store using Zustand that manages both the connection state and message handling:

```typescript
// src/store/websocketStore.ts
import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  timestamp: Date;
}

interface WebSocketState {
  client: Client | null;
  connected: boolean;
  messages: Record<string, Message[]>;
  connectionError: string | null;
  
  // Connection actions
  connect: (token: string) => void;
  disconnect: () => void;
  
  // Message actions
  addMessage: (conversationId: string, message: Message) => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  
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

  addMessage: (conversationId: string, message: Message) => {
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

    const fullMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    client.publish({
      destination: '/app/chat.sendPrivateMessage',
      body: JSON.stringify(fullMessage),
    });

    // Optimistically add the message to the store
    get().addMessage(message.conversationId, fullMessage);
  },

  setConnected: (connected: boolean) => set({ connected }),
  setError: (error: string | null) => set({ connectionError: error }),
}));

export default useWebSocketStore;
```

### Chat Components Implementation
Here's how to implement chat components using the Zustand store:

```typescript
// src/components/Chat/ChatRoom.tsx
import { useEffect } from 'react';
import useWebSocketStore from '@/store/websocketStore';

interface ChatRoomProps {
  conversationId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ conversationId }) => {
  const { messages, connected, sendMessage } = useWebSocketStore();
  const conversationMessages = messages[conversationId] || [];

  // Handle message sending
  const handleSendMessage = (content: string) => {
    sendMessage({
      content,
      conversationId,
      senderId: 'current-user-id', // Replace with actual user ID
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {conversationMessages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <MessageInput onSend={handleSendMessage} disabled={!connected} />
    </div>
  );
};
```

### Connection Management Hook
Create a custom hook to manage WebSocket connections using the Zustand store:

```typescript
// src/hooks/useWebSocketConnection.ts
import { useEffect } from 'react';
import useWebSocketStore from '@/store/websocketStore';

export const useWebSocketConnection = (token: string) => {
  const { connect, disconnect, connected, connectionError } = useWebSocketStore();

  useEffect(() => {
    if (token) {
      connect(token);
      
      return () => {
        disconnect();
      };
    }
  }, [token, connect, disconnect]);

  return { connected, connectionError };
};
```

### Global WebSocket Provider
Create a provider component to initialize WebSocket connection:

```typescript
// src/providers/WebSocketProvider.tsx
import { useSession } from 'next-auth/react';
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const { connected, connectionError } = useWebSocketConnection(session?.token);

  // You might want to show a connection status indicator
  return (
    <>
      {connectionError && (
        <div className="fixed top-0 w-full bg-red-500 text-white p-2 text-center">
          Connection Error: {connectionError}
        </div>
      )}
      {children}
    </>
  );
};
```

### Message Queue Implementation with Zustand
Implement message queuing for handling disconnections:

```typescript
// src/store/messageQueueStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QueuedMessage {
  id: string;
  message: any;
  timestamp: number;
  attempts: number;
}

interface MessageQueueState {
  queue: QueuedMessage[];
  addToQueue: (message: any) => void;
  removeFromQueue: (id: string) => void;
  processQueue: () => void;
}

const useMessageQueueStore = create<MessageQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      
      addToQueue: (message) => {
        set((state) => ({
          queue: [...state.queue, {
            id: crypto.randomUUID(),
            message,
            timestamp: Date.now(),
            attempts: 0,
          }],
        }));
      },
      
      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        }));
      },
      
      processQueue: async () => {
        const { queue } = get();
        const websocketStore = useWebSocketStore.getState();
        
        if (!websocketStore.connected) return;
        
        for (const item of queue) {
          try {
            await websocketStore.sendMessage(item.message);
            get().removeFromQueue(item.id);
          } catch (error) {
            set((state) => ({
              queue: state.queue.map((qItem) =>
                qItem.id === item.id
                  ? { ...qItem, attempts: qItem.attempts + 1 }
                  : qItem
              ),
            }));
          }
        }
      },
    }),
    {
      name: 'message-queue-storage',
    }
  )
);
```

### State Selectors and Performance Optimization
Implement selective state updates to prevent unnecessary rerenders:

```typescript
// src/store/selectors.ts
import useWebSocketStore from './websocketStore';

export const useConversationMessages = (conversationId: string) => 
  useWebSocketStore((state) => state.messages[conversationId] || []);

export const useConnectionStatus = () =>
  useWebSocketStore((state) => ({
    connected: state.connected,
    error: state.connectionError,
  }));
```

### Error Boundary Implementation
Create an error boundary specific to WebSocket operations:

```typescript
// src/components/WebSocketErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import useWebSocketStore from '@/store/websocketStore';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WebSocketErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebSocket error:', error, errorInfo);
    useWebSocketStore.getState().setError(error.message);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700">
          <h2>WebSocket Connection Error</h2>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              useWebSocketStore.getState().connect(
                // Retrieve token from your auth system
                localStorage.getItem('token') || ''
              );
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Try Reconnecting
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Usage in Next.js Application

Add the WebSocket provider to your app:

```typescript
// src/app/providers.tsx
import { WebSocketProvider } from '@/providers/WebSocketProvider';
import { WebSocketErrorBoundary } from '@/components/WebSocketErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketErrorBoundary>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </WebSocketErrorBoundary>
  );
}
```