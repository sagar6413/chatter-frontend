//--./src/hooks/useChat.ts--
import { useEffect, useCallback, useMemo, useState } from "react";
import {
  ConversationType,
  MessageRequest,
  MessageType,
  MessageStatus,
} from "@/types";
import {
  useConversationMessages,
  useWebSocketSubscription,
  useChatActions,
  useConversation,
} from "@/store/selectors";
import { useWebSocketStore } from "@/store/webSocketStore";
import { useUserStore } from "@/store/userStore";
import { useError } from "./useError";
import { useMessageQueueStore } from "@/store/messageQueueStore";

interface ChatHookReturn {
  messages: ReturnType<typeof useConversationMessages>;
  conversation: ReturnType<typeof useConversation>;
  send: (content: string, mediaIds?: Set<string>) => void;
  markAsRead: (messageId: number) => void;
  isConnected: boolean;
  isConnecting: boolean;
  hasUnreadMessages: boolean;
  isTyping: boolean;
  setTyping: (typing: boolean) => void;
  retryFailedMessage: (messageId: string) => void;
  deleteMessage: (messageId: number) => void;
  editMessage: (messageId: number, newContent: string) => void;
}

/**
 * Enhanced chat hook that provides messaging functionality with error handling,
 * message queueing, typing indicators, and message management
 */
export function useChat(
  conversationId: number,
  type: ConversationType
): ChatHookReturn {
  const messages = useConversationMessages(conversationId);
  const conversation = useConversation(conversationId, type);
  const { subscribeToConversation } = useWebSocketSubscription();
  const { updateMessageStatus } = useChatActions();
  const { isConnected, isConnecting } = useWebSocketStore();
  const user = useUserStore((state) => state.user);
  const { handleError } = useError();
  const { addToQueue, retryMessage } = useMessageQueueStore();

  // Subscribe to conversation updates
  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribeToConversation(conversationId, type);
      return () => unsubscribe();
    }
  }, [isConnected, conversationId, type, subscribeToConversation]);

  // Enhanced message sending with queueing
  const send = useCallback(
    (content: string, mediaIds: Set<string> = new Set()) => {
      if (!user) {
        handleError(new Error("User not authenticated"), "auth");
        return;
      }

      const message: MessageRequest = {
        conversationId,
        content,
        type: MessageType.TEXT,
        mediaIds,
      };

      try {
        if (!isConnected) {
          addToQueue(message, type);
          return;
        }

        useWebSocketStore.getState().sendMessage(message, type);
      } catch (error) {
        handleError(error, "websocket");
        addToQueue(message, type);
      }
    },
    [conversationId, type, user, isConnected, addToQueue, handleError]
  );

  // Message status management
  const markAsRead = useCallback(
    (messageId: number) => {
      if (!user) return;
      try {
        updateMessageStatus(
          conversationId,
          messageId,
          user.username,
          MessageStatus.READ
        );
      } catch (error) {
        handleError(error, "websocket");
      }
    },
    [conversationId, updateMessageStatus, user, handleError]
  );

  // Typing indicator management
  const [isTyping, setTyping] = useState(false);
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => setTyping(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  // Computed values
  const hasUnreadMessages = useMemo(
    () =>
      messages.some(
        (msg) => msg.senderId !== user?.id && msg.status !== MessageStatus.READ
      ),
    [messages, user?.id]
  );

  // Message management
  const retryFailedMessage = useCallback(
    (messageId: string) => {
      try {
        retryMessage(messageId);
      } catch (error) {
        handleError(error, "websocket");
      }
    },
    [retryMessage, handleError]
  );

  // Message deletion through WebSocket
  const handleDeleteMessage = useCallback(
    (messageId: number) => {
      try {
        useWebSocketStore.getState().sendMessage(
          {
            conversationId,
            content: messageId.toString(),
            type: MessageType.SYSTEM,
            mediaIds: new Set(),
          },
          type
        );
      } catch (error) {
        handleError(error, "websocket");
      }
    },
    [conversationId, type, handleError]
  );

  // Message editing through WebSocket
  const handleEditMessage = useCallback(
    (messageId: number, newContent: string) => {
      try {
        useWebSocketStore.getState().sendMessage(
          {
            conversationId,
            content: JSON.stringify({ messageId, content: newContent }),
            type: MessageType.SYSTEM,
            mediaIds: new Set(),
          },
          type
        );
      } catch (error) {
        handleError(error, "websocket");
      }
    },
    [conversationId, type, handleError]
  );

  return {
    messages,
    conversation,
    send,
    markAsRead,
    isConnected,
    isConnecting,
    hasUnreadMessages,
    isTyping,
    setTyping,
    retryFailedMessage,
    deleteMessage: handleDeleteMessage,
    editMessage: handleEditMessage,
  };
}
