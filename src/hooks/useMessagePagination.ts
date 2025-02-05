import { useCallback, useEffect, useState } from "react";
import { useWebSocketStore } from "@/store/webSocketStore";
import { MessageRequest, ConversationType } from "@/types";
import { useError } from "./useError";

const PAGE_SIZE = 20;

interface PaginationState {
  messages: MessageRequest[];
  isLoading: boolean;
  hasMore: boolean;
  error: Error | null;
  page: number;
}

interface MessagePaginationReturn extends PaginationState {
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (messageId: number) => void;
}

export function useMessagePagination(
  conversationId: number,
  type: ConversationType
): MessagePaginationReturn {
  const [state, setState] = useState<PaginationState>({
    messages: [],
    isLoading: false,
    hasMore: true,
    error: null,
    page: 1,
  });

  const { handleError } = useError();
  const webSocketStore = useWebSocketStore();

  const fetchMessages = useCallback(
    async (page: number, refresh = false) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await webSocketStore.fetchMessages(
          conversationId,
          type,
          page,
          PAGE_SIZE
        );

        setState((prev) => ({
          ...prev,
          messages: refresh
            ? response.messages
            : [...prev.messages, ...response.messages],
          hasMore: response.messages.length === PAGE_SIZE,
          page: page,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
        handleError(error, "api");
      }
    },
    [conversationId, type, handleError, webSocketStore]
  );

  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore) return;
    await fetchMessages(state.page + 1);
  }, [state.isLoading, state.hasMore, state.page, fetchMessages]);

  const refresh = useCallback(async () => {
    await fetchMessages(1, true);
  }, [fetchMessages]);

  const markAsRead = useCallback((messageId: number) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status: "READ" } : msg
      ),
    }));
  }, []);

  // Initial load
  useEffect(() => {
    fetchMessages(1, true);
  }, [fetchMessages]);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = webSocketStore.subscribe(
      `/topic/conversation.${conversationId}`,
      (message: MessageRequest) => {
        setState((prev) => ({
          ...prev,
          messages: [message, ...prev.messages],
        }));
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [conversationId, webSocketStore]);

  return {
    ...state,
    loadMore,
    refresh,
    markAsRead,
  };
}
