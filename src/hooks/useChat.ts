import { useCallback, useEffect } from "react";
import { useWebSocketStore } from "@/store/webSocketStore";
import { MessageRequest, ConversationType, MessageType } from "@/types/index";
import { useMessageStore } from "@/store/messageStore";

interface UseChatProps {
  conversationId: number;
  conversationType: ConversationType;
}

export const useChat = ({ conversationId, conversationType }: UseChatProps) => {
  const {
    sendMessage: sendWebSocketMessage,
    subscribeToConversation,
    connected,
  } = useWebSocketStore();

  const {
    loading,
    loadingMore,
    loadInitialMessages,
    loadMoreMessages,
    addMessage,
  } = useMessageStore();

  useEffect(() => {
    loadInitialMessages(conversationId);

    return () => {
      // Optional: Clear messages when leaving conversation
      // messageStore.clearMessages(conversationId)
    };
  }, [conversationId, loadInitialMessages]);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribeToConversation(
      conversationId,
      conversationType,
      (message) => {
        addMessage(conversationId, message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [
    conversationId,
    connected,
    subscribeToConversation,
    conversationType,
    addMessage,
  ]);

  const sendMessage = useCallback(
    async (content: string) => {
      const message: MessageRequest = {
        conversationId,
        content,
        type: MessageType.TEXT,
        mediaIds: new Set(),
      };

      sendWebSocketMessage(message, conversationType);
    },
    [conversationId, conversationType, sendWebSocketMessage]
  );

  return {
    loading,
    loadingMore,
    sendMessage,
    loadMoreMessages: () => loadMoreMessages(conversationId),
  };
};
