import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";
import { MessageRequest, ConversationType } from "@/types";
import { useError } from "./useError";
import { useWebSocketStore } from "@/store/webSocketStore";

interface SearchState {
  results: MessageRequest[];
  isSearching: boolean;
  error: Error | null;
}

interface MessageSearchReturn extends SearchState {
  query: string;
  setQuery: (query: string) => void;
  clearSearch: () => void;
}

export function useMessageSearch(
  conversationId: number,
  type: ConversationType
): MessageSearchReturn {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({
    results: [],
    isSearching: false,
    error: null,
  });

  const debouncedQuery = useDebounce(query, 300);
  const { handleError } = useError();
  const webSocketStore = useWebSocketStore();

  const searchMessages = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setState((prev) => ({ ...prev, results: [], isSearching: false }));
        return;
      }

      setState((prev) => ({ ...prev, isSearching: true, error: null }));

      try {
        const results = await webSocketStore.searchMessages(
          conversationId,
          type,
          searchQuery
        );

        setState((prev) => ({
          ...prev,
          results,
          isSearching: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isSearching: false,
        }));
        handleError(error, "api");
      }
    },
    [conversationId, type, handleError, webSocketStore]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setState((prev) => ({ ...prev, results: [], error: null }));
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    searchMessages(debouncedQuery);
  }, [debouncedQuery, searchMessages]);

  return {
    ...state,
    query,
    setQuery,
    clearSearch,
  };
}
