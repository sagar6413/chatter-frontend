//--./src/hooks/useChat.ts--
import { useEffect } from "react";
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

export function useChat(conversationId: number, type: ConversationType) {
  const messages = useConversationMessages(conversationId);
  const conversation = useConversation(conversationId, type);
  const { subscribeToConversation, connected } = useWebSocketSubscription();
  const { updateMessageStatus } = useChatActions();
  const sendMessage = useWebSocketStore((state) => state.sendMessage);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (connected) {
      const unsubscribe = subscribeToConversation(conversationId, type);
      return () => unsubscribe();
    }
  }, [connected, conversationId, type, subscribeToConversation]);

  const send = async (content: string) => {
    const message: MessageRequest = {
      conversationId,
      content,
      type: MessageType.TEXT,
      mediaIds: new Set(),
    };

    sendMessage(message, type);
  };

  const markAsRead = (messageId: number) => {
    if (!user) return;
    updateMessageStatus(
      conversationId,
      messageId,
      user.username,
      MessageStatus.READ
    );
  };

  return {
    messages,
    conversation,
    send,
    markAsRead,
    connected,
  };
}
